import { getContract, getSignatureCreator } from "../utils";
const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const admin = require("firebase-admin");

/*
npx hardhat run scripts/creator/generateSignatures.ts --network goerli
*/

const TOKEN_ID = 0; // the token id that signatures can be used to mint
const PRICE = 0; // the ETH price that the token can be minted at

async function main() {
  // prepare firestore
  admin.initializeApp();
  const firestore = admin.firestore();

  const [signer] = await ethers.getSigners();
  console.log("signer", signer.address);

  // get the contract
  const network = hre.network.name;
  let { contract } = await getContract("Creator", network);

  const filepath = `../../creator_allocation.json`;
  const allocation = require(filepath); // a list of addresses (all get 1)

  console.log(allocation.length, "addresses in allocation");

  for (let i = 0; i < allocation.length; i++) {
    // checksummed
    const address = ethers.utils.getAddress(allocation[i]);

    const sig = await getSignatureCreator(
      signer,
      contract.address,
      address,
      TOKEN_ID,
      PRICE
    );

    // store signature straight to firebase
    // (requires GOOGLE_APPLICATION_CREDENTIALS in .env)
    const docRef = firestore
      .collection("creator_pass_signatures")
      .doc(network)
      .collection(contract.address)
      .doc(`token_${TOKEN_ID}`)
      .collection("wallets")
      .doc(address);

    await docRef.set({
      sig,
      tokenId: TOKEN_ID,
      price: PRICE,
    });
  }
  console.log("signatures uploaded to firebase");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
