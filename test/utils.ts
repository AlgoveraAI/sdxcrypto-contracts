const { ethers } = require("hardhat");
export async function getContract(contractName: string) {
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy();
  await contract.deployed();
  return contract;
}
