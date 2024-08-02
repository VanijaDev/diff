// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
import "hardhat/console.sol";

// initial version
struct Person {
  string name;
}

struct AppStorage {
  uint256 personsCount;
  mapping(uint256 => Person) persons;
}


// // Upgraded
// struct Person {
//   string name;
//   uint256 age;
// }

// struct AppStorage {
//   uint256 personsCount;
//   mapping(uint256 => Person) persons;
//   mapping(uint256 => uint256[]) friends;
// }
