const { ethers } = require("hardhat");
const { expect } = require("chai");
import {
  createSignaturesCommunity,
  executeSignedMint,
  getContract,
} from "./utils";

describe("Community", function () {
  it("Mint", async function () {
    const contract = await getContract("Community");
    await contract.toggleMintingActive();
    const qty = 1;
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    const receipt = await executeSignedMint(
      contract,
      [signatures[signers[0].address], "testId"], // mint args
      signers[0], // minter
      0 // free mint
    );
    // check the supply has gone up
    const supply = await contract.totalSupply();
    await expect(supply).to.equal(qty);
    // check the minter's balance
    const balance = await contract.balanceOf(signers[0].address);
    await expect(balance).to.equal(qty);
    // check the tokenid was emitted
    let tokenId = receipt.logs[0].topics[3];
    tokenId = parseInt(tokenId, 16);
    await expect(tokenId).to.equal(0);
  });
});
