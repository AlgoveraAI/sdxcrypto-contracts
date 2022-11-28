const { ethers } = require("hardhat");
const { expect } = require("chai");
import {
  createSignaturesCommunity,
  executeSignedMint,
  getContract,
} from "./utils";

describe("Minting tests", function () {
  it("Mints", async function () {
    const contract = await getContract("Community");
    await contract.toggleMintingActive();
    const qty = 1;
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    const receipt = await executeSignedMint(
      contract,
      [signatures[signers[0].address]], // mint args (signature)
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
  it("Fails to reuse a signature", async function () {
    const contract = await getContract("Community");
    await contract.toggleMintingActive();
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    await executeSignedMint(
      contract,
      [signatures[signers[0].address]], // mint args (signature)
      signers[0], // minter
      0 // free mint
    );
    await expect(
      executeSignedMint(
        contract,
        [signatures[signers[0].address]], // mint args (signature)
        signers[0], // minter
        0 // free mint
      )
    ).to.be.revertedWith("SignatureChecker: Invalid signature");
  });
  it("Fails to use an invalid signature", async function () {
    const contract = await getContract("Community");
    await contract.toggleMintingActive();
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    await executeSignedMint(
      contract,
      [signatures[signers[0].address]], // mint args (signature)
      signers[0], // minter
      0 // free mint
    );
    await expect(
      executeSignedMint(
        contract,
        [signatures[signers[1].address]], // wrong signature
        signers[0], // minter
        0 // free mint
      )
    ).to.be.revertedWith("SignatureChecker: Invalid signature");
  });
  it("Fails to mint if minting inactive", async function () {
    const contract = await getContract("Community");
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    await expect(
      executeSignedMint(
        contract,
        [signatures[signers[0].address]], // mint args (signature)
        signers[0], // minter
        0 // free mint
      )
    ).to.be.revertedWith("Minting not active");
  });
});

describe("Utils", function () {
  it("Sets and gets the base URI", async function () {
    const contract = await getContract("Community");
    await contract.toggleMintingActive();
    await contract.setBaseURI("https://test.com/");
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    await executeSignedMint(
      contract,
      [signatures[signers[0].address]], // mint args (signature)
      signers[0], // minter
      0 // free mint
    );
    const uri = await contract.tokenURI(0);
    await expect(uri).to.equal("https://test.com/0");
  });
  it("Withdraws ETH from accidental paid mint", async function () {
    const contract = await getContract("Community");
    await contract.toggleMintingActive();
    await contract.addSigner(await contract.owner());
    const { signatures, signers } = await createSignaturesCommunity(contract);
    const mintValue = ethers.utils.parseEther("0.1");
    await executeSignedMint(
      contract,
      [signatures[signers[0].address]], // mint args (signature)
      signers[0], // minter
      mintValue // paid mint
    );
    const balance = await ethers.provider.getBalance(contract.address);
    await expect(balance).to.equal(mintValue);
    await contract.withdrawETH();
    const balanceAfter = await ethers.provider.getBalance(contract.address);
    await expect(balanceAfter).to.equal(ethers.utils.parseEther("0"));
  });
});
