// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import {Car, CATEGORIES} from "./Car.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./NFT.sol";
import "./Dealer.sol";

contract Showroom is ReentrancyGuard{

  // Imp: Always Prefer Structs over child classes to avoid extra efforts in fetching data from Blockchain, we are using Car class here here just to practice them, Car struct should be our obvious choice otherwise
  mapping(uint => Car) public items;
  uint public itemCount;
  NFT nft;
  Dealer dealer;

  // For dynamic types like string, event stores the keccak256 hash of the value in the chain, https://ethereum.stackexchange.com/questions/6840/indexed-event-with-string-not-getting-logged/
  event CarListed(address indexed _from, uint _price, CATEGORIES indexed _category, string indexed _name, uint _itemId);

  event CarSold(address indexed _to, uint _itemId, uint _tokenId);

  constructor(NFT _nft, Dealer _dealer) {
    nft = _nft;
    dealer = _dealer;
  }
  
  function makeItem(uint _carCount, uint _price, string memory _name, string memory _description, CATEGORIES _category) public nonReentrant {
    require(dealer.isDealer(), "Permission Denied, You are not the dealer!");
    require(_price > 0, "Price must be greater than zero");
    itemCount++;

    nft._setApprovalForAll(msg.sender, address(this), true);
    // (bool success, ) = address(nft).call(abi.encodeWithSignature("_setApprovalForAll(address,address,bool)", msg.sender, address(this), true));
    // require(success, "Not able to Approve!");


    Car car = new Car(_name, _category, _price, _description, payable(msg.sender));
    for(uint i=0;i<_carCount;i++) {
      uint tokenId = nft.mint();
      nft.transferFrom(msg.sender, address(this), tokenId);
      car.addcarTokenId(tokenId);
    }

    items[itemCount] = car;

    emit CarListed(msg.sender, _price, _category, _name, itemCount);
    
  }

  function purchaseCar(uint _itemId) public payable nonReentrant {
    uint amount = msg.value;
    require(amount > 0, "Insufficient amount");
    require(_itemId <= itemCount && _itemId != 0, "Invalid Item Id");

    Car car = items[_itemId];

    require(car.price() == amount, "Amount should be exactly equal to Selling Price");

    // 1. return error if all the quantities are already sold
    require(car.carCount() > car.quantitySold(), "All Pieces are already sold");

    // 2. Transfer money to Dealer
    car.dealer().transfer(amount);

    // 3. Increase quantity sold count
    car.incrementQuantitySold();

    // 4. Transfer NFT ownership
    nft.transferFrom(address(this), msg.sender, car.carTokenIds(car.quantitySold()));

    emit CarSold(msg.sender, _itemId, car.quantitySold());

  }


}