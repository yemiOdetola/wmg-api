const httpStatus = require('http-status');
const AHP = require('ahp');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const model = require('./regression_model.json');
// const rawModel = fs.readFileSync(modelFilePath, 'utf8');
// const model = JSON.parse(rawModel);

const { listingService, userService, emailService } = require('../services');

const recycler = {
  _id: "64999ae16e2c8fd88e3ef51d",
  name: "Test recycler",
  phone: "08119775439",
  email: "rectest@gmail.com",
  threshold: 120,
  company: "Testing company",
  category: ["textitle", "paper", "generic"],
  preference: ["Distance", "Price", "Quantity"],
  distance: 90,
  location: [3.3576195873320103, 6.533973328041524],
  avatar: "https://avatars.dicebear.com/api/avataaars/923.png",
  password: "$2a$08$H0h1nSAaaYoEaMlhYXPQReFRLw9G8kfkUzEPB.lBAW6OSWcPRO7h2",
  role: "recycler",
  isEmailVerified: false,
  createdAt: "2023-06-26T14:04:17.536+00:00",
  updatedAt: "2023-06-26T14:04:17.536+00:00",
}

const degToRad = (degrees) => {
  return degrees * (Math.PI / 180);
}

const setUpDataTun = (req, res) => {
  const alist = req.body?.list || {};
  const date = req.body?.date;
  let val = 0;
  if (alist[date]) {
    if (alist[date]?.loc == req.body.loc) {
      val = req.body.list[date];
    }
  } else {
    val = getVals();
  }
  alist[date] = { [date]: val, loc: req?.body?.lcda };
  const response = {
    result: {
      data: val,
      list: alist,
    }
  }
  setTimeout(() => {
    res.send(response);
  }, 100)
}

// source: https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api
const haversineDistance = (coord1, coord2) => {
  // console.log(coord1, coord2);
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371.0710; // Radius of the Earth(km)
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadius = 6371; // Earth's radius in kilometers
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;
  return distance;
}

function filterRecyclersWithinRadius(household, recyclers) {
  const filteredRecyclers = recyclers.filter(recycler => {
    const distance = calculateDistance(
      household[0], household[1],
      recycler.location.coord.lat, recycler.location.coord.lng
    );
    return distance <= recycler.distance;
  });
  return filteredRecyclers;
}

function getVals(min = 9.5, max = 29.8) {
  return Math.random() * (max - min) + min;
}


function findClosestRecycler(household, recyclers) {
  let closestRecycler = null;
  let minDistance = Number.MAX_VALUE;
  recyclers.forEach(recycler => {
    const distance = calculateDistance(
      household[0], household[1],
      recycler.location.coord.lat, recycler.location.coord.lng
    );
    if (distance < minDistance) {
      closestRecycler = recycler;
      minDistance = distance;
    }
  });
  return closestRecycler;
}

const createListing = catchAsync(async (req, res) => {
  const listing = await listingService.createListing(req.body);
  const recyclers = await userService.fetchRecyclers();
  const householdLocation = req.body.location.coordinates;
  const filteredRecyclers = await filterRecyclersWithinRadius(householdLocation, recyclers);
  const pushedRecyclers = [];
  const recyclersWithThreshold = [];
  if (filteredRecyclers.length > 0) {
    filteredRecyclers.map(rec => {
      pushedRecyclers.push(rec._id);
      recyclersWithThreshold.push(rec);
    });
  } else {
    const closestRecycler = await findClosestRecycler(householdLocation, recyclers);
    pushedRecyclers.push(closestRecycler._id);
    recyclersWithThreshold.push(closestRecycler);
  }
  const payload = {
    recyclers: pushedRecyclers
  }
  const updatedListing = await listingService.updateListingById(listing._id, payload);
  checkThreshold(recyclersWithThreshold);
  res.status(httpStatus.CREATED).send(updatedListing);
});

const getRecyclerListings = async (req) => {
  const pickups = await listingService.getListingsByRecycler(req.body.recyclerId);
  return pickups;
}

const checkThreshold = async (recyclersWithThreshold) => {
  recyclersWithThreshold.map(async (rec) => {
    const recListings = await listingService.getListingsByRecycler(rec._id);
    recyclerListings(recListings, rec);
  });
}

//do; for each recycler
const recyclerListings = async (listings, rec) => {
  let total = 0;
  await listings.filter(list => total += list.weight);
  if (total >= rec.threshold) {
    sendRecyclerThresholdEmail(total, rec)
  }
}

const sendRecyclerThresholdEmail = async (total, rec) => {
  const subject = 'Recycling Threshold Reached';
  const text = `Dear ${rec.name},\n\nYour recycling threshold of ${rec.threshold} kg has been reached. 
  \n There is ${total} kg of recyclable materials available now!
  \n Hurry, It's time to schedule a pickup!
  \n\n Best regards,\nYour friends from testing_WMG`;
  const from = 'testingwmg@gmail.com'
  await emailService.sendEmail(from, rec.email, subject, text);
}

const getListings = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await listingService.queryListings(null, options);
  res.send(result);
});

const getListingByUser = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await listingService.queryListingByUser(req.body, options);
  res.send(result);
});

const getRadiiListing = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await listingService.getSpatialListings(req.body.location, options);
  res.send(result);
});

const getListing = catchAsync(async (req, res) => {
  const listing = await listingService.getListingById(req.params.listingId);
  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Listing not found');
  }
  res.send(listing);
});

// const createDistanceMatrix = (items) => {
//   // const distanceMatrix = [];
//   const distanceMatrix = new Array(10).fill(0).map(() => new Array(10).fill(0));
//   const recyclerLocation = { coordinates: [recycler.location[0], recycler.location[1]] };
//   for (let i = 0; i < 10; i++) {
//     for (let j = 0; j < 10; j++) {
//       const distance = haversineDistance(recyclerLocation.coordinates, items[i].location) -
//         haversineDistance(recyclerLocation.coordinates, items[j].location);
//       distanceMatrix[i][j] = distance;
//     }
//   }
//   return distanceMatrix;
// }

const createDistanceMatrix = (items) => {
  const distanceMatrix = [];
  const recyclerLocation = { coordinates: [recycler.location[0], recycler.location[1]] };
  for (let i = 0; i < items.length; i++) {
    const distance = haversineDistance(recyclerLocation.coordinates, items[i].location);
    distanceMatrix.push(distance);
  }
  return distanceMatrix;
}

const createPriceMatrix = (extractedFields) => {
  const priceMatrix = [];
  for (let i = 0; i < extractedFields.length; i++) {
    const row = [];
    for (let j = 0; j < extractedFields.length; j++) {
      if (i === j) {
        row.push(1);
      } else {
        const ratio = extractedFields[i].price / extractedFields[j].price;
        row.push(ratio);
      }
    }
    priceMatrix.push(row);
  }
  // console.log(priceMatrix);
  return priceMatrix;
}

const createQuantityMatrix = (extractedFields) => {
  const quantityMatrix = [];
  for (let i = 0; i < extractedFields.length; i++) {
    const row = [];
    for (let j = 0; j < extractedFields.length; j++) {
      if (i === j) {
        row.push(1);
      } else {
        const ratio = extractedFields[i].weight / extractedFields[j].weight;
        row.push(ratio);
      }
    }
    quantityMatrix.push(row);
  }
  // console.log(quantityMatrix);
  return quantityMatrix;
}

const createCriteriaRank = (criterion) => {
  let criteriaMatrix = [];
  for (let i = 0; i < criterion.length; i++) {
    const row = [];
    for (let j = 0; j < criterion.length; j++) {
      if (i === j) {
        row.push(1); // Diagonal elements
      } else {
        const value = criterion[i] / criterion[j];
        row.push(value);
      }
    }
    criteriaMatrix.push(row);
  }
  // console.log('criteriaMatrix: ', criteriaMatrix);
  return criteriaMatrix;
}

const getListingsRank = catchAsync(async (req, res) => {
  let results = [];
  const ahpContext = new AHP();
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  results = await listingService.queryListings(null, options);
  let extractedFields = [];
  results.results.map((result) => {
    extractedFields.push({
      id: result._id,
      location: result.location.coordinates,
      weight: result.weight,
      price: result.price,
      category: result.category,
      status: result.status,
    })
  });
  // const criteria = ['quantity', 'distance', 'price']; // recycler C
  // const criteria = ['distance', 'price', 'quantity']; // recycler B
  const criteria = ['price', 'quantity', 'distance']; // recycler A
  const criteriaRank = [9, 5, 3];
  const distanceMatrix = await createDistanceMatrix(extractedFields);
  const priceMatrix = await createPriceMatrix(extractedFields);
  const qtyMatrix = await createQuantityMatrix(extractedFields);
  const criteriaItemRank = {
    'quantity': qtyMatrix,
    'distance': distanceMatrix,
    'price': priceMatrix,
  }

  ahpContext.import({
    items: extractedFields,
    criteria: criteria,
    criteriaItemRank: criteriaItemRank,
    criteriaRank: criteriaRank
  });

  const output = ahpContext.run();
  const rankedItems = output.rankedScores.map((score, index) => ({ item: extractedFields[index], score }));
  rankedItems.sort((a, b) => b.score - a.score);
  const rankedData = [];
  rankedItems.map((rank) => {
    results.results.map(el => {
      if (el.id == rank.item.id) {
        rankedData.push({ el, score: rank.score })
      }
    })
  })
  setTimeout(() => {
    const analyticContext = ahpContext.debug();
    for (const key in analyticContext) {
      console.log(`${key}: `, analyticContext[key], '\n');
    }
    res.send({ rankedItems, rankedData });
  }, 3000)
});

const updateListing = catchAsync(async (req, res) => {
  const listing = await listingService.updateListingById(req.body.listingId, req.body);
  res.send(listing);
});

const deleteListing = catchAsync(async (req, res) => {
  await listingService.deleteListingById(req.params.listingId);
  res.status(httpStatus.NO_CONTENT).send();
});

const predictFutureMonths = () => {
  const inputFeatures = {
    '01/2023': { 'lcda': 'Ajuwon', 'lcda_code': 114008 },
  };
  const predictions = {};
  const months = [];
  Object.keys(inputFeatures).map((key) => {
    months.push(key)
  });
  for (const month of months) {
    const features = inputFeatures[month];
    const prediction = model.predict(features);
    predictions[month] = prediction;
  }
  console.log(predictions);
}


module.exports = {
  createListing,
  getListings,
  getListingByUser,
  getRecyclerListings,
  getRadiiListing,
  setUpDataTun,
  getListing,
  updateListing,
  deleteListing,
  getListingsRank,
  predictFutureMonths,
};
