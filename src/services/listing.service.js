const httpStatus = require('http-status');
const { Listing } = require('../models');
const ApiError = require('../utils/ApiError');
const Listing = require('../models/listing.model');

/**
 * Create a Listing
 * @param {Object} listingBody
 * @returns {Promise<Listing>}
 */
const createListing = async (listingBody) => {
  return Listing.create(listingBody);
};

/**
 * Query for listings
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryListings = async (filter, options) => {
  const listings = await Listing.paginate(filter, options);
  return listings;
};

/**
 * Get listing by id
 * @param {ObjectId} id
 * @returns {Promise<Listing>}
 */
const getListingById = async (id) => {
  return Listing.findById(id);
};

/**
 * Get listing by id
 * @param {Location} location
 * @returns {Promise<Listing>}
 */

const getSpatialListings = async (location, query) => {
  const latitude = parseFloat(location.latitude);
  const longitude = parseFloat(location.longitude);
  const radius = parseFloat(location.radius) || 1000; // Default radius in meters
  const page = parseInt(query.page) || 1; // Default page is 1
  const limit = parseInt(query.limit) || 10; // Default limit is 10 listings per page

  try {
    const totalListingsCount = await Listing.countDocuments({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius || 1000
        }
      }
    });

    const totalPages = Math.ceil(totalListingsCount / limit);
    const skip = (page - 1) * limit;

    const listings = await Listing.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius
        }
      }
    })
      .skip(skip)
      .limit(limit);
    return {
      listings,
      page,
      totalPages,
      totalListingsCount
    };
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching listings.' });
  }
};


/**
 * Update listing by id
 * @param {ObjectId} listingId
 * @param {Object} updateBody
 * @returns {Promise<Listing>}
 */
const updateListingById = async (listingId, updateBody) => {
  const listing = await getListingById(listingId);
  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Listing not found');
  }
  Object.assign(listing, updateBody);
  await listing.save();
  return listing;
};

/**
 * Delete listing by id
 * @param {ObjectId} listingId
 * @returns {Promise<Listing>}
 */
const deleteListingById = async (listingId) => {
  const listing = await getListingById(listingId);
  if (!listing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Listing not found');
  }
  await listing.remove();
  return listing;
};

module.exports = {
  createListing,
  queryListings,
  getListingById,
  getSpatialListings,
  updateListingById,
  deleteListingById,
};
