const { ethers } = require("hardhat");
const { expect } = require("chai");
import { getContract } from "./utils";

describe("Community", function () {
  it("Should mint", async function () {
    const contract = await getContract("Community");
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
    const contract = await getContract("Community");
    // mint
    const qty = 1;
    const mintPrice = await contract.MINT_PRICE();
    const tx = await contract.mint({ value: mintPrice.mul(qty) });
    const receipt = await tx.wait();
    let tokenId = receipt.logs[0].topics[3];
    // convert the tokenId to a number
    tokenId = parseInt(tokenId, 16);
    await expect(tokenId).to.equal(0);
  });
});
