import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/access/setTokenURI.ts --network goerli
*/

const tokenId = 0;
const tokenURI =
  "ipfs://bafkreigt7pmthylgfv5qzhlsbox5pkgre5bnharzlz5vvngyzuxqfzjeci";

async function main() {
  console.log("Setting token URI");
  console.log("Token ID", tokenId);
  console.log("Token URI", tokenURI);

  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  let { contract, provider } = await getContract("Access", network);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "setTokenURI",
    [tokenId, tokenURI]
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
  const txnReceipt = await contract.setTokenURI(tokenId, tokenURI, {
    from: owner,
    value: 0,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("executed");

  // check the token URI
  const newtokenURI = await contract.uri(tokenId);
  console.log("tokenURI", newtokenURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
