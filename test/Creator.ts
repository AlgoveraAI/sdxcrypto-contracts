const { ethers } = require("hardhat");
const { expect } = require("chai");
import { getContract } from "./utils";

describe("Creator", function () {
  it("Fails to mint if uri not set", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setMintingActive(tokenId, true);
    await expect(
      contract.mint(tokenId, { value: mintPrice })
    ).to.be.revertedWith("URI not set");
  });
  it("Fails to mint if price not set", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.setMintingActive(tokenId, true);
    await expect(contract.mint(tokenId, { value: 0 })).to.be.revertedWith(
      "Price not set"
    );
  });
  it("Fails to mint if minting not active", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await expect(
      contract.mint(tokenId, { value: mintPrice })
    ).to.be.revertedWith("Minting not active");
  });
  it("Mints", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.setMintingActive(tokenId, true);
    await contract.mint(tokenId, { value: mintPrice });
    // get the numer of tokens minted to this newly deployed contract
    const supply = await contract.totalSupply();
    // ensure that the supply is right
    await expect(supply).to.equal(1);
  });
  it("Sets URI", async function () {
    const contract = await getContract("Creator");
    const uri = "ipfs://test";
    await contract.setTokenURI(0, uri);
    const tokenURI = await contract.tokenURI(0);
    console.log("tokenURI: ", tokenURI);
    expect(tokenURI).to.equal(uri);
  });
  it("Sets a price", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    const tokenPrice = await contract.tokenPrices(tokenId);
    console.log("tokenPrice: ", tokenPrice);
    expect(tokenPrice).to.equal(mintPrice);
  });
  it("Sets mintingActive", async function () {
    const contract = await getContract("Creator");
    await contract.setMintingActive(0, true);
    const mintingActive = await contract.mintingActive(0);
    console.log("mintingActive: ", mintingActive);
    expect(mintingActive).to.equal(true);
  });
});
