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

  let selectors = getSelectors(personsFaucet)
  console.log(`${selectors}`)

  // Optional: remove redundant funciton selectors
  // const supportsInterfaceSelector = ethers.utils.id('supportsInterface(bytes4)').substring(0, 10)
  // var index = selectors.indexOf(supportsInterfaceSelector);
  // if (index !== -1) {
  //   console.log("     ---> Removing 'supportsInterface(bytes4)' from selectors");
  //   selectors.splice(index, 1);
  // }
  // console.log(`${selectors}`)

  const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondContractAddress)
  let tx = await diamondCutFacet.diamondCut(
    [{
      facetAddress: personsFaucet.address,
      action: FacetCutAction.Add,
      functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
  let receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }

  console.log('Completed diamond cut for PersonsFaucet')

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
