const Joi = require('joi');
const { objectId } = require('./custom.validation');


const createListing = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    instruction: Joi.string().required(),
    image: Joi.string().required(),
    weight: Joi.number().required(),
    price: Joi.number().required(),
    user: Joi.string().custom(objectId),
    location: Joi.any(),
    category: Joi.string().required().valid('generic', 'paper', 'glass', 'textile', 'furniture', 'e-waste', 'batteries', 'plastic', 'metal'),
  }),
};


const getSpatialListings = {
  body: Joi.object().keys({
    location: Joi.any(),
    query: Joi.any(),
  }),
}

const getListings = {
  query: Joi.object().keys({
    title: Joi.string().required(),
    image: Joi.string().required(),
    weight: Joi.number().required(),
    price: Joi.number().required(),
    location: Joi.any(),
    category: Joi.string().required().valid('generic', 'paper', 'glass', 'textitle', 'furniture', 'e-waste', 'batteries', 'plastic'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getListing = {
  params: Joi.object().keys({
    listingId: Joi.string().custom(objectId),
  }),
};

const updateListing = {
  params: Joi.object().keys({
    listingId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().required(),
      description: Joi.string().required(),
      instruction: Joi.string().required(),
      image: Joi.string().required(),
      weight: Joi.number().required(),
      price: Joi.number().required(),
      user: Joi.string().custom(objectId),
      location: Joi.any(),
      category: Joi.string().required().valid('generic', 'paper', 'glass', 'textitle', 'furniture', 'e-waste', 'batteries', 'plastic'),
    })
    .min(1),
};

const deleteListing = {
  params: Joi.object().keys({
    listingId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createListing,
  getListings,
  getSpatialListings,
  getListing,
  updateListing,
  deleteListing,
};
