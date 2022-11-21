import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/creator/toggleMintingActive.ts --network goerli
*/

const tokenId = 0;

async function main() {
  console.log("Toggling minting active");
  console.log("Token ID", tokenId);

  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  let { contract, provider } = await getContract("Creator", network);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "toggleMintingActive",
    [tokenId]
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
  const txnReceipt = await contract.toggleMintingActive(tokenId, {
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
