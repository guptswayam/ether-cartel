// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {

  uint public tokenCount;
  constructor() ERC721("Ether Cartel", "CARTEL") {}

  // Funtion to mint/create NFT
  function mint() public returns(uint) {
    tokenCount++;
    _safeMint(tx.origin, tokenCount);      // so, msg.sender will become the owner of the NFT
    return tokenCount;
  }
}