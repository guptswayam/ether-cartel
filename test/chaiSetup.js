const chai = require("chai");
const chaiPromise = require("chai-as-promised");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn");

chai.use(chaiBN(BN));
chai.use(chaiPromise);

module.exports = chai;
