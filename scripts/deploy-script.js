const hre = require("hardhat");

async function main() {

//run with this for testing: npx hardhat run scripts/deploy-script.js --network rinkeby 
//run with this for mainnet: npx hardhat run scripts/deploy-script.js --network mainnet

// We get the contract to deploy

  const CarbonBitsContract = await hre.ethers.getContractFactory("CarbonBits");
  const CarbonBits = await CarbonBitsContract.deploy(sanctionsContract);

  await CarbonBits.deployed();

  
  console.log("CarbonBits deployed to:", CarbonBits.address);

  //For mainnet
    console.log(`See collection in Rarible:  https://rarible.com/token/${CarbonBits.address}`)
    console.log(`See collection in Opensea: https://opensea.io/${CarbonBits.address}`)
  
    await CarbonBits.createNewToken(process.env.PRIVATE_KEY_DEVELOPMENT,  1, ethers.utils.parseEther("0.001"), 5000, 3,"0x", "some_IPFS_CID_here")

  console.log("tokenMinted")

  await CarbonBits.transferOwnership("0xf7476355082BFD5001A578d04aacf812daFf13fF")

  console.log("Ownership Transferred")

}


const runMain = async () => {
  try {
      await main();
      process.exit(0);
  } catch (error) {
      console.log(error);
      process.exit(1);
  }
};


runMain();
