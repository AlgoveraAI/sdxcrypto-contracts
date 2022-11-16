import { HardhatRuntimeEnvironment } from "hardhat/types";

// npx hardhat deploy --network goerli --write true --tags access

module.exports = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deployer: ", deployer);
  console.log("Network:", hre.network.name);

  /// Deploy the contract
  await deploy("Access", {
    from: deployer,
    log: true,
    libraries: {},
  });
};

module.exports.tags = ["access"];
