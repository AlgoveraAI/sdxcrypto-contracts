# SDxCrypto Smart Contracts

## Install
`npm i`

## Setup
Create `.env` file with variables in `.env.example`

## Usage

### Deploy all contracts to a test network
*Get test ETH from https://goerlifaucet.com*

`npx hardhat deploy --network goerli --write true`

Or you can deploy to the local hardhat network.

`npx hardhat deploy --network hardhat --write true`

And you can specify one of the two contracts. E.g. to deploy Access.sol

`npx hardhat deploy --network hardhat --write true --tags access`

### Verify
`npx hardhat verify <address> --network goerli`


### Run a script (e.g. set the Base URI)
`npx hardhat run scripts/setBaseURI --network goerli`

### Run tests
`npx hardhat test`

### Check test coverage
`npx hardhat coverage`