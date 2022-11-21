import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/community/setBaseURI.ts --network goerli
*/

const DESIRED_TOKEN_URI =
  "https://sdxcrypto-algovera.web.app/api/nft?address=0xFA39019319e36F191d30AC52D945b2BFC34758f9&tokenId=";

// check it starts with ipfs://
// if (!DESIRED_TOKEN_URI.startsWith("ipfs://")) {
//   throw new Error("DESIRED_TOKEN_URI must start with ipfs://");
// }

// // check it ends with /
// if (!DESIRED_TOKEN_URI.endsWith("/")) {
//   throw new Error("DESIRED_TOKEN_URI must end with /");
// }

async function main() {
  console.log("setting token uri to", DESIRED_TOKEN_URI);
  // get the contract
  const chainId = await hre.getChainId();
  const networkName = hre.network.name;
  let { contract, provider } = await getContract("Community", networkName);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "setBaseURI",
    [DESIRED_TOKEN_URI]
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
  const txnReceipt = await contract.setBaseURI(DESIRED_TOKEN_URI, {
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
