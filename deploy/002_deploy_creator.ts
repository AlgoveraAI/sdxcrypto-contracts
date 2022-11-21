import { HardhatRuntimeEnvironment } from "hardhat/types";

// npx hardhat deploy --network goerli --write true --tags creator

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deployer: ", deployer);
  console.log("Network:", hre.network.name);

  const SignatureChecker = await deploy("SignatureChecker", {
    from: deployer,
    log: true,
  });
  await sleep(10000); // let the tx propagate to prevent nonce reuse

  /// Deploy the contract
  const name = "Creator";
  const symbol = "CREATOR";
  await deploy("Creator", {
    from: deployer,
    args: [name, symbol],
    log: true,
    libraries: {
      SignatureChecker: SignatureChecker.address,
    },
  });
};

module.exports.tags = ["creator"];
