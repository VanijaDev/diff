// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./AppStorage.sol";

contract PersonsFaucet {
  AppStorage internal s;

  function mintPerson(string calldata _name, uint256 _age) external {
    uint256 count = s.personsCount;
    count++;
    s.personsCount = count;
    s.persons[count] = Person(_name, _age);
  }

  function getPerson(uint256 _personId) external view returns (Person memory person_) {
    person_ = s.persons[_personId];
  }
}