/* global ethers */
/* eslint prefer-const: "off" */

const { assert } = require('chai');
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');
const { ethers } = require('hardhat');
const { dotenv } = require('dotenv').config();

async function upgradeDiamond() {
  // validate environment variables
  const diamondContractAddress = process.env.DIAMOND_CONTRACT_ADDRESS;
  if (!diamondContractAddress) {
    console.error("     ---> No DIAMOND_CONTRACT_ADDRESS in environment variable.");
    process.exit(1);
  } else if (!ethers.utils.isAddress(diamondContractAddress)) {
    console.error(`     ---> DIAMOND_CONTRACT_ADDRESS is invalid: ${diamondContractAddress}.`);
    process.exit(1);
  }

  // Deploy PersonsFaucet
  const PersonsFaucet = await ethers.getContractFactory('PersonsFaucet')
  const personsFaucet = await PersonsFaucet.deploy()
  await personsFaucet.deployed()
  console.log('PersonsFaucet deployed:', personsFaucet.address)

  // Deploy FriendsFaucet
  const FriendsFaucet = await ethers.getContractFactory('FriendsFaucet')
  const friendsFaucet = await FriendsFaucet.deploy()
  await friendsFaucet.deployed()
  console.log('FriendsFaucet deployed:', friendsFaucet.address)


  // 2
  // update function selectors for faucets
  const cuts = []
  cuts.push(
    // remove old function selectors from old PersonsFaucet. One will replaced below, so let's remove another. Important: remove functions, that will be replaced later
    {
      facetAddress: ethers.constants.AddressZero,
      action: FacetCutAction.Remove,
      functionSelectors: [ethers.utils.id('mintPerson(string)').substring(0, 10)]
    },
    {
      facetAddress: personsFaucet.address,
      action: FacetCutAction.Add,
      functionSelectors: [ethers.utils.id('mintPerson(string,uint256)').substring(0, 10)]
    },
    {
      facetAddress: personsFaucet.address,
      action: FacetCutAction.Replace,
      functionSelectors: [ethers.utils.id('getPerson(uint256)').substring(0, 10)]
    },
    {
      facetAddress: friendsFaucet.address,
      action: FacetCutAction.Add,
      functionSelectors: [ethers.utils.id('addFriend(uint256,uint256)').substring(0, 10)]
    },
    {
      facetAddress: friendsFaucet.address,
      action: FacetCutAction.Add,
      functionSelectors: [ethers.utils.id('getFriends(uint256)').substring(0, 10)]
    },
  )

  const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondContractAddress)
  let tx = await diamondCutFacet.diamondCut(cuts, ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
  let receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }

  console.log('Completed diamond cut for PersonsFaucet & FriendsFaucet')

   var path = require('path');
   var scriptName = path.basename(__filename);
   return `Success ${scriptName}`;
}

// npx hardhat run scripts/upgrade.js --network localhost
if (require.main === module) {
  upgradeDiamond()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

exports.upgradeDiamond = upgradeDiamond;
