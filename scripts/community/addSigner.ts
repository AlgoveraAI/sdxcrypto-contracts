import { ethers } from "ethers";
import { getContract } from "../utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/community/addSigner.ts --network goerli
*/

const SIGNER = "0x0ca16cb15db1C0F6c251dA492F0311270B3de5B2";

async function main() {
  // get the contract
  console.log("Adding signer", SIGNER);
  const networkName = hre.network.name;
  let { contract, provider } = await getContract("Community", networkName);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "addSigner",
    [SIGNER]
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
  const txnReceipt = await contract.addSigner(SIGNER, {
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
