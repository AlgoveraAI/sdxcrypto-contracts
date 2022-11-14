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

    // ensure that the supply is right
    const supply = await contract.totalSupply();
    await expect(supply).to.equal(qty);
    // ensure that the owner has the token
    const owner = await contract.ownerOf(0);
    await expect(owner).to.equal(await contract.owner());
    // check the owners balance
    const balance = await contract.balanceOf(owner);
    await expect(balance).to.equal(qty);
  });
});
