const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
//const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const yelp = require('yelp-fusion');
//Load router
const router = require('./routes/api');
const app = express();

dotenv.config({ verbose:true });

const env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
//Connect to database
const db = 'mongodb://mbuckles:adjf1963@ds133291.mlab.com:33291/mb-nightlife-app';
mongoose.connect(db, function(err){
if(err){
   console.log('db connect error');
}
});
// listen to mongoose connections
mongoose.connection.on('connected', function() {
  console.log('connected to ' + db);
});
mongoose.connection.on('disconnected', function() {
  console.log('disconnected from mongoose');
});
mongoose.connection.on('error', function() {
  console.log('error connecting to mongoose');
});
mongoose.Promise = global.Promise;
// Middleware configuration
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static (path.join(__dirname, '/public')));
app.use('/api', router);
app.get("*", function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

const server = app.listen((process.env.PORT || 3000), function(){
  console.log('app is listening on localhost:3000');
});
module.exports = app;
