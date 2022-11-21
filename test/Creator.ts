const { ethers } = require("hardhat");
const { expect } = require("chai");
import {
  getContract,
  createSignaturesCreator,
  executeSignedMint,
} from "./utils";

describe("Creator minting fail cases", function () {
  it("Fails to mint if uri not set", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.toggleMintingActive(tokenId);
    const emptyBytes = ethers.utils.formatBytes32String("");
    await expect(
      contract.mint(tokenId, emptyBytes, { value: mintPrice })
    ).to.be.revertedWith("URI not set");
  });
  it("Fails to mint if minting not active", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    const emptyBytes = ethers.utils.formatBytes32String("");

    await expect(
      contract.mint(tokenId, emptyBytes, { value: mintPrice })
    ).to.be.revertedWith("Minting not active");
  });
  it("Fails to mint with incorrect signature", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const { signatures, signers } = await createSignaturesCreator(
      contract,
      tokenId,
      0 // free mint as specified in the signature
    );
    await expect(
      executeSignedMint(
        contract,
        [tokenId, signatures[signers[0].address]],
        signers[1],
        0 // free mint as specified in the signature
      )
    ).to.be.revertedWith("SignatureChecker: Invalid signature");
  });
  it("Fails to mint multiple tokens", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const owner = await contract.owner();
    await contract.addSigner(owner);
    const { signatures, signers } = await createSignaturesCreator(
      contract,
      tokenId,
      0 // free mint as specified in the signature
    );
    // use the signature in a mint
    await executeSignedMint(
      contract,
      [tokenId, signatures[signers[0].address]],
      signers[0],
      0 // free mint as specified in the signature
    );
    // try to use the same signature again
    await expect(
      executeSignedMint(
        contract,
        [tokenId, signatures[signers[0].address]],
        signers[0],
        0 // free mint as specified in the signature
      )
    ).to.be.revertedWith("Already minted");
    // confirm others can use their own unused sigs
    await executeSignedMint(
      contract,
      [tokenId, signatures[signers[1].address]],
      signers[1],
      0 // free mint as specified in the signature
    );
  });
});

describe("Creator minting success cases", function () {
  it("Signed mint", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const owner = await contract.owner();
    await contract.addSigner(owner);
    const { signatures, signers } = await createSignaturesCreator(
      contract,
      tokenId,
      0 // free mint as specified in the signature
    );
    // confirm that signer[0] != signer[1]
    expect(signers[0].address).to.not.equal(signers[1].address);

    // try from first account
    await executeSignedMint(
      contract,
      [tokenId, signatures[signers[0].address]],
      signers[0],
      0 // free mint as specified in the signature
    );
    await expect(
      await contract.balanceOf(signers[0].address, tokenId)
    ).to.equal(1);
    // try from second account
    await executeSignedMint(
      contract,
      [tokenId, signatures[signers[1].address]],
      signers[1],
      0 // free mint as specified in the signature
    );
    await expect(
      await contract.balanceOf(signers[1].address, tokenId)
    ).to.equal(1);
  });
  it("Unsigned mint", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const emptySignature = "0x";
    await contract.mint(tokenId, emptySignature, { value: mintPrice });
    console.log("Checking balance");
    const signerBalance = await contract.balanceOf(
      await contract.owner(),
      tokenId
    );
    await expect(signerBalance).to.equal(1);
  });
});

describe("Creator utils", function () {
  it("Sets URI", async function () {
    const contract = await getContract("Creator");
    const uri = "ipfs://test";
    await contract.setTokenURI(0, uri);
    const tokenURI = await contract.uri(0);
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
  it("Toggles mintingActive", async function () {
    const contract = await getContract("Creator");
    await contract.toggleMintingActive(0);
    const mintingActive = await contract.mintingActive(0);
    console.log("mintingActive: ", mintingActive);
    expect(mintingActive).to.equal(true);
  });
});

describe("Creator transfers", function () {
  it("Fails to transfer a minted token", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const owner = await contract.owner();
    await contract.addSigner(owner);
    const { signatures, signers } = await createSignaturesCreator(
      contract,
      tokenId,
      0 // free mint as specified in the signature
    );
    // mint a token
    await executeSignedMint(
      contract,
      [tokenId, signatures[signers[0].address]],
      signers[0],
      0 // free mint as specified in the signature
    );
    // try to transfer the token
    await expect(
      contract.safeTransferFrom(
        signers[0].address,
        signers[1].address,
        tokenId,
        1,
        "0x"
      )
    ).to.be.revertedWith("Transfers disabled");
  });
  it("Fails to batch transfer a minted token", async function () {
    const contract = await getContract("Creator");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const owner = await contract.owner();
    await contract.addSigner(owner);
    const { signatures, signers } = await createSignaturesCreator(
      contract,
      tokenId,
      0 // free mint as specified in the signature
    );
    // mint a token
    await executeSignedMint(
      contract,
      [tokenId, signatures[signers[0].address]],
      signers[0],
      0 // free mint as specified in the signature
    );
    // try to transfer the token
    await expect(
      contract.safeBatchTransferFrom(
        signers[0].address,
        signers[1].address,
        [tokenId],
        [1],
        "0x"
      )
    ).to.be.revertedWith("Transfers disabled");
  });
});
