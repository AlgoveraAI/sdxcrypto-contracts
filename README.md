# SDxCrypto Smart Contracts

## Install
`npm i`

## Setup
Create `.env` file with variables in `.env.example`

## Usage

### Deploy to a test network
*Get test ETH from https://goerlifaucet.com*

`npx hardhat deploy --network goerli --export-all deployments.json`


### Run a script (e.g. set the Base URI)
`npx hardhat run scripts/setBaseURI --network goerli`

### Run tests
`npx hardhat test`

### Check test coverage
`npx hardhat coverage`