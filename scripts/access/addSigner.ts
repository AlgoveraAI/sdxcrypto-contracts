import { getContract } from "../utils";
const hre = require("hardhat");
const { ethers } = hre;
/*
npx hardhat run scripts/access/addSigner.ts --network goerli
*/

// unlike community.sol, the signer here is our main deployment address
// (not the burner wallet running serverlessly for the frontend)

async function main() {
  // get the contract
  const [signer] = await ethers.getSigners();
  console.log("Adding signer (owner)", signer.address);
  const networkName = hre.network.name;
  let { contract, provider } = await getContract("Access", networkName);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "addSigner",
    [signer.address]
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
  const txnReceipt = await contract.addSigner(signer.address, {
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
