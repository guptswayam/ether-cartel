const NFT = artifacts.require("NFT")
const Showroom = artifacts.require("Showroom");
const Dealer = artifacts.require("Dealer");

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(NFT);
  await deployer.deploy(Dealer);
  await deployer.deploy(Showroom, NFT.address, Dealer.address);
  
}