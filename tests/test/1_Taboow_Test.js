// var Taboow = artifacts.require("Taboow");
// var Taboow1 = artifacts.require("Taboow_CYC");
// var Taboow2 = artifacts.require("TaboowCYC2");
// var expectThrow = require('./helper.js');
//
// contract('Taboow Test',  async (accounts) => {
//
//     it("check constructor and default params", async () => {
//       let account_one = accounts[0];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       //expected values
//       let expectedName = "Taboow";
//       let expectedSymbol = "TBW";
//       let expectedOwner = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
//       let expectedStandard = "Taboow ERC20";
//       let expectedDecimals = 18;
//       let expectedTransactionFee = 0;
//       let expectedTotalSupply = 5500000000000000000000000;
//
//       let name = await meta.name();
//       let symbol = await meta.symbol();
//       let owner = await meta.owner();
//       let standard = await meta.standard();
//       let decimals = await meta.decimals();
//       decimals = decimals.toNumber();
//       let transactionFee = await meta.transactionFee();
//       transactionFee = transactionFee.toNumber();
//       let totalSupply = await meta.totalSupply();
//       totalSupply = totalSupply.toNumber();
//       let owners = await meta.owners(account_one);
//
//       console.log("Contract owner: " + owner);
//       console.log("Contract name: " + name);
//       console.log("Token symbol: " + symbol);
//       console.log("Total supply: " + totalSupply);
//       console.log("Standard: " + standard);
//       console.log("Decimals: " + decimals);
//       console.log("transactionFee: " +  transactionFee);
//       console.log("owners[account_one]: " + owners);
//
//       assert.equal(name, expectedName, "Name must be equal than expectedName");
//       assert.equal(symbol, expectedSymbol, "Symbol must be equal than expectedSymbol");
//       assert.equal(owner, expectedOwner, "Owner must be equal than expectedOwner");
//       assert.equal(totalSupply, expectedTotalSupply, "Total Supply must be equal than expectedAmount");
//       assert.equal(owners, true, "owners of owner must be equal to true")
//       assert.equal(standard, expectedStandard, "Standard must be equal to expectedStandard");
//       assert.equal(decimals, expectedDecimals, "Decimals must be equal to expectedDecimals");
//       assert.equal(transactionFee, expectedTransactionFee, "transactionFee must be equal to expectedTransactionFee");
//
//     });
//
//     it("should sweep correctly to send tokens to owner account", async() => {
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let amount = 1000000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let instance2 = await Taboow1.deployed();
//       let meta2 = instance2;
//
//       let contract2Addr = meta2.address;
//
//       await meta.setTaboowAddr(contract2Addr);
//
//       await meta.verifyAccount(account_one, true);
//
//       let verifiedAccountOne = await meta.verified(account_one);
//       console.log(verifiedAccountOne);
//
//       let verifiedContract2Addr = await meta.verified(contract2Addr);
//       console.log(verifiedContract2Addr);
//
//       let balance = await meta.balanceOf(account_one);
//       let account_one_starting_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(contract2Addr);
//       let contract2_balance = balance.toNumber();
//       console.log(contract2_balance);
//
//       await meta2.sweep(meta.address, amount);
//
//       balance = await meta.balanceOf(account_one);
//       let account_one_ending_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(contract2Addr);
//       let contract2_balance_after = balance.toNumber();
//       console.log(contract2_balance_after);
//
//       console.log(account_one_starting_balance, account_one_ending_balance);
//
//       assert.notEqual(account_one_starting_balance, account_one_ending_balance, "starting and ending balance of account one don't have to be equal after sweep");
//
//       assert.equal(account_one_ending_balance, amount, "account_one_ending_balance must be equal to amount")
//       assert.equal(contract2_balance, contract2_balance_after, "contract2_balance must be equal before and after sweep");
//       assert.equal(verifiedAccountOne, true, "verifiedAccountOne must be equal to true");
//       assert.equal(verifiedContract2Addr, true, "verifiedContract2Addr must be equal to true");
//
//     });
//
//     it("should transfer coin correctly and send fee to owner", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let amount = 100000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       // await meta.verifyAccount(meta.address, true);
//       await meta.verifyAccount(account_two, true);
//
//       let verifiedAccountOne = await meta.verified(account_one);
//       console.log(verifiedAccountOne);
//
//       let verifiedAccountTwo = await meta.verified(account_two);
//       console.log(verifiedAccountTwo);
//
//
//       let transactionFeeBefore = await meta.transactionFee();
//       transactionFeeBefore = transactionFeeBefore.toNumber();
//
//       let balance = await meta.balanceOf(account_one);
//       let account_one_starting_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(account_two);
//       let account_two_starting_balance = balance.toNumber();
//
//       await meta.setTransactionFee(100);
//
//       await meta.transfer(account_two, amount);
//
//       let expectedFee = (amount * 100)/1000;
//
//       let transactionFeeAfter = await meta.transactionFee();
//       transactionFeeAfter = transactionFeeAfter.toNumber();
//
//       balance = await meta.balanceOf(account_one);
//       let account_one_ending_balance = balance.toNumber();
//       console.log(account_one_ending_balance);
//       balance = await meta.balanceOf(account_two);
//       let account_two_ending_balance = balance.toNumber();
//
//       console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
//       console.log("Account Two Balances: " + account_two_starting_balance, account_two_ending_balance);
//
//       console.log(transactionFeeBefore, transactionFeeAfter);
//       console.log(expectedFee);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(account_one_starting_balance, account_one_ending_balance, "account_one starting balance and ending balance don't have to be equal");
//       assert.notEqual(account_two_starting_balance, account_two_ending_balance, "account_two starting balance and ending balance don't have to be equal");
//       assert.notEqual(transactionFeeBefore, transactionFeeAfter, "transactionFee don't have to be equal after setTransactionFee function");
//
//       assert.equal(account_one_ending_balance, account_one_starting_balance - (amount - expectedFee), "Amount wasn't correctly taken from the sender");
//       assert.equal(account_one_starting_balance, account_one_ending_balance + (amount - expectedFee), "Amount wasn't correctly taken from the sender");
//       assert.equal(account_two_ending_balance, account_two_starting_balance + (amount - expectedFee), "Amount wasn't correctly sent to the receiver");
//       assert.equal(account_two_starting_balance, account_two_ending_balance - (amount - expectedFee), "Amount wasn't correctly sent to the receiver");
//       assert.equal(verifiedAccountOne, true, "account_one verified must be equal to true");
//       assert.equal(verifiedAccountTwo, true, "account_two verified must be equal to true");
//     });
//
//
//     it("should approve amount correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let amount = 100000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let allowanceBefore = await meta.allowance(account_one, account_two);
//       allowanceBefore = allowanceBefore.toNumber();
//
//       await meta.approve(account_two, amount);
//
//       let allowanceAfter = await meta.allowance(account_one, account_two);
//       allowanceAfter = allowanceAfter.toNumber();
//
//       console.log("Allowance Before: " + allowanceBefore);
//       console.log("Allowance After: " + allowanceAfter);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(allowanceBefore, allowanceAfter, "approved amount before and after allowance don't have to be equal");
//
//       assert.equal(amount, allowanceAfter, "Allowance needs to be equal than amount");
//
//
//     });
//
//
//     it("should transferFrom amount correctly and send fee to the owner", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//       let account_three = accounts[2];
//
//       let amount = 100000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       await meta.verifyAccount(account_three, true);
//
//       let verifiedAccountThree = await meta.verified(account_three);
//       console.log(verifiedAccountThree);
//
//       let allowanceBefore = await meta.allowance(account_one, account_two);
//       allowanceBefore = allowanceBefore.toNumber();
//
//       let balance_start = await meta.balanceOf(account_one);
//       balance_start = balance_start.toNumber();
//
//       let balance_start_2 = await meta.balanceOf(account_three);
//       balance_start_2 = balance_start_2.toNumber();
//
//       let transactionFee = await meta.transactionFee();
//       transactionFee = transactionFee.toNumber();
//
//       let expectedFee = (amount * transactionFee)/1000;
//
//       await meta.transferFrom(account_one, account_three, amount, {from: account_two});
//
//       let allowanceAfter = await meta.allowance(account_one, account_two);
//       allowanceAfter = allowanceAfter.toNumber();
//
//       let balance_end = await meta.balanceOf(account_one);
//       balance_end = balance_end.toNumber();
//
//       let balance_end_2 = await meta.balanceOf(account_three);
//       balance_end_2 = balance_end_2.toNumber();
//
//       console.log("Allowance before transfer: " + allowanceBefore);
//       console.log("Allowance after transfer: " + allowanceAfter);
//       console.log("Sender Balance Start: " + balance_start);
//       console.log("Receiver Balance Start: " + balance_start_2);
//       console.log("Sender Balance End: " + balance_end);
//       console.log("Receiver Balance End: " + balance_end_2);
//       console.log("transactionFee: " + transactionFee);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(balance_start, balance_end, "account_one starting balance and ending balance don't have to be equal");
//       assert.notEqual(balance_start_2, balance_end_2, "account_two starting balance and ending balance don't have to be equal");
//       assert.notEqual(allowanceBefore, allowanceAfter, "allowance before and after transfer don't have to be equal");
//
//       assert.equal(balance_end, balance_start + expectedFee - amount, "Balance after transfer must to be equal than balance before transfer - amount transferred X");
//       assert.equal(balance_start, balance_end + (amount - expectedFee), "Balance before transfer must to be equal than balance after transfer + amount transferred");
//       assert.equal(balance_end_2, balance_start_2 + (amount - expectedFee), "Balance after transfer must to be equal than balance before transfer - amount transferred");
//       assert.equal(balance_start_2, balance_end_2 - (amount - expectedFee), "Balance before transfer must to be equal than balance after transfer + amount transferred");
//       assert.equal(verifiedAccountThree, true, "account_three verified must be equal to true");
//     });
//
//
//     it("should increase appproval amount correctly", async () => {
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let amount = 10000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       // await meta.approve(account_two, amount);
//
//       let allowanceBefore = await meta.allowance(account_one, account_two);
//       allowanceBefore = allowanceBefore.toNumber();
//
//       await meta.increaseApproval(account_two, amount);
//
//       let amount_two = amount + amount;
//
//       let allowanceAfter = await meta.allowance(account_one, account_two);
//       allowanceAfter = allowanceAfter.toNumber();
//
//       console.log("Balance before increaseApproval: " + allowanceBefore);
//       console.log("Balance after increaseApproval: " + allowanceAfter);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(allowanceBefore, allowanceAfter, "balance allowed before don't have to be equal than balance allowed after");
//
//       assert.equal(allowanceBefore, 0, "Allowance must be equal than amount");
//       assert.equal(allowanceAfter, amount, "Allowance must be equal than amount");
//     });
//
//     it("should decrease appproval amount correctly", async () => {
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let amount = 1000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let allowanceBefore = await meta.allowance(account_one, account_two);
//       allowanceBefore = allowanceBefore.toNumber();
//
//       await meta.decreaseApproval(account_two, amount);
//
//       let allowanceAfter = await meta.allowance(account_one, account_two);
//       allowanceAfter = allowanceAfter.toNumber();
//
//       console.log("Balance before decreaseApproval: " + allowanceBefore);
//       console.log("Balance after decreaseApproval: " + allowanceAfter);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(allowanceBefore, allowanceAfter, "balance allowed before don't have to be equal than balance allowed after")
//
//       assert.equal(allowanceBefore, 10000000000000000000000, "Allowance must be equal than amount");
//       assert.equal(allowanceAfter, 10000000000000000000000 - amount, "Allowance must be equal than amount");
//
//     });
//
//
//     it("should approve and communicate the approved correctly", async () => {
//       let account_one = accounts[0];
//
//       let amount = 20000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//
//       let instance_two = await Taboow2.deployed();
//
//       let contractAddress = instance_two.address;
//
//       await meta.verifyAccount(contractAddress, true);
//
//       let verifiedContractAddress = await meta.verified(contractAddress);
//       console.log(verifiedContractAddress);
//
//       let allowanceBefore = await meta.allowance(account_one, contractAddress);
//       allowanceBefore = allowanceBefore.toNumber();
//
//       let _data = "";
//
//       await meta.approveAndCall(contractAddress, amount, _data);
//
//       let allowanceAfter = await meta.allowance(account_one, contractAddress);
//       allowanceAfter = allowanceAfter.toNumber();
//
//       console.log("Balance allowed after approveAndCall: " + allowanceAfter);
//
//       assert.notEqual(account_one, contractAddress, "account_one don't have to be equal than addressContract");
//       assert.notEqual(allowanceBefore, allowanceAfter, "allowanceBefore approveAndCall don't have to be equal than allowanceAfter");
//
//       assert.equal(allowanceAfter, amount, "Allowance must be equal than amount after approveAndCall function");
//       assert.equal(verifiedContractAddress, true, "contractAddress verified must be equal to true");
//     });
//
//     it("should freezeAccount correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let amount = 10000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let balance = await meta.balanceOf.call(account_one);
//       let account_one_starting_balance = balance.toNumber();
//
//       balance = await meta.balanceOf.call(account_two);
//       let account_two_starting_balance = balance.toNumber();
//
//       let frozenBefore = await meta.frozenAccount(account_two);
//
//       await meta.freezeAccount(account_two, true);
//
//       let tx = meta.transfer(account_one, amount, {from:account_two});;
//       await expectThrow(tx);
//
//       balance = await meta.balanceOf(account_one);
//       let account_one_ending_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(account_two);
//       let account_two_ending_balance = balance.toNumber();
//
//       let frozenAfter = await meta.frozenAccount(account_two);
//
//       console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
//       console.log("Account Two Balances: " + account_two_starting_balance, account_two_ending_balance);
//
//       console.log(tx);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(frozenBefore, frozenAfter, "frozenAccount value don't have to be equal after frozenAccount");
//
//       assert.equal(account_one_starting_balance, account_one_ending_balance, "Amount wasn't correctly taken from the sender");
//       assert.equal(account_two_starting_balance, account_two_ending_balance, "Amount wasn't correctly taken from the sender");
//       assert.equal(frozenBefore, false, "frozen bool before frozenAccount must be equal to false");
//       assert.equal(frozenAfter, true, "frozen bool after frozenAccount must be equal to true");
//
//     });
//
//     it("should unfreezeAccount correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//       let account_three = accounts[3];
//
//       let amount = 10000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       await meta.verifyAccount(account_three, true);
//
//       let verifiedAccountThree = await meta.verified(account_three);
//       console.log(verifiedAccountThree);
//
//       let transactionFee = await meta.transactionFee();
//       transactionFee = transactionFee.toNumber();
//
//       let balance = await meta.balanceOf(account_one);
//       let account_one_starting_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(account_two);
//       let account_two_starting_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(account_three);
//       let account_three_starting_balance = balance.toNumber();
//
//       let frozenBefore = await meta.frozenAccount(account_two);
//
//       await meta.freezeAccount(account_two, false);
//       await meta.transfer(account_three, amount, {from: account_two});
//
//       let expectedFee = (amount * transactionFee)/1000;
//
//       balance = await meta.balanceOf(account_one);
//       let account_one_ending_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(account_two);
//       let account_two_ending_balance = balance.toNumber();
//
//       balance = await meta.balanceOf(account_three);
//       let account_three_ending_balance = balance.toNumber();
//
//       let frozenAfter = await meta.frozenAccount(account_two);
//
//       console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
//       console.log("Account Two Balances: " + account_two_starting_balance, account_two_ending_balance);
//       console.log("Account Three Balances: " + account_three_starting_balance, account_three_ending_balance);
//
//       console.log(expectedFee);
//
//       console.log(frozenBefore, frozenAfter);
//
//       assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
//       assert.notEqual(account_one_starting_balance, account_one_ending_balance, "account_one starting balance and ending balance don't have to be equal");
//       assert.notEqual(account_two_starting_balance, account_two_ending_balance, "account_two starting balance and ending balance don't have to be equal");
//       assert.notEqual(account_three_starting_balance, account_three_ending_balance, "account_three starting balance and ending balance don't have to be equal");
//       assert.notEqual(frozenBefore, frozenAfter, "frozen boolean before and afer unfreeze account don't have to be equal");
//
//       assert.equal(transactionFee, 100, "transactionFee must be equal to 100");
//       assert.equal(account_one_ending_balance, account_one_starting_balance + expectedFee, "Fee wasn't correctly sent to the owner");
//       assert.equal(account_one_starting_balance, account_one_ending_balance - expectedFee, "Fee wasn't correctly sent to the owner");
//       assert.equal(account_two_ending_balance, account_two_starting_balance - amount, "Amount wasn't correctly sent to the receiver");
//       assert.equal(account_two_starting_balance, account_two_ending_balance + amount, "Amount wasn't correctly sent to the receiver");
//       assert.equal(account_three_ending_balance, amount - expectedFee, "Account three balance after transfer must be equal to amount - expectedFee");
//       assert.equal(verifiedAccountThree, true, "account_three verified must be equal to true");
//       assert.equal(frozenBefore, true, "frozen bool before frozenAccount must be equal to true");
//       assert.equal(frozenAfter, false, "frozen bool after frozenAccount must be equal to false");
//
//     });
//
//     it("should mint correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//       let account_three = accounts[3];
//
//       let amount = 10000000000000000000000000;
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let balance = await meta.balanceOf(account_one);
//       let account_one_starting_balance = balance.toNumber();
//
//       let totalSupplyBefore = await meta.totalSupply();
//       totalSupplyBefore = totalSupplyBefore.toNumber();
//
//       await meta.mint(account_one, amount);
//
//       let totalSupplyAfter = await meta.totalSupply();
//       totalSupplyAfter = totalSupplyAfter.toNumber();
//
//       console.log(totalSupplyBefore, totalSupplyAfter);
//
//       balance = await meta.balanceOf(account_one);
//       let account_one_ending_balance = balance.toNumber();
//
//       console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
//
//       assert.notEqual(account_one_starting_balance, account_one_ending_balance, "account_one starting balance and ending balance don't have to be equal");
//       assert.notEqual(totalSupplyBefore, totalSupplyAfter, "totalSupply before and after mint don't have to be equal");
//
//       assert.equal(account_one_ending_balance, account_one_starting_balance + amount, "Amount wasn't correctly sent to the owner");
//       assert.equal(totalSupplyAfter, totalSupplyBefore + amount, "totalSupply after mint must be equal to totalSupply before + amount");
//
//     });
//
//     it("should revoke verified account", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let verifiedAccountTwoBefore = await meta.verified(account_two);
//       console.log(verifiedAccountTwoBefore);
//
//       await meta.verifyAccount(account_two, false);
//
//       let verifiedAccountTwoAfter = await meta.verified(account_two);
//       console.log(verifiedAccountTwoAfter);
//
//       let balanceAccountTwo = await meta.balanceOf(account_two);
//       balanceAccountTwo = balanceAccountTwo.toNumber();
//       console.log(balanceAccountTwo);
//
//       let tx2 = meta.transfer(account_one, 1000, {from:account_two});;
//       await expectThrow(tx2);
//
//       console.log(tx2);
//
//       let balanceAccountTwoAfter = await meta.balanceOf(account_two);
//       balanceAccountTwoAfter = balanceAccountTwoAfter.toNumber();
//       console.log(balanceAccountTwoAfter);
//
//       assert.equal(verifiedAccountTwoBefore, true, "account_two verified must be equal to true before change it with verifyAccount function");
//       assert.equal(verifiedAccountTwoAfter, false, "account_two verified must be equal to false after change it with verifyAccount function");
//       assert.equal(balanceAccountTwo, balanceAccountTwoAfter, "balanceAccountTwo must be equal to balanceAccountTwoAfter");
//
//     });
//
//     it("should transferTokens correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let amount = 10000000000000000000000;
//       await meta.verifyAccount(account_two, true);
//
//       let balanceAccountOne = await meta.balanceOf(account_one);
//       balanceAccountOne = balanceAccountOne.toNumber();
//       console.log(balanceAccountOne);
//
//       let balanceAccountTwo = await meta.balanceOf(account_two);
//       balanceAccountTwo = balanceAccountTwo.toNumber();
//       console.log(balanceAccountTwo);
//
//       await meta.setOwners(account_two, true);
//
//       let account_two_is_owner = await meta.owners(account_two);
//       console.log(account_two_is_owner);
//
//       await meta.transfer(account_one, amount, {from:account_two});;
//
//       let balanceAccountTwoAfter = await meta.balanceOf(account_two);
//       balanceAccountTwoAfter = balanceAccountTwoAfter.toNumber();
//       console.log(balanceAccountTwoAfter);
//
//       let balanceAccountOneAfter = await meta.balanceOf(account_one);
//       balanceAccountOneAfter = balanceAccountOneAfter.toNumber();
//       console.log(balanceAccountOneAfter);
//
//       assert.notEqual(balanceAccountOne, balanceAccountOneAfter, "account_one balance don't have to be equal after transfer");
//       assert.notEqual(balanceAccountTwo, balanceAccountTwoAfter, "account_two balance don't have to be equal after transfer");
//
//       assert.equal(account_two_is_owner, true, "account_two owner bool value must be equal to true");
//       assert.equal(balanceAccountTwoAfter, balanceAccountTwo - amount, "account_two balance must be equal to balance before - amount");
//       assert.equal(balanceAccountOneAfter, balanceAccountOne + amount, "account_two balance must be equal to balance before - amount");
//     });
//
//     it("should reserveTokens and deliver it correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_seven = accounts[6];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let amount = 10000000000000000000000;
//       await meta.verifyAccount(account_seven, true);
//
//       let reservedBefore = await meta.reserve(account_seven);
//       reservedBefore = reservedBefore.toNumber();
//
//       await meta.reserveTokens(account_seven, amount);
//
//       let reservedAfter = await meta.reserve(account_seven);
//       reservedAfter = reservedAfter.toNumber();
//
//       let balanceAccountSeven = await meta.balanceOf(account_seven);
//       balanceAccountSeven = balanceAccountSeven.toNumber();
//
//       await meta.tokensDelivery(amount, account_seven);
//
//       let balanceAccountSevenAfter = await meta.balanceOf(account_seven);
//       balanceAccountSevenAfter = balanceAccountSevenAfter.toNumber();
//       console.log(balanceAccountSeven, balanceAccountSevenAfter);
//
//       let reservedLast = await meta.reserve(account_seven);
//       reservedLast = reservedLast.toNumber();
//       console.log(reservedBefore, reservedAfter, reservedLast);
//
//       assert.notEqual(balanceAccountSeven, balanceAccountSevenAfter, "account_one balance don't have to be equal after transfer");
//       assert.notEqual(reservedBefore, reservedAfter, "account_two balance don't have to be equal after transfer");
//       assert.notEqual(reservedAfter, reservedLast, "account_two balance don't have to be equal after transfer");
//
//       assert.equal(balanceAccountSevenAfter, amount, "account_seven balance after must be equal to amount");
//       assert.equal(reservedAfter, amount, "reserved amount after must be equal to amount");
//       assert.equal(balanceAccountSevenAfter, reservedAfter, "account_seven balance after must be equal to reservedAfter");
//       assert.equal(reservedBefore, reservedLast, "reservedBefore and reservedLast must be equal");
//     });
//
//     it("should registerTacos correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let amount = 10000000000000000000000;
//       let address = 0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5;
//
//       let registeredTacosBefore = await meta.registeredTacos(address);
//       let tacosAddrBefore = registeredTacosBefore[0];
//       let tacosAmountBefore =  registeredTacosBefore[1].toNumber();
//
//       await meta.registerTacos(address, account_two, amount);
//
//       let registeredTacosAfter = await meta.registeredTacos(address);
//       let tacosAddrAfter = registeredTacosAfter[0];
//       let tacosAmountAfter =  registeredTacosAfter[1].toNumber();
//
//       console.log(address);
//       console.log(tacosAddrAfter);
//       console.log(tacosAmountAfter);
//
//       assert.notEqual(tacosAddrBefore, tacosAddrAfter, "tacosAddr don't have to be equal before and after registerTacos");
//       assert.notEqual(tacosAmountBefore, tacosAmountAfter, "tacosAmount don't have to be equal before and after registerTacos");
//
//       assert.equal(tacosAmountAfter, amount, "tacosAmountAfter must be equal to amount registered");
//       assert.equal(account_two, tacosAddrAfter, "tacosAddrAfter must be equal to account_two");
//       assert.equal(tacosAddrBefore, 0, "tacosAddrBefore must be equal to 0");
//       assert.equal(tacosAmountBefore, 0, "tacosAmountBefore must be equal to 0");
//     });
//
//     it("should changeTaboowAddr correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let address = 0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5;
//
//       let prevAddr = await meta.tbwCYCaddr();
//
//       let balancePrevAddrBefore = await meta.balanceOf(prevAddr);
//       balancePrevAddrBefore = balancePrevAddrBefore.toNumber();
//
//       let balancePostAddrBefore = await meta.balanceOf(address);
//       balancePostAddrBefore = balancePostAddrBefore.toNumber();
//
//       let totalSupply = await meta.totalSupply();
//       totalSupply = totalSupply.toNumber();
//
//       await meta.changeTaboowAddr(address);
//
//       let postAddr = await meta.tbwCYCaddr();
//
//       let balancePrevAddrAfter = await meta.balanceOf(prevAddr);
//       balancePrevAddrAfter = balancePrevAddrAfter.toNumber();
//
//       let balancePostAddrAfter = await meta.balanceOf(address);
//       balancePostAddrAfter = balancePostAddrAfter.toNumber();
//
//       console.log(balancePrevAddrBefore, balancePrevAddrAfter);
//       console.log(balancePostAddrBefore, balancePostAddrAfter);
//
//       assert.notEqual(prevAddr, postAddr, "prevAddr don't have to be equal to postAddr");
//       assert.notEqual(balancePrevAddrBefore, balancePrevAddrAfter, "prevAddr balance don't have to be equal before and after changeTaboowAddr");
//       assert.notEqual(balancePostAddrBefore, balancePostAddrAfter, "postAddr balance don't have to be equal before and after changeTaboowAddr");
//
//       assert.equal(postAddr, address, "postAddr must be equal to address");
//       assert.equal(balancePrevAddrBefore, balancePostAddrAfter, "prevAddr balance before and postAddr balance after must be equal");
//       assert.equal(balancePrevAddrAfter, balancePostAddrBefore, "prevAddr balance after and postAddr balance before must be equal");
//       assert.equal(balancePrevAddrAfter, 0, "balancePrevAddrAfter must be equal to 0");
//       assert.equal(balancePostAddrBefore, 0, "balancePostAddrBefore must be equal to 0");
//     });
//     it("should changeTaboowAddr correctly", async () => {
//
//       // Get initial balances of first and second account.
//       let account_one = accounts[0];
//       let account_two = accounts[1];
//
//       let instance = await Taboow.deployed();
//       let meta = instance;
//
//       let address = await meta.tbwCYCaddr();
//
//       let balanceBefore = await meta.balanceOf(address);
//       balanceBefore = balanceBefore.toNumber();
//
//       await meta.deleteTaboowAddr();
//
//       let addressAfter = await meta.tbwCYCaddr();
//
//       let balanceAfter = await meta.balanceOf(address);
//       balanceAfter = balanceAfter.toNumber();
//
//       console.log(balanceBefore, balanceAfter);
//       console.log(address, addressAfter);
//
//       assert.notEqual(address, addressAfter, "address don't have to be equal to addressAfter");
//       assert.notEqual(balanceBefore, balanceAfter, "balance before don't have to be equal to balance after");
//
//       assert.equal(addressAfter, 0, "address after deleteTaboowAddr must be equal to 0");
//       assert.equal(balanceAfter, 0, "balanceAfter must be equal to 0");
//     });
//
// });
