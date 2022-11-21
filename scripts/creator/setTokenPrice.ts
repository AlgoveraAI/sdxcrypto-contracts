import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/creator/setTokenPrice.ts --network goerli
*/

const tokenId = 0;
const tokenPrice = 0;

async function main() {
  console.log("Setting token price");
  console.log("Token ID", tokenId);
  console.log("Token Price", tokenPrice);

  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  let { contract, provider } = await getContract("Creator", network);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "setTokenPrice",
    [tokenId, 0]
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
  const txnReceipt = await contract.setTokenPrice(tokenId, 0, {
    from: owner,
    value: 0,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("executed");

  // check the token URI
  const newPrice = await contract.tokenPrices(tokenId);
  console.log("price", newPrice);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
