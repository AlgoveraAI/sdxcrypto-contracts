const { ethers } = require("hardhat");
const {
  getSignatureCreator,
  getSignatureCommunity,
} = require("../scripts/utils");
const { Signer, Contract } = require("ethers");

export async function getContract(contractName: string) {
  let constructorArgs: string[] = [];
  if (contractName === "Creator") {
    constructorArgs = ["Creator", "CREATOR"];
  }
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...constructorArgs);
  //   const contract = await Contract.deploy(...constructorArgs);
  await contract.deployed();
  return contract;
}

export async function createSignaturesCreator(
  contract: any,
  tokenId: number,
  price: number
) {
  const [owner, signer1, signer2, signer3] = await ethers.getSigners();

  // dont include the owner
  const signers = [signer1, signer2, signer3];
  //   const signers = [signer1];

  // create the signatures
  const signatures: any = {};
  for (const signer of signers) {
    signatures[signer.address] = await getSignatureCreator(
      owner, // signature signer
      contract.address,
      signer.address, // buyer (will sign the mint txn)
      tokenId,
      price
    );
  }

  return { signatures, signers };
}

export async function createSignaturesCommunity(contract: any) {
  const [owner, signer1, signer2, signer3] = await ethers.getSigners();

  // dont include the owner
  const signers = [signer1, signer2, signer3];
  //   const signers = [signer1];

  // create the signatures
  const signatures: any = {};
  for (const signer of signers) {
    let bal = await contract.balanceOf(signer.address);
    signatures[signer.address] = await getSignatureCommunity(
      owner, // signature signer
      contract.address,
      signer.address, // buyer (will sign the mint txn)
      bal
    );
  }

  return { signatures, signers };
}

export async function executeSignedMint(
  contract: typeof Contract,
  args: any[],
  signer: typeof Signer,
  value: number
) {
  console.log("Executing signed mint with args", args);
  const methodSig = await contract.interface.encodeFunctionData("mint", args);
  const tx = await signer.sendTransaction({
    to: contract.address,
    value: value,
    data: methodSig,
  });
  const receipt = await tx.wait();
  return receipt;
}
