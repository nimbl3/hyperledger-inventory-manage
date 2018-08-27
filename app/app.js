'use strict';

//get libraries
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path')

//create express web-app
const app = express();
const router = express.Router();

//get the libraries to call
var network = require('./network/network.js');
var validate = require('./network/validate.js');
var analysis = require('./network/analysis.js');

//bootstrap application settings
app.use(express.static('./public'));
app.use('/scripts', express.static(path.join(__dirname, '/public/scripts')));
app.use(bodyParser.json());

//get home page
app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// get customer page
app.get('/customer', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/customer.html'));
});

//get registerCustomer page
app.get('/registerMember', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerCustomer.html'));
});

// post call to register customer member on the network
app.post('/api/registerMember', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var phoneNumber = req.body.phonenumber;

  //print variables
  console.log('Using param - firstname: ' + firstName + ' lastname: ' + lastName + ' email: ' + email + ' phonenumber: ' + phoneNumber + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //validate member registration fields
  validate.validateMemberRegistration(cardId, accountNumber, firstName, lastName, email, phoneNumber)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register member on the network
        network.registerMember(cardId, accountNumber, firstName, lastName, email, phoneNumber)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });
});


//post call to retrieve customer member data, transactions data
app.post('/api/customerData', function(req, res) {

  //declare variables to retrieve from request
  var accountNumber = req.body.accountnumber;
  var cardId = req.body.cardid;

  //print variables
  console.log('customerData using param - ' + ' accountNumber: ' + accountNumber + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get member data from network
  network.customerData(cardId, accountNumber)
    .then((member) => {
      //return error if error in response
      if (member.error != null) {
        res.json({
          error: member.error
        });
      } else {
        //else add member data to return object
        returnData.accountNumber = member.customerId;
        returnData.firstName = member.firstName;
        returnData.lastName = member.lastName;
        returnData.phoneNumber = member.phoneNumber;
        returnData.email = member.email;
        returnData.points = member.points;
      }

    })
    .then(() => {
      res.json(returnData);
    });
});

// get manager page
app.get('/manager', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/manager.html'));
});

// get registerCustomer page
app.get('/registerManager', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerManager.html'));
});

// post call to register manager on the network
app.post('/api/registerManager', function(req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var managerId = req.body.managerid;
  var cardId = req.body.cardid;
  var email = req.body.email;
  var phoneNumber = req.body.phonenumber;

  //print variables
  console.log('Using param - name: ' + name + ' managerId: ' + managerId + ' cardId: ' + cardId + ' email: ' + email + ' phoneNumber: ' + phoneNumber);

  //validate partner registration fields
  validate.validateManagerRegistration(cardId, managerId, name)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register manager on the network
        network.registerManager(cardId, managerId, name, email, phoneNumber)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });
});

// post call to retrieve manager data and transactions data from the network
app.post('/api/managerData', function(req, res) {

  //declare variables to retrieve from request
  var managerId = req.body.managerid;
  var cardId = req.body.cardid;

  //print variables
  console.log('managerData using param - ' + ' managerId: ' + managerId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get manager data from network
  network.managerData(cardId, managerId)
    .then((manager) => {
      //return error if error in response
      if (manager.error != null) {
        res.json({
          error: manager.error
        });
      } else {
        //else add partner data to return object
        returnData.managerId = manager.managerId;
        returnData.name = manager.name;
        returnData.email = manager.email;
        returnData.phoneNumber = manager.phoneNumber;
      }

    }).then((manager) => {
      //return returnData
      res.json(returnData);
    });
});

// get shipper page
app.get('/shipper', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/shipper.html'));
});

// get registerCustomer page
app.get('/registerShipper', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/registerShipper.html'));
});

// post call to register manager on the network
app.post('/api/registerShipper', function(req, res) {

  //declare variables to retrieve from request
  var name = req.body.name;
  var shipperId = req.body.shipperid;
  var cardId = req.body.cardid;

  //print variables
  console.log('Using param - name: ' + name + ' shipperId: ' + shipperId + ' cardId: ' + cardId);

  //validate partner registration fields
  validate.validateShipperRegistration(cardId, shipperId, name)
    .then((response) => {
      //return error if error in response
      if (response.error != null) {
        res.json({
          error: response.error
        });
        return;
      } else {
        //else register shipper on the network
        network.registerShipper(cardId, shipperId, name)
          .then((response) => {
            //return error if error in response
            if (response.error != null) {
              res.json({
                error: response.error
              });
            } else {
              //else return success
              res.json({
                success: response
              });
            }
          });
      }
    });
});

// post call to retrieve manager data and transactions data from the network
app.post('/api/shipperData', function(req, res) {

  //declare variables to retrieve from request
  var shipperId = req.body.shipperid;
  var cardId = req.body.cardid;

  //print variables
  console.log('shipperData using param - ' + ' shipperId: ' + shipperId + ' cardId: ' + cardId);

  //declare return object
  var returnData = {};

  //get shipper data from network
  network.shipperData(cardId, shipperId)
    .then((shipper) => {
      //return error if error in response
      if (shipper.error != null) {
        res.json({
          error: shipper.error
        });
      } else {
        //else add partner data to return object
        returnData.shipperId = shipper.shipperId;
        returnData.name = shipper.name;
      }

    }).then((shipper) => {
      //return returnData
      res.json(returnData);
    });
});

//get about page
app.get('/about', function(req, res) {
  res.sendFile(path.join(__dirname + '/public/about.html'));
});

//declare port
var port = process.env.PORT || 8000;
if (process.env.VCAP_APPLICATION) {
  port = process.env.PORT;
}

//run app on port
app.listen(port, function() {
  console.log('app running on port: %d', port);
});
