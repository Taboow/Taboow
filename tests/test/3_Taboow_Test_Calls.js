// var Taboow = artifacts.require("Taboow");
// var Taboow1 = artifacts.require("Taboow_Broker");
// var Taboow2 = artifacts.require("TaboowCYC2");
// var expectThrow = require('./helper.js');
//
// contract('Taboow Test',  async (accounts) => {
//
//   it("should initialize functions and variables to start running", async () => {
//        let account_one = accounts[0];
//        let account_two = accounts[2];
//
//        let instance = await Taboow.deployed();
//        let meta = instance;
//
//        let tbwAddr = meta.address;
//
//        let instance1 = await Taboow1.deployed();
//        let meta1 = instance1;
//
//        let tbwAddr1 = meta1.address;
//
//        await meta.setTaboowAddr(tbwAddr1);
//        await meta1.setTaboow(tbwAddr);
//
//        await meta.verifyAccount(account_one, true);
//        await meta.verifyAccount(account_two, true);
//
//        let taboowAddr = await meta1.taboowAddr();
//        console.log(taboowAddr);
//
//        let isVerifiedOne = await meta1.isVerified(account_one);
//        console.log(isVerifiedOne);
//
//        let isVerifiedTwo = await meta1.isVerified(account_two);
//        console.log(isVerifiedTwo);
//
//        assert.equal(isVerifiedOne, true, "account_one verification must be equal to true");
//        assert.equal(isVerifiedTwo, true, "account_two verification must be equal to true");
//        assert.equal(taboowAddr, tbwAddr, "tbwAddr must be equal to taboowAddr");
//
//      });
//
//   it("checks that calls throws revert", async () => {
//     let account_one = accounts[0];
//     let account_two = accounts[2];
//     let account_three = accounts[3];
//
//     let instance = await Taboow1.deployed();
//     let meta = instance;
//
//     let instance1 = await Taboow.deployed();
//     let meta1 = instance1;
//
//     console.log("Taboow Broker address should be allowed to reserveTokens");
//
//     let owned = await meta1.owners(meta.address) ;
//     console.log(owned);
//
//     let isVerifiedOne = await meta.isVerified(account_one);
//     console.log(isVerifiedOne);
//
//     let isVerifiedContract = await meta.isVerified(meta.address);
//     console.log(isVerifiedContract);
//
//     await meta1.verifyAccount(meta.address, true);
//
//     let amount = 200000000000000000;
//
//     await meta.setPubEnd(9928064138);
//
//     let reservedBefore = await meta1.reserve(account_one);
//     reservedBefore = reservedBefore.toNumber();
//     console.log(reservedBefore);
//
//     let tx = meta.reserveTokens(account_one, amount);
//     await expectThrow(tx);
//     console.log(tx);
//
//     let reservedAfter = await meta1.reserve(account_one);
//     reservedAfter = reservedAfter.toNumber();
//     console.log(reservedBefore);
//
//     assert.equal(reservedBefore, reservedAfter, "reserve amount must be equal before and after try reserve tokens");
//     assert.equal(reservedBefore, 0, "reserve amount must be equal to 0");
//     assert.equal(reservedAfter, 0, "reserve amount must be equal to 0");
//     assert.equal(owned, false, "contract don't have to be allowed as a owner");
//     assert.equal(isVerifiedOne, true, "account_one must be equal to true");
//
//
//   });
// });
