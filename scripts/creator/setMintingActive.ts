import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/creator/setMintingActive.ts --network goerli
*/

const tokenId = 0;
const mintingActive = true;

async function main() {
  console.log("Setting token price");
  console.log("Token ID", tokenId);
  console.log("Minting active", mintingActive);

  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  let { contract, provider } = await getContract("Creator", network);

  const currentState = await contract.mintingActive(tokenId);
  if (currentState === mintingActive) {
    console.log("Minting already set to", mintingActive);
    return;
  }

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "setMintingActive",
    [tokenId, mintingActive]
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
  const txnReceipt = await contract.setMintingActive(tokenId, mintingActive, {
    from: owner,
    value: 0,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("executed");

  // check the token URI
  const newState = await contract.mintingActive(tokenId);
  console.log("minting active", newState);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
