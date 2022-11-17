const { ethers } = require("hardhat");
const { expect } = require("chai");
import { getContract } from "./utils";

describe("Access", function () {
  it("Sets URI", async function () {
    const contract = await getContract("Creator");
    const uri = "ipfs://test";
    await contract.setTokenMetadata(0, uri);
    const tokenURI = await contract.tokenURI(0);
    console.log("tokenURI: ", tokenURI);
    expect(tokenURI).to.equal(uri);
  });
});
