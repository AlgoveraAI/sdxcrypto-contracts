import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/setTokenURI.ts --network goerli
*/

const tokenId = 0;
const metadataPath = `../metadata/access_${tokenId}.json`;

async function main() {
  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  let { contract, provider } = await getContract("Access", network);

  // load the metadata
  const metadata = require(metadataPath);
  console.log("metadata", metadata);

  // make the metadata a string
  const metadataString = JSON.stringify(metadata);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "setTokenMetadata",
    [tokenId, metadataString]
  );
  const owner = await contract.owner();
  const tx = {
    to: contract.address,
    value: 0,
    data: methodSignature,
    from: owner,
  };
  const gasEstimate = await provider.estimateGas(tx);

  // send the transaction to transfer ownership
  const txnReceipt = await contract.setTokenMetadata(tokenId, metadataString, {
    from: owner,
    value: 0,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("executed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
