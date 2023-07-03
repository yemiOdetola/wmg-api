const httpStatus = require('http-status');
const AHP = require('ahp');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { listingService } = require('../services');

const createListing = catchAsync(async (req, res) => {
  const listing = await listingService.createListing(req.body);
  res.status(httpStatus.CREATED).send(listing);
});

const getListings = catchAsync(async (req, res) => {
  // const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await listingService.queryListings(null, options);
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

const getListingsAhp = catchAsync(async (req, res) => {
  const ahpContext = new AHP();
  const items = ['Item1', 'Item2', 'Item3', 'Item4', 'Item5', 'Item6', 'Item7', 'Item8', 'Item9', 'Item10'];
  const criteria = ['Criterion1', 'Criterion2', 'Criterion3'];
  const criteriaItemRank = {
    Criterion1: [
      [1, 3, 5, 1, 5, 7, 3, 2, 5, 2],
      [1 / 3, 1, 4, 1 / 6, 3, 5, 1, 1 / 2, 4, 1 / 2],
      [1 / 5, 1 / 4, 1, 1 / 5, 2, 3, 1 / 3, 1 / 3, 1, 1 / 2],
      [1, 6, 5, 1, 6, 8, 4, 3, 6, 3],
      [1 / 5, 1 / 3, 1 / 2, 1 / 6, 1, 3, 1 / 2, 1 / 3, 3 / 2, 1 / 2],
      [1 / 7, 1 / 5, 1 / 3, 1 / 8, 1 / 3, 1, 1 / 4, 1 / 5, 1, 1 / 3],
      [1 / 3, 1, 3, 1 / 4, 2, 4, 1, 1 / 2, 3, 1 / 2],
      [1 / 2, 2, 3, 1 / 3, 3, 5, 2, 1, 4, 1],
      [1 / 5, 1 / 4, 1, 1 / 6, 2 / 3, 1, 1 / 3, 1 / 4, 1, 1 / 3],
      [1 / 2, 2, 2, 1 / 3, 2, 3, 2, 1, 3, 1]
    ],
    Criterion2: [
      [1, 2, 1 / 3, 5, 3, 1, 1 / 2, 1 / 3, 1, 2],
      [1 / 2, 1, 1 / 5, 3, 2, 1 / 2, 1 / 4, 1 / 5, 1 / 2, 1],
      [3, 5, 1, 7, 5, 2, 3, 1, 3, 5],
      [1 / 5, 1 / 3, 1 / 7, 1, 1 / 2, 1 / 5, 1 / 7, 1 / 9, 1 / 4, 1 / 3],
      [1 / 3, 1 / 2, 1 / 5, 2, 1, 1 / 3, 1 / 5, 1 / 7, 1 / 2, 1 / 2],
      [1, 2, 1 / 2, 5, 3, 1, 1 / 3, 1 / 2, 1, 2],
      [2, 4, 1 / 3, 7, 5, 3, 1, 1 / 3, 3 / 2, 2],
      [3, 5, 1, 9, 7, 2, 3, 1, 3, 5],
      [1, 2, 1 / 3, 4, 2, 1, 2 / 3, 1 / 3, 1, 2],
      [1 / 2, 1, 1 / 5, 3, 2, 1 / 2, 1 / 2, 1 / 5, 1 / 2, 1]
    ],
    Criterion3: [
      [1, 5, 2, 1 / 3, 1 / 5, 2, 1 / 2, 1 / 3, 1, 1],
      [1 / 5, 1, 1 / 3, 1 / 7, 1 / 9, 1 / 3, 1 / 5, 1 / 7, 1 / 4, 1 / 3],
      [1 / 2, 3, 1, 1 / 5, 1 / 3, 3 / 2, 1, 1 / 3, 2, 2],
      [3, 7, 5, 1, 1 / 3, 4, 1, 1 / 3, 2, 3],
      [5, 9, 3, 3, 1, 5, 3, 1, 4, 4],
      [1 / 2, 3, 2 / 3, 1 / 4, 1 / 5, 1, 1 / 3, 1 / 5, 2 / 3, 1],
      [2, 5, 1, 1, 1 / 3, 3, 1, 1 / 3, 2, 2],
      [3, 7, 3, 3, 1, 5, 3, 1, 3, 3],
      [1, 4, 1 / 2, 1 / 2, 1 / 4, 3 / 2, 1 / 2, 1 / 3, 1, 1],
      [1, 3, 1 / 2, 1 / 3, 1 / 4, 1, 1 / 2, 1 / 3, 1, 1]
    ]
  };
  const criteriaRank = [
    [1, 3, 5],
    [1 / 3, 1, 3],
    [1 / 5, 1 / 3, 1]
  ];

  ahpContext.import({
    items,
    criteria,
    criteriaItemRank,
    criteriaRank
  });

  const output = ahpContext.run();
  const rankedItems = output.rankedScores.map((score, index) => ({ item: items[index], score }));
  console.log(rankedItems);
  // console.log(output);
});

const updateListing = catchAsync(async (req, res) => {
  const listing = await listingService.updateListingById(req.params.listingId, req.body);
  res.send(listing);
});

const deleteListing = catchAsync(async (req, res) => {
  await listingService.deleteListingById(req.params.listingId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createListing,
  getListings,
  getRadiiListing,
  getListing,
  updateListing,
  deleteListing,
  getListingsAhp,
};
