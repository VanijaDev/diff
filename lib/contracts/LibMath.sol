// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

library LibMath {
  function double(uint256 x) external pure returns (uint256) {
    return x * 2;
  }

  function getHalf(uint256 x) external pure returns (uint256) {
    return x / 2;
  }

  function mul(uint256 x, uint256 y) external pure returns (uint256) {
    return x * y;
  }
}