const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonBits", () => {
  let nftFactory;
  let nft;
  let owner;
  let alice;
  let bob;

  beforeEach(async () => {
    let signers = await ethers.getSigners()
    ownerAccount = signers[0]
    aliceAccount = signers[1]
    bobAccount = signers[2]

    owner = ownerAccount.address
    alice = aliceAccount.address 
    bob = bobAccount.address


    nftFactory = await ethers.getContractFactory("CarbonBits")
    nft = await nftFactory.deploy()

    await nft.createNewToken(owner, 1, ethers.utils.parseUnits("5", "ether"), 1000, 5, "0x", "QmXgePKdYNwX7gN9yjjMA97q23buh1T7HqBDKyzhEnVMnZ")


  })

  describe("Minting process", () => {
    it("Should create a new token with max supply 100, price 5, max tokens per address 2, mint 0 units to creator", async () => {
      await nft.createNewToken(owner, 0, ethers.utils.parseUnits("5", "ether"), 100, 2, "0x", "QmXgePKdYNwX7gN9yjjMA97q23buh1T7HqBDKyzhEnVMnZ")
      expect(await nft.getCurrentId()).to.be.equal(2)
      expect(await nft.getTotalSupplyByTokenId(2)).to.be.equal(0)
      expect(await nft.maxTokensPerId(2)).to.be.equal(100)
      expect(await nft.maxTokensPerAddress(2)).to.be.equal(2)
      expect(await nft.tokenPrice(2)).to.be.equal(ethers.utils.parseUnits("5", "ether"))
      expect(await nft.owner()).to.be.equal(owner)
    })

    it("Should create a new token with max supply 100, price 5, max tokens per address 2, mint 10 units to creator", async () => {
    await nft.createNewToken(owner, 10, ethers.utils.parseUnits("5", "ether"), 100, 2, "0x", "QmXgePKdYNwX7gN9yjjMA97q23buh1T7HqBDKyzhEnVMnZ")
    expect(await nft.getCurrentId()).to.be.equal(2)
    expect(await nft.getTotalSupplyByTokenId(2)).to.be.equal(10)
    expect(await nft.maxTokensPerId(2)).to.be.equal(100)
    expect(await nft.maxTokensPerAddress(2)).to.be.equal(2)
    expect(await nft.tokenPrice(2)).to.be.equal(ethers.utils.parseUnits("5", "ether"))
    expect(await nft.balanceOf(owner, 2)).to.be.equal(10)
    })

    it("should allow user (not owner) to mint 1 token with exact price", async () => {
      await nft.connect(aliceAccount).mintToUser(1, 1, "0x", {value: ethers.utils.parseEther("5")})
      expect(await nft.balanceOf(alice, 1)).to.be.equal(1)
    })

    it("should allow user (not owner) to mint 2 tokens with exact price", async () => {
      await nft.connect(aliceAccount).mintToUser(1, 2, "0x", {value: ethers.utils.parseEther("10")})
      expect(await nft.balanceOf(alice, 1)).to.be.equal(2)
    })

    it("should fail to allow user (not owner) to mint more than the max amount of tokens per address", async () => {
      await expect( nft.connect(aliceAccount).mintToUser(1, 20, "0x", {value: ethers.utils.parseEther("100")})).to.be.revertedWith('Cannot mint more tokens with the same address')
    })

    it("should fail to allow user (not owner) to mint more than the max amount of tokens", async () => {
      await nft.createNewToken(owner, 8, ethers.utils.parseUnits("5", "ether"), 10, 2, "0x", "QmXgePKdYNwX7gN9yjjMA97q23buh1T7HqBDKyzhEnVMnZ")
      await expect( nft.connect(aliceAccount).mintToUser(2, 3, "0x", {value: ethers.utils.parseEther("15")})).to.be.revertedWith('Not enough tokens left in the collection')
    })

    it("should fail to allow user (not owner) to mint if not enought ether sent", async () => {
      await expect( nft.connect(aliceAccount).mintToUser(1, 1, "0x", {value: ethers.utils.parseEther("4")})).to.be.revertedWith('Not enough/too much ether sent')
    })

    it("should fail to allow user (not owner) to mint if more ether sent than necessary", async () => {
      await expect( nft.connect(aliceAccount).mintToUser(1, 1, "0x", {value: ethers.utils.parseEther("40")})).to.be.revertedWith('Not enough/too much ether sent')
    })
  })

  describe("Transfer of tokens", () => {
    it("should mint and transfer a token from user Alice to user Bob", async () => {
      await nft.connect(aliceAccount).mintToUser(1, 1, "0x", {value: ethers.utils.parseEther("5")})
      await nft.connect(aliceAccount).safeTransferFrom(alice, bob, 1, 1, "0x")

      expect(await nft.balanceOf(alice, 1)).to.be.equal(0)
      expect(await nft.balanceOf(bob, 1)).to.be.equal(1)
    })
  })

  describe("withdrawal of funds", () => {

    it("should sell 2 NFTs and allow withdrawal of funds to owners address", async() => {
      await nft.connect(aliceAccount).mintToUser(1, 2, "0x", {value: ethers.utils.parseEther("10")})
      expect(await nft.balanceOf(alice, 1)).to.be.equal(2)

      await expect(() => nft.withdraw()).to.changeEtherBalance(ownerAccount, ethers.utils.parseEther("10"))
    })
  })

describe("CarbonBits Royalties", () => {
  let nftFactory;
  let nft;
  let marketplaceFactory;
  let marketplace
  let owner;
  let alice;
  let bob;

  beforeEach(async () => {
    let signers = await ethers.getSigners()
    ownerAccount = signers[0]
    aliceAccount = signers[1]
    bobAccount = signers[2]

    owner = ownerAccount.address
    alice = aliceAccount.address 
    bob = bobAccount.address

    nftFactory = await ethers.getContractFactory("CarbonBits")
    marketplaceFactory = await ethers.getContractFactory("BasicMarketplaceRoyalties")

    nft = await nftFactory.deploy()
    marketplace = await marketplaceFactory.deploy()

    await nft.createNewToken(owner, 10, ethers.utils.parseUnits("5", "ether"), 1000, 5, "0x", "QmXgePKdYNwX7gN9yjjMA97q23buh1T7HqBDKyzhEnVMnZ")
    await marketplace.setNFTContract(nft.address)
    await nft.setRoyaltiesAddress(owner)


  })
  it("should aprove, list and sell a token in the marketplace, 10% of price should go to royalties address", async () => {
    await nft.connect(aliceAccount).mintToUser(1, 1, "0x", {value: ethers.utils.parseEther("5")})
    await nft.connect(aliceAccount).setApprovalForAll(marketplace.address, true)
    await marketplace.connect(aliceAccount).listNft(1, ethers.utils.parseEther("10"))

    await expect(()=> marketplace.connect(bobAccount).buyExactMatchNative(1, 1, "0x", {value:ethers.utils.parseEther("10")}).to.changeEtherBalances([alice, bob, owner], [9, -10, 1]))
    

  })

})

});
