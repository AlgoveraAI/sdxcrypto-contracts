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
    await contract.mint(qty, { value: mintPrice.mul(qty) });

    // get the numer of tokens minted to this newly deployed contract
    const supply = await contract.totalSupply();
    // ensure that the supply is right
    await expect(supply).to.equal(qty);
  });
});
