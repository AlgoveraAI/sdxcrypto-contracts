import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/community/toggleMintingActive.ts --network goerli
*/

async function main() {
  // get the contract
  const chainId = await hre.getChainId();
  const networkName = hre.network.name;
  let { contract, provider } = await getContract("Community", networkName);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "toggleMintingActive"
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
  const txnReceipt = await contract.toggleMintingActive({
    from: owner,
    value: 0,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("executed");

  // confirm that minting is active
  const mintingActive = await contract.mintingActive();
  console.log("mintingActive state", mintingActive);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
