const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const categories = ['generic', 'paper', 'glass', 'textitle', 'furniture', 'e-waste', 'batteries', 'plastic'];
const statusEnum = ['available', 'accepted', 'rejected', 'counter', 'completed'];

const listingSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    instruction: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    image: {
      type: String,
      required: false,
    },
    weight: {
      type: Number,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: categories,
      default: 'generic',
    },
    status: {
      type: String,
      enum: statusEnum,
      default: 'available'
    },
    // recycler: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: 'Recycler'
    // },
    counterOffer: {
      type: Number
    },
    negotiationHistory: [{
      message: {
        type: String
      },
      offer: {
        type: Number,
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);



listingSchema.index({ location: '2dsphere' });
// add plugin that converts mongoose to json
listingSchema.plugin(toJSON);
listingSchema.plugin(paginate);

/**
 * @typedef Listing
 */
const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
