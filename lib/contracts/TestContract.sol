// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import { LibMath } from "./LibMath.sol";
import { LibUsing } from "./LibUsing.sol";

// import "hardhat/console.sol";

contract TestContract {
    using LibUsing for uint256;

    function getDouble(uint256 _val) external pure returns (uint256) {
        return LibMath.double(_val);
    }

    function getHalf(uint256 _val) external pure returns (uint256) {
        return LibMath.getHalf(_val);
    }

    function getMul(uint256 _val1, uint256 _val2) external pure returns (uint256) {
        return _val1.mul(_val2);
    }
}
