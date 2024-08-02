// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { AppStorage } from "./AppStorage.sol";

// initial version - absent

// // upgraded
// contract FriendsFaucet {
//   AppStorage internal s;

//   function addFriend(uint256 _personId, uint256 _friendId) external {
//     s.friends[_personId].push(_friendId);
//   }

//   function getFriends(uint256 _personId) external view returns (uint256[] memory friends_) {
//     friends_ = s.friends[_personId];
//   }
// }