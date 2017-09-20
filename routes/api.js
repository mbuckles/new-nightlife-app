const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const Bar = require('../models/bar');
const jwt = require('jsonwebtoken');
const yelp = require('yelp-fusion');
const router = express.Router({ caseSensitive: true });

//delete all bars data
router.delete('/bars', function(request, response,next){
  Bar.remove({}).then(function(bar){
    console.log("I received a get request");;
    response.send(bar);
  });
});

//get bars from datbase
router.get('/bars', function(request, response){

  Bar.find({}).then(function(bar){
    console.log("I received a get request");
    response.json(bar);
  //  var prettyJson = JSON.stringify(bars, null, 4);
  });
});
//update bars list
router.put('/bars', function(request, response) {
  Bar.find({}).then(function(bar){
    response.send(bar);
   });
});
//Get yelp data
//yelp token
router.post('/bars', function(request, response) {
  console.log("I received a get request");
  if(request.body.city && request.body.state) {
    //  var bar = new Bar();
    cityandstate = (request.body.city + "," + request.body.state);
    const clientId = 'nUZV_iCAO7Lwk1hv6pf-0A';
    const clientSecret =  'X4BffBQ1U1YKaKSm0phUrE6KDYDcC4n8f4jFYxMob7CQ7iJ8eHNWtCRvKHk0UOID';
    const searchRequest = {
        term:'bars',
        location: cityandstate
        };
yelp.accessToken(clientId, clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);
  client.search(searchRequest).then(response => {
    const result = response.jsonBody.businesses[0];
    var newYelp = [];
   for(var i=0; i<20; i++){
      newYelp.push({
        yelp_rating:  response.jsonBody.businesses[i].rating,
        review_count: response.jsonBody.businesses[i].review_count,
        name: response.jsonBody.businesses[i].name,
        url: response.jsonBody.businesses[i].url,
        image_url: response.jsonBody.businesses[i].image_url,
        address1: response.jsonBody.businesses[i].address1,
        city: response.jsonBody.businesses[i].location.city,
        state: response.jsonBody.businesses[i].location.state,
        zip_code: response.jsonBody.businesses[i].location.zip_code,
        display_phone: response.jsonBody.businesses[i].display_phone,
        location: response.jsonBody.businesses[i].location.display_address
      });
    }
    var prettyJson = JSON.stringify(newYelp, null, 4);
    var bar = newYelp;
    //console.log(newYelp);
    //var bar = new Bar();
    console.log('I received a POST call');
    Bar.create(bar).then(function(bar){
      });
    var bar = new Bar();
    }).catch(e => {
  console.log(e);
      });
});
}
else {
  return response.status(400).send({
    message: 'No location supplied!'
  })
}
});
//update bars list
router.put('/bars', function(request, response) {
  Bar.find({}).then(function(bar){
    response.send(bar);
   });
});

router.post('/verify-token', function(request, response) {
    jwt.verify(request.body.token, 'fcc', function(err, decoded) {
        if (err) {
            return response.status(400).send({
                message: 'invalid token',
                error: err
            })
        } else {
            return response.status(200).send({
                message: 'valid token',
                decoded: decoded
            })
        }
    })
});
router.post('/login', function(request, response) {
    if (request.body.name && request.body.password) {
        User.findOne({ name: request.body.name }, function(err, document) {
            if (err) {
                return response.status(400).send(err)
            } else {
                //console.log(document);
                if (bcrypt.compareSync(request.body.password, document.password)) {
                    const token = jwt.sign({
                        data: document
                    }, 'fcc', { expiresIn: 3600 });
                    return response.status(200).send(token)
                } else {
                    return response.status(400).send({
                        message: 'Unauthorized'
                    })
                }
            }
        })
    } else {
        return response.status(400).send({
            message: 'Server error in posting to api'
        })
    }
});
router.post('/register', function(request, response) {
    if (request.body.name && request.body.password) {
        const user = new User();
        user.name = request.body.name;
        user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
        user.city = request.body.city;
        user.state = request.body.state;
        console.time('bcryptHash');
        user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
        console.timeEnd('bcryptHash');
        user.save(function(err, document) {
            if (err) {
                return response.status(400).send(err)
            } else {
                const token = jwt.sign({
                    data: document
                }, 'fcc', { expiresIn: 3600 })
                return response.status(201).send(token)
            }
        })

    } else {
        return response.status(400).send({
            message: 'Server error in posting to api'
        })
    }
});
// custom middleware to authenticate Header Bearer token on all secure endpoints
function authenticate(request, response, next) {
    const header = request.headers.authorization;
    if (header) {
        const token = header.split(' ')[1];
        jwt.verify(token, 'fcc', function(err, decoded) {
            if (err) {
                return response.status(401).json('Unauthorized request: invalid token')
            } else {
                next();
            }
        })
    } else {
        return response.status(403).json('No token provided')
    }
}
module.exports = router;
