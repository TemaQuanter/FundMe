require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");

require("dotenv").config();

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const GOERLI_RPC_KEY = process.env.GOERLI_RPC_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {

    solidity: "0.8.17",
    networks: {

        goerli: {

            url: GOERLI_RPC_KEY,
            chainId: 5,
            accounts: [DEPLOYER_PRIVATE_KEY],
            blockConfirmations: 3

        }

    },
    namedAccounts: {

        deployer: {

            default: 0

        },
        user: {

            default: 1

        }

    },
    mocha: {

        timeout: 1000000

    },
    etherscan: {

        apiKey: {

            goerli: ETHERSCAN_API_KEY

        }
        
    }

};
