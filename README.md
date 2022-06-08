# ERC1155 for fine-grained token creation and lazy minting

The ERC1155 standard allows for semi-fungible token creation. These are basically like limited edition NFTs, creating a limited amount of copies of any given token. They behave like an ERC20 in the sense that they can be batch transferred and any copy of a token is interchangeable with each other, but on the other hand the token are not divisible, just like ERC721 tokens.

This repo shows a use case where the owner can create new tokens with very fine grained control:
- Number of max tokens in the edition.
- Number of tokens allowed per mint.
- Number of tokens allowed per wallet.
- Set price of each token separatedly.
- Set URI of each token separatedly. 

After a token is created, any user can mint a new item of each edition, up to the maximum amount of tokens allowed in the whole collection. This is the ERC1155 version of **"Lazy minting"**. Be aware that this may not be the most efficient decision to optimize gas costs, given that the owner could mint all the tokens at once for a relatively low cost and then transfer them, but is relatively straightforward to implement and then let the users mint any given token in a website, without any backend development needed to manage a transfer for an already minted token.

This implementation is suitable for:
- Limited edition art collections.
- Access Passes to communities, where different tiers represent different price/access level.
- Claimable game rewards.

Other features:
- EIP-2981 royalties. Set to send 5% of sales proceeds to the deployer of the contract. Note that even if I am using (owner()) in the constructor, this is a piece of information that needs to be overwritten calling ````setRoyalties```` if the contract change Owner.
- - ````withdraw()```` function. This allows to withdraw all ETH from the contract to the Owner. 

## Useful commands to run the project 

You need to have Node.js (>=12.0)installed in your computer
You can find it [here](https://nodejs.org/en/)

## Install project dependencies
```bash
npm install
```

## Install dotenv to store environment variables and keep them secret

You need at least these variables in your .env file. BE SURE TO ADD IT TO GITIGNORE

*This is not compulsory, you could use public RPC URL, but Alchemys work really well and their free tier is more than enough (not sponsored)*
- DEVELOPMENT_ALCHEMY_KEY = "somestringhere"
- PRODUCTION_ALCHEMY_KEY = "somestringhere"

*Keys for deployment*
- PRIVATE_KEY_DEVELOPMENT = "somenumberhere"
- PRIVATE_KEY_PRODUCTION = "somenumberhere"


*To verify the contracts on Etherscan/polyscan etc*
- ETHERSCAN_KEY = "anothernumberhere"

# Use the project
## deploy contract 
run with this for testing: 
```bash
npx hardhat run scripts/deploy-script.js --network rinkeby 
```
run with this for mainnet: 
```bash
npx hardhat run scripts/deploy-script.js --network mainnet
```

# Run tests
```bash
npx hardhat test test/test.js 
```

## Verify contract 
```bash
npx hardhat verify --network **networkhere** **contractAddress**
```



