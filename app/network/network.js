const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');

//declare namespace
const namespace = 'com.nimbl3.imp';

//in-memory card store for testing so cards are not persisted to the file system
const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

//admin connection to the blockchain, used to deploy the business network
let adminConnection;

//this is the business network connection the tests will use.
let businessNetworkConnection;

let businessNetworkName = 'imp-network';
let factory;


/*
 * Import card for an identity
 * @param {String} cardName The card name to use for this identity
 * @param {Object} identity The identity details
 */
async function importCardForIdentity(cardName, identity) {

  //use admin connection
  adminConnection = new AdminConnection();
  businessNetworkName = 'imp-network';

  //declare metadata
  const metadata = {
      userName: identity.userID,
      version: 1,
      enrollmentSecret: identity.userSecret,
      businessNetwork: businessNetworkName
  };

  //get connectionProfile from json, create Idcard
  const connectionProfile = require('./local_connection.json');
  const card = new IdCard(metadata, connectionProfile);

  //import card
  await adminConnection.importCard(cardName, card);
}


/*
* Reconnect using a different identity
* @param {String} cardName The identity to use
*/
async function useIdentity(cardName) {

  //disconnect existing connection
  await businessNetworkConnection.disconnect();

  //connect to network using cardName
  businessNetworkConnection = new BusinessNetworkConnection();
  await businessNetworkConnection.connect(cardName);
}


//export module
module.exports = {

  /*
  * Create Member participant and import card for identity
  * @param {String} cardId Import card id for member
  * @param {String} accountNumber Member account number as identifier on network
  * @param {String} firstName Member first name
  * @param {String} lastName Member last name
  * @param {String} phoneNumber Member phone number
  * @param {String} email Member email
  */
  registerMember: async function (cardId, accountNumber,firstName, lastName, email, phoneNumber) {
    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@imp-network');

      //get the factory for the business network
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create member participant
      const member = factory.newResource(namespace, 'Customer', accountNumber);
      member.firstName = firstName;
      member.lastName = lastName;
      member.email = email;
      member.phoneNumber = phoneNumber;
      member.points = 0;

      //add member participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Customer');
      await participantRegistry.add(member);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Customer#' + accountNumber, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@imp-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Create Manager participant and import card for identity
  * @param {String} cardId Import card id for Manager
  * @param {String} managerId Manager Id as identifier on network
  * @param {String} name Manager name
  * @param {String} email Manager email
  * @param {String} phoneNumber Manager phone number
  */
  registerManager: async function (cardId, managerId, name, email, phoneNumber) {

    try {

      //connect as admin
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect('admin@imp-network');

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create a Manager participant
      const manager = factory.newResource(namespace, 'Manager', managerId);
      manager.name = name;
      manager.email = email;
      manager.phoneNumber = phoneNumber;


      //add manager participant
      const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Manager');
      await participantRegistry.add(manager);

      //issue identity
      const identity = await businessNetworkConnection.issueIdentity(namespace + '.Manager#' + managerId, cardId);

      //import card for identity
      await importCardForIdentity(cardId, identity);

      //disconnect
      await businessNetworkConnection.disconnect('admin@imp-network');

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

 /*
  * Create Shipper participant and import card for identity
  * @param {String} cardId Import card id for partner
  * @param {String} shipperId Shipper Id as identifier on network
  * @param {String} name Shipper name
  */
  registerShipper: async function (cardId, shipperId, name) {

  try {

    //connect as admin
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect('admin@imp-network');

    //get the factory for the business network.
    factory = businessNetworkConnection.getBusinessNetwork().getFactory();

    //create shipper participant
    const shipper = factory.newResource(namespace, 'Shipper', shipperId);
    shipper.name = name;

    //add partner participant
    const participantRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Shipper');
    await participantRegistry.add(shipper);

    //issue identity
    const identity = await businessNetworkConnection.issueIdentity(namespace + '.Shipper#' + shipperId, cardId);

    //import card for identity
    await importCardForIdentity(cardId, identity);

    //disconnect
    await businessNetworkConnection.disconnect('admin@imp-network');

    return true;
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error;
  }

},

  /*
  * Perform EarnPoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} managerId Partner Id of partner
  * @param {Integer} points Points value
  */
  earnPointsTransaction: async function (cardId, accountNumber, partnerId, points) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create transaction
      const earnPoints = factory.newTransaction(namespace, 'EarnPoints');
      earnPoints.points = points;
      earnPoints.member = factory.newRelationship(namespace, 'Member', accountNumber);
      earnPoints.partner = factory.newRelationship(namespace, 'Partner', partnerId);

      //submit transaction
      await businessNetworkConnection.submitTransaction(earnPoints);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Perform UsePoints transaction
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  * @param {String} partnerId Partner Id of partner
  * @param {Integer} points Points value
  */
  usePointsTransaction: async function (cardId, accountNumber, partnerId, points) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get the factory for the business network.
      factory = businessNetworkConnection.getBusinessNetwork().getFactory();

      //create transaction
      const usePoints = factory.newTransaction(namespace, 'UsePoints');
      usePoints.points = points;
      usePoints.member = factory.newRelationship(namespace, 'Member', accountNumber);
      usePoints.partner = factory.newRelationship(namespace, 'Partner', partnerId);

      //submit transaction
      await businessNetworkConnection.submitTransaction(usePoints);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      return true;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get Customer member data
  * @param {String} cardId Card id to connect to network
  * @param {String} accountNumber Account number of member
  */
  customerData: async function (cardId, accountNumber) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get member from the network
      const memberRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Customer');
      const member = await memberRegistry.get(accountNumber);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return member object
      return member;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error;
    }

  },

  /*
  * Get Manager data
  * @param {String} cardId Card id to connect to network
  * @param {String} managerId Manager Id of partner
  */
  managerData: async function (cardId, managerId) {

    try {

      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //get manager from the network
      const managerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Manager');
      const manager = await managerRegistry.get(managerId);

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return partner object
      return manager;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get Shipper data
  * @param {String} cardId Card id to connect to network
  * @param {String} shipperId Shipper Id of partner
  */
  shipperData: async function (cardId, shipperId) {

  try {

    //connect to network with cardId
    businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect(cardId);

    //get shipper from the network
    const partnerRegistry = await businessNetworkConnection.getParticipantRegistry(namespace + '.Shipper');
    const partner = await partnerRegistry.get(shipperId);

    //disconnect
    await businessNetworkConnection.disconnect(cardId);

    //return partner object
    return partner;
  }
  catch(err) {
    //print and return error
    console.log(err);
    var error = {};
    error.error = err.message;
    return error
  }

},

  /*
  * Get all partners data
  * @param {String} cardId Card id to connect to network
  */
  allPartnersInfo : async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query all partners from the network
      const allPartners = await businessNetworkConnection.query('selectPartners');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return allPartners object
      return allPartners;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }
  },

  /*
  * Get all EarnPoints transactions data
  * @param {String} cardId Card id to connect to network
  */
  earnPointsTransactionsInfo: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query EarnPoints transactions on the network
      const earnPointsResults = await businessNetworkConnection.query('selectEarnPoints');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return earnPointsResults object
      return earnPointsResults;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  },

  /*
  * Get all UsePoints transactions data
  * @param {String} cardId Card id to connect to network
  */
  usePointsTransactionsInfo: async function (cardId) {

    try {
      //connect to network with cardId
      businessNetworkConnection = new BusinessNetworkConnection();
      await businessNetworkConnection.connect(cardId);

      //query UsePoints transactions on the network
      const usePointsResults = await businessNetworkConnection.query('selectUsePoints');

      //disconnect
      await businessNetworkConnection.disconnect(cardId);

      //return usePointsResults object
      return usePointsResults;
    }
    catch(err) {
      //print and return error
      console.log(err);
      var error = {};
      error.error = err.message;
      return error
    }

  }

}
