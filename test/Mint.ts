import { expect } from "chai";
import { ethers } from "hardhat";

describe("Minting", function () {
  it("Should mint", async function () {
    const quantity = 1;

    const Contract = await ethers.getContractFactory("Contract");
    const contract = await Contract.deploy();
    await contract.deployed();

    const mintPrice = await contract.MINT_PRICE();

    // mint 1 from the default account (the contract owner)
    await contract.mint(quantity, { value: mintPrice });

    const owner = await contract.owner();
    // check the owner's balance
    expect(await contract.balanceOf(owner)).to.equal(quantity);
  });
});
