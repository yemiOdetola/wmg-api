const httpStatus = require('http-status');
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
};
