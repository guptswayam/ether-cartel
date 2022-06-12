// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Dealer is Ownable {

  struct DealerStruct {
    bool isActive;
    string name;
    string phone;
    address dealerAddress;
  }

  mapping(address => uint) public dealerAddresses;        // this will help to avoid the duplicates in constant time
  DealerStruct[] public dealerDetails;

  function registerDealer(string memory _name, string memory _phone, address _address) public onlyOwner {
    if(dealerAddresses[_address] != 0) revert("Dealer with this address already exists!");
    dealerDetails.push(DealerStruct(true, _name, _phone, _address));
    dealerAddresses[_address] = dealerDetails.length;
  }

  function blockDealer(address _address) public onlyOwner {
    uint dealerLocation = dealerAddresses[_address];
    if(dealerLocation != 0) dealerDetails[dealerLocation - 1].isActive = false;
  }

  function unblockDealer(address _address) public onlyOwner {
    uint dealerLocation = dealerAddresses[_address];
    if(dealerLocation != 0) dealerDetails[dealerLocation - 1].isActive = true;
  }

  function isDealer() public view returns(bool) {
    uint dealerLocation = dealerAddresses[tx.origin];
    if(dealerLocation != 0) return dealerDetails[dealerLocation - 1].isActive;
    else return false;
  }

  function getDealers(uint start, uint end) public view returns(DealerStruct[] memory) {
    uint size = end < dealerDetails.length ? end - start : dealerDetails.length - start;
    DealerStruct[] memory data = new DealerStruct[](size);

    for(uint i=0;i<size;i++) {
      data[i] = dealerDetails[start + i];
    }

    return data;
  }

}

// contract Dealer is Ownable {

//   struct DealerStruct {
//     bool isApproved;
//     string name;
//     string phone;
//   }

//   mapping(address => DealerStruct) dealers;

//   function registerDealer(string memory _name, string memory _phone, address _address) public onlyOwner {
//     dealers[_address] = DealerStruct(true, _name, _phone);
//   }

//   function deleteDealer(address _address) public onlyOwner {
//     delete dealers[_address];         // this won't work if DealerStruct contains a mapping inside, we can't delete the whole mapping from solidity, only mapping element can be deleted
//   }

//   function isDealer() public view returns(bool) {
//     return dealers[tx.origin].isApproved;
//   }

// }