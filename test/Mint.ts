const { ethers } = require("hardhat");
const { expect } = require("chai");

async function getContract() {
  const Contract = await ethers.getContractFactory("Contract");
  const contract = await Contract.deploy();
  await contract.deployed();
  return contract;
}

describe("Minting", function () {
  it("Should mint", async function () {
    const contract = await getContract();
    // mint
    const qty = 1;
    const mintPrice = await contract.MINT_PRICE();
    await contract.mint({ value: mintPrice.mul(qty) });

    // get the numer of tokens minted to this newly deployed contract
    const supply = await contract.totalSupply();
    // ensure that the supply is right
    await expect(supply).to.equal(qty);
  });
  it("Emits the tokenId", async function () {
    const contract = await getContract();
    // mint
    const qty = 1;
    const mintPrice = await contract.MINT_PRICE();
    const tx = await contract.mint({ value: mintPrice.mul(qty) });
    const receipt = await tx.wait();
    console.log("Events: ", receipt.events);
    console.log("Logs: ", receipt.logs);
    let tokenId = receipt.logs[0].topics[3];
    // convert the tokenId to a number
    tokenId = parseInt(tokenId, 16);
    console.log("TokenId: ", tokenId);
    await expect(tokenId).to.equal(0);
  });
});
