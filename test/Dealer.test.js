const chai = require("./chaiSetup");
const Dealer = artifacts.require("Dealer");

const BN = web3.utils.BN
const expect = chai.expect;

contract("Dealers", (accounts) => {
  const [deployer, dealer] = accounts;
  let dealerInstance;
  beforeEach(async () => {
    dealerInstance = await Dealer.deployed();
  })

  it('should add the dealer', async () => {
    await expect(dealerInstance.registerDealer("Ziggler", "121212121", dealer)).to.eventually.be.fulfilled;
    expect(dealerInstance.isDealer({from: dealer})).to.eventually.be.equal(true);
  });

  it("should delete a dealer", async () => {
    await dealerInstance.blockDealer(dealer)
    await expect(dealerInstance.blockDealer(dealer)).to.eventually.be.fulfilled;
    expect(dealerInstance.isDealer({from: dealer})).to.eventually.be.equal(false);
  })

  it('should return the dealers list', async () => {
    const dealers = await dealerInstance.getDealers(0,1);
    expect(dealers.length).to.be.equal(1);
    expect(dealers[0].name).to.be.equal("Ziggler");
  });

  it('should give an error if we same dealer more than once', async () => {
    expect(dealerInstance.registerDealer("Ziggler", "121212121", dealer)).to.eventually.be.rejectedWith("Dealer with this address already exists!");
  });

})