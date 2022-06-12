const chai = require("./chaiSetup");
const NFT = artifacts.require("NFT")
const Showroom = artifacts.require("Showroom")
const Car = artifacts.require("Car")
const Dealer = artifacts.require("Dealer")

const BN = web3.utils.BN
const expect = chai.expect;

const CATEGORIES = {
  SEDAN: 0,
  SUV: 1,
  HATCHBACK: 2
}

contract("Showroom", (accounts) => {

  const [deployer, dealer1, dealer2, customer1, customer2] = accounts

  let nft, showroom;

  before(async () => {
    // nft = await NFT.new();
    // showroom = await Showroom.new(nft.address);
    nft = await NFT.deployed();
    showroom = await Showroom.deployed();
    dealerInstance = await Dealer.deployed()
  })

  describe('List Car and Buy Car', () => { 
    let price = web3.utils.toWei("5", "ether");
    let quantity = 2;
    before(async () => {
      await dealerInstance.registerDealer("Ziggler", "121212121", dealer1)
    })

    it('makeItem should fail for unregistered dealer', async () => {
      await expect(showroom.makeItem(quantity, price, "BMW X3", "BMW Cars are awesome", CATEGORIES.SEDAN, {from: dealer2})).to.eventually.be.rejectedWith("Permission Denied, You are not the dealer!");
    });

    it('should create an Car and respective NFTs', async () => {
      await expect(showroom.makeItem(quantity, price, "BMW X3", "BMW Cars are awesome", CATEGORIES.SEDAN, {from: dealer1})).to.eventually.be.fulfilled;
      
      expect(showroom.itemCount()).to.eventually.be.a.bignumber.equal(new BN(1))
      const carAddress = await showroom.items(1)
      const car = await Car.at(carAddress)
      // console.log(await car.description())
      expect(car.carCount()).to.eventually.be.a.bignumber.equal(new BN(2))
      expect(car.price()).to.eventually.be.a.bignumber.equal(new BN(price))
    });

    it('should purchase a car for customer1', async () => {
      const itemId = 1
      // await showroom.purchaseCar(itemId, {from: customer1, value: price})
      await expect(showroom.purchaseCar(itemId, {from: customer1, value: price})).to.eventually.be.fulfilled;
      const carAddress = await showroom.items(itemId);
      const car = await Car.at(carAddress)
      const soldQuantity = await car.quantitySold();
      const carTokenId = await car.carTokenIds(soldQuantity);

      expect(nft.ownerOf(carTokenId)).to.eventually.be.equal(customer1);

    });

    it('should purchase the same car again for customer2', async () => {
      const itemId = 1
      // await showroom.purchaseCar(itemId, {from: customer1, value: price})
      await expect(showroom.purchaseCar(itemId, {from: customer2, value: price})).to.eventually.be.fulfilled;
      const carAddress = await showroom.items(itemId);
      const car = await Car.at(carAddress)
      const soldQuantity = await car.quantitySold();
      const carTokenId = await car.carTokenIds(soldQuantity);

      expect(nft.ownerOf(carTokenId)).to.eventually.be.equal(customer2);
    });

    it('should give an error if car ran out of quantity', async () => {
      const itemId = 1
      // await showroom.purchaseCar(itemId, {from: customer1, value: price})
      await expect(showroom.purchaseCar(itemId, {from: customer2, value: price})).to.eventually.be.rejectedWith("All Pieces are already sold");
    });

    it('should give an error if customer send the invalid price', async () => {
      const itemId = 1
      // await showroom.purchaseCar(itemId, {from: customer1, value: price})
      await expect(showroom.purchaseCar(itemId, {from: customer2, value: new BN(price).sub(new BN(100)).toString()})).to.eventually.be.rejectedWith("Amount should be exactly equal to Selling Price");
    });
    
  })

})