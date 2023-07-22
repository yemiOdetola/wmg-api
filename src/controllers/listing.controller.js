const httpStatus = require('http-status');
const AHP = require('ahp');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { listingService, userService } = require('../services');

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
  avatar: "https://avatars.dicebear.com/api/avataaars/923.svg",
  password: "$2a$08$H0h1nSAaaYoEaMlhYXPQReFRLw9G8kfkUzEPB.lBAW6OSWcPRO7h2",
  role: "recycler",
  isEmailVerified: false,
  createdAt: "2023-06-26T14:04:17.536+00:00",
  updatedAt: "2023-06-26T14:04:17.536+00:00",
}

const degToRad = (degrees) => {
  return degrees * (Math.PI / 180);
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
      recyclersWithThreshold.push({
        id: rec._id,
        threshold: rec.threshold,
      });
    });
  } else {
    const closestRecycler = await findClosestRecycler(householdLocation, recyclers);
    pushedRecyclers.push(closestRecycler._id);
    recyclersWithThreshold.push({
      id: closestRecycler._id,
      threshold: closestRecycler.threshold,
    });
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

// recId => getListings => accumulate weight
const checkThreshold = async (recyclersWithThreshold) => {
  recyclersWithThreshold.map(async (rec) => {
    const recy = await listingService.getListingsByRecycler(rec.id);
    recyclerListings(recy, recyclersWithThreshold);
  });
}

const recyclerListings = (listings) => {
  let total = 0;
  listings.filter(list => total += list.weight);
  console.log('THRESSSSHEHEHEHEHE', total);
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
  // const criteria = ['quantity', 'distance', 'price'];
  // const criteriaRank = await createCriteriaRank([7, 5, 3]);
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
    criteria: ['quantity', 'distance', 'price'],
    criteriaItemRank: criteriaItemRank,
    criteriaRank: criteriaRank
  });

  // const output = ahpContext.run();
  // const rankedItems = output.rankedScores.map((score, index) => ({ item: extractedFields[index], score }));
  // rankedItems.sort((a, b) => b.score - a.score);
  setTimeout(() => {
    const analyticContext = ahpContext.debug();
    for (const key in analyticContext) {
      console.log(`${key}: `, analyticContext[key], '\n');
    }
    res.send(analyticContext);
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

module.exports = {
  createListing,
  getListings,
  getListingByUser,
  getRecyclerListings,
  getRadiiListing,
  getListing,
  updateListing,
  deleteListing,
  getListingsRank,
};
