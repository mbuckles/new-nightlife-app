var mongoose = require('mongoose');
var url = require('mongoose-type-url');
var Schema = mongoose.Schema;

var BarSchema = new Schema({
rating_img_url: String,
  yelp_rating:  Number,
  review_count: Number,
  name: String,
  url: mongoose.SchemaTypes.Url,
  image_url: mongoose.SchemaTypes.Url,
  address1: String,
  city: String,
  state: String,
  zip_code: Number,
  display_phone: String,
  location: String,
  attending: Array,
  active: Boolean
  });

var Model = mongoose.model('Bar', BarSchema);
module.exports = Model;
