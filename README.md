# Project: Function Frontend of Smart Contract Management

This project contains code to practice interacting with the  smart contract through a website.

## Description

The files `index.js`, `MySmartContract.sol`, and `deploy.js` contain the necessary code to interact with the  smart contract through a front-end interface..

## Executing the project

To run the project on your local machine, follow these steps:

1. Clone this repository or download the ZIP file and extract it.
   
3. Inside the project directory, open a terminal and run `npm i`.

4. Open two additional terminals in your preferred code editor.

5. In the second terminal, run `npx hardhat node` to start the local Ethereum node.

6. In the third terminal, run `npx hardhat run --network localhost scripts/deploy.js` to deploy the smart contract to the local network.

7. Back in the first terminal, run `npm run dev` to launch the front-end application.

After following these steps, the project will be running on your local host, typically at http://localhost:3000/ . Make sure you have MetaMask connected to the local network you set up in order to interact with the smart contract through the front-end interface.

## Setting up the Local Network and MetaMask

To connect MetaMask with the local network, follow these steps:

1. Install the MetaMask browser extension. Click on the MetaMask extension in your browser.
2. Click on the network selection button in the top right corner.
3. Select "Add Network" and then "Custom RPC".
4. Provide a network name of your choice.
5. Set the RPC URL to `http://127.0.0.1:8545`.
6. Set the Chain ID to `31337`.
7. Set the Currency Symbol to `ETH`.
8. Save the network configuration.

Now you can interact with the smart contract through the front-end application using your MetaMask wallet connected to the local network.

---

Make sure to follow the instructions carefully and have the necessary dependencies installed to run the project successfully. Happy interacting with your smart contract!
