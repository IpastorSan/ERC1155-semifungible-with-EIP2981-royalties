const hre = require("hardhat");

async function main() {

//run with this for testing: npx hardhat run scripts/deploy-script.js --network rinkeby 
//run with this for mainnet: npx hardhat run scripts/deploy-script.js --network mainnet

// We get the contract to deploy
  
  const NFTContractAddress = process.env.NFT_PUBLIC_ADDRESS
  const NFTPRICE = "0.1"
  const nftId = 2
  const nftMetadataAddress = "someCIDfromIPFS"
  
  console.log("Connected to NFT Contract")

  const minterPrivateKey = process.env.PRIVATE_KEY
  const minterAccount = new ethers.Wallet(minterPrivateKey).connect(hre.ethers.provider)
  console.log(`Connected to Wallet ${minterAccount.address}`)
  console.log(`Wallet provider: ${minterAccount.provider}`)

  const connect2NftMint = await hre.ethers.getContractAt("AccessKey", NFTContractAddress, minterAccount)
  console.log(`Connected to Contract ${connect2NftMint.address} with signer ${connect2NftMint.signer}`)

  txn = await connect2NftMint.createNewToken(minterAccount.address,  0, ethers.utils.parseEther(NFTPRICE), 5000, 5,"0x", nftMetadataAddress)

  console.log(`NFT Minted with txn hash: ${txn.hash}`)
  
  //await connect2NftMint.mintToUser(nftId, 1, "0x", {value: ethers.utils.parseUnits(NFTPRICE, "ether"), gasPrice:10000000000, gasLimit:1000000}) 
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