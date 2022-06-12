// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

enum CATEGORIES {
  SEDAN,
  SUV,
  HATCHBACK
}

contract Car {
  uint carId;
  string public name;
  CATEGORIES public category;
  string public description;
  uint256 public carCount;
  uint public price;
  address payable public dealer;
  uint public quantitySold;
  mapping (uint => uint) public carTokenIds;


  constructor(
    string memory _name,
    CATEGORIES _category,
    uint _price,
    string memory _description,
    address payable _dealer
  ) {
    name = _name;
    category = _category;
    price = _price;
    dealer = _dealer;
    quantitySold = 0;
    description = _description;
  }

  function addcarTokenId(uint _tokenId) public {
    carCount++;
    carTokenIds[carCount] = _tokenId;
  }

  function incrementQuantitySold() public{
    quantitySold++;
  }


}