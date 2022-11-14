import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deployer: ", deployer);

  const SignatureChecker = await deploy("SignatureChecker", {
    from: deployer,
    log: true,
  });
  await sleep(10000); // let the tx propagate to prevent nonce reuse

  await deploy("Contract", {
    from: deployer,
    args: [],
    log: true,
    libraries: {
      SignatureChecker: SignatureChecker.address,
    },
  });
};

export default func;
