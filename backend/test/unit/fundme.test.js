const { network, getNamedAccounts, deployments, ethers, waffle } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-config");


// Run this test session only if it is a development chain

if (developmentChains.includes(network.name)) {

    describe("FundMe", () => {

        let fundMe;
        let deployer;
        let randomUsers;
        const provider = waffle.provider;
    
        beforeEach(async () => {
    
            deployer = (await getNamedAccounts()).deployer;
            randomUsers = (await ethers.getSigners()).slice(1);
    
            await deployments.fixture(["all"]);
    
            fundMe = await ethers.getContract("FundMe", deployer);
    
        }); // end beforeEach
    
    
        describe("constructor", () => {
    
            it("The contract owner is set properly", async () => {
    
                assert.equal((await fundMe.getContractOwner()).toString(), deployer.toString());
    
            }); // end it
    
        }); // end describe
    
    
        describe("fund", () => {
    
            it("The donator is successfully added to the list of contributors", async () => {
    
                const tx = await fundMe.fund({ value: ethers.utils.parseEther("0.01")});
                await tx.wait(1);
    
                assert.equal((await fundMe.getAllDonators()), deployer);
    
            }); // end it
    
    
            it("Multiple donators are added to the list of contributors", async () => {
    
                for (let i = 0; i < randomUsers.length; i++) {
    
                    const reconnectedFundMe = fundMe.connect(randomUsers[i]);
    
                    const tx = await reconnectedFundMe.fund({ value: ethers.utils.parseEther("0.01") });
                    await tx.wait(1);
    
                } // end for
    
                assert.equal((await fundMe.getAllDonators()).length, randomUsers.length);
    
            }); // end it
    
    
            it("A contract has all the funds which were donated to it", async () => {
    
                const amount = ethers.utils.parseEther("0.01");
    
                for (let i = 0; i < randomUsers.length; i++) {
    
                    const reconnectedFundMe = fundMe.connect(randomUsers[i]);
    
                    const tx = await reconnectedFundMe.fund({ value: amount });
                    await tx.wait(1);
    
                } // end for
    
                assert.equal((await fundMe.getTotalValueDonated()).toString(), amount.mul(randomUsers.length.toString()).toString());
    
            }); // end it
    
        }); // end describe
    
    
        describe("getAmountDonated", () => {
    
            it("Showes the amount of funds donated by a particular address properly", async () => {
    
                const tx = await fundMe.fund({ value: ethers.utils.parseEther("0.01")});
                await tx.wait(1);
    
                assert.equal((await fundMe.getAmountDonated(deployer)).toString(), ethers.utils.parseEther("0.01").toString());
    
            });
    
        }); // end describe
    
        
        describe("receive", () => {
    
            it("Works in case a contributor donates by sending the funds directly to a contract", async () => {
    
                const amount = ethers.utils.parseEther("0.01");
    
                const tx = await randomUsers[0].sendTransaction({
                    from: randomUsers[0].address,
                    to: fundMe.address,
                    value: amount
                });
    
                await tx.wait(1);
    
    
                assert.equal((await fundMe.getAmountDonated(randomUsers[0].address)).toString(), amount.toString());
    
            }); // end it
    
        }); // end describe
    
    
        describe("withdraw", () => {
    
            it("The owner of a contract can withdraw all the funds", async () => {
    
                const amount = ethers.utils.parseEther("0.01");
                let tx;
                let txReceipt;
                let cumulativeGasUsedPrice;
    
                const initialFunds = (await provider.getBalance(deployer)).toString();
    
                // Top up the balance of a contract
    
                tx = await fundMe.fund({ value: amount });
                txReceipt = await tx.wait(1);
    
                cumulativeGasUsedPrice = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
                
    
                // Try to withdraw the funds
    
                tx = await fundMe.withdraw();
                txReceipt = await tx.wait(1);
    
                cumulativeGasUsedPrice = cumulativeGasUsedPrice.add(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice));
    
                assert.equal((await provider.getBalance(deployer)).add(cumulativeGasUsedPrice).toString(), initialFunds);
    
            }); // end it
    
    
            it("Only the contract owner can withdraw the funds", async () => {
    
                const amount = ethers.utils.parseEther("0.01");
    
                // Top up the contract's balance from various addresses
    
                const len = Math.floor(randomUsers.length / 2);
    
                for (let i = 0; i < len; i++) {
    
                    const connectedFundMe = fundMe.connect(randomUsers[i]);
    
                    const tx = await connectedFundMe.fund({ value: amount });
                    await tx.wait(1);
    
                } // end for
    
                // Check that non of the addresses, except the owner of a contract can withdraw funds
    
                for (let i = 0; i < randomUsers.length; i++) {
    
                    // Attempt to withdraw funds using a non contract owner address
    
                    const connectedFundMe = fundMe.connect(randomUsers[i]);
    
                    await expect(connectedFundMe.withdraw()).to.be.revertedWith("FundMe__OnlyOwner");
    
                } // end for
    
                // Check if a contract owner is still able to get the funds
    
                await expect(fundMe.withdraw()).to.be.not.reverted;
    
            }); // end it
    
        }); // end describe
    
    }); // end describe

} else {

    describe.skip;

}
