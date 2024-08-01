/* global ethers */
/* eslint prefer-const: "off" */

const { assert } = require('chai');
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');
const { ethers } = require('hardhat');
const { dotenv } = require('dotenv').config();

async function example_upgradeDiamond() {
  // validate environment variables
  const diamondContractAddress = process.env.DIAMOND_CONTRACT_ADDRESS;
  if (!diamondContractAddress) {
    console.error("     ---> No DIAMOND_CONTRACT_ADDRESS in environment variable.");
    process.exit(1);
  } else if (!ethers.utils.isAddress(diamondContractAddress)) {
    console.error(`     ---> DIAMOND_CONTRACT_ADDRESS is invalid: ${diamondContractAddress}.`);
    process.exit(1);
  }
  
  // 1- deploy new faucets and upgrade diamond (add) Test1Facet
  const Test1Facet = await ethers.getContractFactory('Test1Facet')
  const test1Facet = await Test1Facet.deploy()
  await test1Facet.deployed()
  console.log('Test1Facet deployed:', test1Facet.address)

  let selectors = getSelectors(test1Facet)
  // console.log(`${selectors} before`)

  const supportsInterfaceSelector = ethers.utils.id('supportsInterface(bytes4)').substring(0, 10)
  var index = selectors.indexOf(supportsInterfaceSelector);
  if (index !== -1) {
    console.log("     ---> Removing 'supportsInterface(bytes4)' from selectors");
    selectors.splice(index, 1);
  }
  console.log(`${selectors}`)

  const diamondCutFacet = await ethers.getContractAt('IDiamondCut', diamondContractAddress)
  let tx = await diamondCutFacet.diamondCut(
    [{
      facetAddress: test1Facet.address,
      action: FacetCutAction.Add,
      functionSelectors: selectors
    }],
    ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
  let receipt = await tx.wait()
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`)
  }

  console.log('Completed diamond cut for Test1Facet')
  // return test1Facet.address

   // 2- deploy new faucets and upgrade diamond (add) Test2Facet
   const Test2Facet = await ethers.getContractFactory('Test2Facet')
   const test2Facet = await Test2Facet.deploy()
   await test2Facet.deployed()
   console.log('Test2Facet deployed:', test2Facet.address)
 
   selectors = getSelectors(test2Facet)
   if (selectors.includes('supportsInterface(bytes4)')) {
    selectors.remove(['supportsInterface(bytes4)'])
   }
   console.log(`${selectors}`)
 
   tx = await diamondCutFacet.diamondCut(
     [{
       facetAddress: test2Facet.address,
       action: FacetCutAction.Add,
       functionSelectors: selectors
     }],
     ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
   receipt = await tx.wait()
   if (!receipt.status) {
     throw Error(`Diamond upgrade failed: ${tx.hash}`)
   }
 
   console.log('Completed diamond cut for Test2Facet')

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

exports.example_upgradeDiamond = example_upgradeDiamond;
