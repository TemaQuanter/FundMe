const { network, run } = require("hardhat");
const { developmentChains } = require("../helper-config");

module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const args = [];

    // Deploying a contract

    const fundMe = await deploy("FundMe", {

        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1

    }); // end deploy()

    // Verify the deployed contract (only if it is deployed to the outer network)

    if (developmentChains.includes(network.name) == false) {

        await run("verify:verify", {
            address: fundMe.address,
            constructorArguments: []
        }); // end run()

    } // end if

} // end module.exports


module.exports.tags = ["all"];