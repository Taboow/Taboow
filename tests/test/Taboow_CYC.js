var Taboow = artifacts.require("Taboow_CYC");
var Taboow2 = artifacts.require("TaboowCYC2");
var expectThrow = require('./helper.js');


contract('Taboow Test CYC',  async (accounts) => {


    it("check constructor params", async () => {

      let instance = await Taboow.deployed();
      let meta = instance;

      //expected values
      let expectedName = "Taboow CYC";
      let expectedSymbol = "TBW";
      let expectedOwner = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;
      let expectedAmount = 1000000000000;
      let expectedStandard = "ERC20 Taboow CYC";
      let expectedDecimals = 18;
      let expectedTransactionFee = 0;

      let name=await meta.name();
      let symbol=await meta.symbol();
      let owner=await meta.owner();
      let totalSupply= await meta.totalSupply();
      let balance = await meta.balanceOf(owner);
      balance = balance.toNumber();
      let standard = await meta.standard();
      let decimals = await meta.decimals();
      decimals = decimals.toNumber();
      let transactionFee = await meta.transactionFee();
      transactionFee = transactionFee.toNumber();

      console.log("Contract owner: " + owner);
      console.log("Contract name: " + name);
      console.log("Token symbol: " + symbol);
      console.log("Total supply: " + totalSupply);
      console.log("Owner balance: " + balance);
      console.log("Standard: " + standard);
      console.log("Decimals: " + decimals);
      console.log("transactionFee: " +  transactionFee);

      assert.equal(name, expectedName, "Name must be equal than expectedName");
      assert.equal(symbol, expectedSymbol, "Symbol must be equal than expectedSymbol");
      assert.equal(owner, expectedOwner, "Owner must be equal than expectedOwner");
      assert.equal(totalSupply, expectedAmount, "Total Supply must be equal than expectedAmount");
      assert.equal(balance, expectedAmount, "Owner balance must be equal than expectedAmount");
      assert.equal(standard, expectedStandard, "Standard must be equal to expectedStandard");
      assert.equal(decimals, expectedDecimals, "Decimals must be equal to expectedDecimals");
      assert.equal(transactionFee, expectedTransactionFee, "transactionFee must be equal to expectedTransactionFee");

    });

    it("should transfer coin correctly and send fee to owner", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;

      let transactionFeeBefore = await meta.transactionFee();
      transactionFeeBefore = transactionFeeBefore.toNumber();

      let balance = await meta.balanceOf.call(account_one);
      let account_one_starting_balance = balance.toNumber();

      balance = await meta.balanceOf.call(account_two);
      let account_two_starting_balance = balance.toNumber();

      await meta.setTransactionFee(100);
      await meta.transfer(account_two, amount);

      let expectedFee = (amount * 100)/1000;

      let transactionFeeAfter = await meta.transactionFee();
      transactionFeeAfter = transactionFeeAfter.toNumber();

      balance = await meta.balanceOf(account_one);
      let account_one_ending_balance = balance.toNumber();

      balance = await meta.balanceOf(account_two);
      let account_two_ending_balance = balance.toNumber();

      console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
      console.log("Account Two Balances: " + account_two_starting_balance, account_two_ending_balance);

      console.log(transactionFeeBefore, transactionFeeAfter);
      console.log(expectedFee);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(account_one_starting_balance, account_one_ending_balance, "account_one starting balance and ending balance don't have to be equal");
      assert.notEqual(account_two_starting_balance, account_two_ending_balance, "account_two starting balance and ending balance don't have to be equal");
      assert.notEqual(transactionFeeBefore, transactionFeeAfter, "transactionFee don't have to be equal after setTransactionFee function");

      assert.equal(account_one_ending_balance, account_one_starting_balance - (amount - expectedFee), "Amount wasn't correctly taken from the sender");
      assert.equal(account_one_starting_balance, account_one_ending_balance + (amount - expectedFee), "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_ending_balance, account_two_starting_balance + (amount - expectedFee), "Amount wasn't correctly sent to the receiver");
      assert.equal(account_two_starting_balance, account_two_ending_balance - (amount - expectedFee), "Amount wasn't correctly sent to the receiver");

    });


    it("should approve amount correctly", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];

      let amount = 10000;


      let instance = await Taboow.deployed();
      let meta = instance;

      let allowanceBefore = await meta.allowance(account_one, account_one);
      allowanceBefore = allowanceBefore.toNumber();

      await meta.approve(account_one, amount);

      let allowanceAfter = await meta.allowance(account_one, account_one);
      allowanceAfter = allowanceAfter.toNumber();

      console.log("Allowance Before: " + allowanceBefore);
      console.log("Allowance After: " + allowanceAfter);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(allowanceBefore, allowanceAfter, "approved amount before and after allowance don't have to be equal");

      assert.equal(amount, allowanceAfter, "Allowance needs to be equal than amount");


    });


    it("should transferFrom amount correctly and send fee to the owner", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;

      let allowanceBefore = await meta.allowance(account_one, account_one);
      allowanceBefore = allowanceBefore.toNumber();

      let balance_start = await meta.balanceOf(account_one);
      balance_start = balance_start.toNumber();

      let balance_start_2 = await meta.balanceOf(account_two);
      balance_start_2 = balance_start_2.toNumber();

      let transactionFee = await meta.transactionFee();
      transactionFee = transactionFee.toNumber();

      let expectedFee = (amount * transactionFee)/1000;

      await meta.transferFrom(account_one, account_two, amount);

      let allowanceAfter = await meta.allowance(account_one, account_one);
      allowanceAfter = allowanceAfter.toNumber();

      let balance_end = await meta.balanceOf(account_one);
      balance_end = balance_end.toNumber();

      let balance_end_2 = await meta.balanceOf(account_two);
      balance_end_2 = balance_end_2.toNumber();

      console.log("Allowance before transfer: " + allowanceBefore);
      console.log("Allowance after transfer: " + allowanceAfter);
      console.log("Sender Balance Start: " + balance_start);
      console.log("Receiver Balance Start: " + balance_start_2);
      console.log("Sender Balance End: " + balance_end);
      console.log("Receiver Balance End: " + balance_end_2);
      console.log("transactionFee: " + transactionFee);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(balance_start, balance_end, "account_one starting balance and ending balance don't have to be equal");
      assert.notEqual(balance_start_2, balance_end_2, "account_two starting balance and ending balance don't have to be equal");
      assert.notEqual(allowanceBefore, allowanceAfter, "allowance before and after transfer don't have to be equal");

      assert.equal(balance_end, balance_start - (balance_end_2 - (amount - expectedFee)), "Amount wasn't correctly sent to the receiver");
      assert.equal(balance_end, balance_start - (amount - expectedFee), "Balance after transfer must to be equal than balance before transfer minus amount transferred");
      assert.equal(balance_start, balance_end + (amount - expectedFee), "Balance before transfer must to be equal than balance after transfer plus amount transferred");
      assert.equal(balance_end_2, balance_start_2 + (amount - expectedFee), "Balance after transfer must to be equal than balance before transfer minus amount transferred");
      assert.equal(balance_start_2, balance_end_2 - (amount - expectedFee), "Balance before transfer must to be equal than balance after transfer plus amount transferred");

    });


    it("should increase appproval amount correctly", async () => {
      let account_one = accounts[0];
      let account_two = accounts[1];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;

      await meta.approve(account_two, amount);

      let allowanceBefore = await meta.allowance(account_one, account_two);
      allowanceBefore = allowanceBefore.toNumber();

      await meta.increaseApproval(account_two, amount);

      let amount_two = amount + amount;

      let allowanceAfter = await meta.allowance(account_one, account_two);
      allowanceAfter = allowanceAfter.toNumber();

      console.log("Balance before increaseApproval: " + allowanceBefore);
      console.log("Balance after increaseApproval: " + allowanceAfter);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(allowanceBefore, allowanceAfter, "balance allowed before don't have to be equal than balance allowed after");

      assert.equal(allowanceBefore, amount, "Allowance must be equal than amount");
      assert.equal(allowanceAfter, amount_two, "Allowance must be equal than amount");
    });

    it("should decrease appproval amount correctly", async () => {
      let account_one = accounts[0];
      let account_two = accounts[1];

      let amount = 20000;

      let instance = await Taboow.deployed();
      let meta = instance;

      await meta.approve(account_two, amount);

      let allowanceBefore = await meta.allowance(account_one, account_two);
      allowanceBefore = allowanceBefore.toNumber();

      let amount_two = amount / 2;

      await meta.decreaseApproval(account_two, amount_two);

      let allowanceAfter = await meta.allowance(account_one, account_two);
      allowanceAfter = allowanceAfter.toNumber();

      console.log("Balance before decreaseApproval: " + allowanceBefore);
      console.log("Balance after decreaseApproval: " + allowanceAfter);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(allowanceBefore, allowanceAfter, "balance allowed before don't have to be equal than balance allowed after")

      assert.equal(allowanceBefore, amount, "Allowance must be equal than amount");
      assert.equal(allowanceAfter, amount_two, "Allowance must be equal than amount");

    });


    it("should approve and communicate the approved correctly", async () => {
      let account_one = accounts[0];

      let amount = 20000;

      let instance = await Taboow.deployed();
      let meta = instance;


      let instance_two = await Taboow2.deployed();

      let contractAddress = instance_two.address;

      let allowanceBefore = await meta.allowance(account_one, contractAddress);
      allowanceBefore = allowanceBefore.toNumber();

      let _data = "";

      await meta.approveAndCall(contractAddress, amount, _data);

      let allowanceAfter = await meta.allowance(account_one, contractAddress);
      allowanceAfter = allowanceAfter.toNumber();

      console.log("Balance allowed after approveAndCall: " + allowanceAfter);

      assert.notEqual(account_one, contractAddress, "account_one don't have to be equal than addressContract");
      assert.notEqual(allowanceBefore, allowanceAfter, "allowanceBefore approveAndCall don't have to be equal than allowanceAfter");

      assert.equal(allowanceAfter, amount, "Allowance must be equal than amount after approveAndCall function");
    });

    it("should freezeAccount correctly", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;

      let balance = await meta.balanceOf.call(account_one);
      let account_one_starting_balance = balance.toNumber();

      balance = await meta.balanceOf.call(account_two);
      let account_two_starting_balance = balance.toNumber();

      let frozenBefore = await meta.frozenAccount(account_two);

      await meta.freezeAccount(account_two, true);

      let tx = meta.transfer(account_one, amount, {from:account_two});;
      await expectThrow(tx);

      balance = await meta.balanceOf(account_one);
      let account_one_ending_balance = balance.toNumber();

      balance = await meta.balanceOf(account_two);
      let account_two_ending_balance = balance.toNumber();

      let frozenAfter = await meta.frozenAccount(account_two);

      console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
      console.log("Account Two Balances: " + account_two_starting_balance, account_two_ending_balance);

      console.log(tx);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(frozenBefore, frozenAfter, "frozenAccount value don't have to be equal after frozenAccount");

      assert.equal(account_one_starting_balance, account_one_ending_balance, "Amount wasn't correctly taken from the sender");
      assert.equal(account_two_starting_balance, account_two_ending_balance, "Amount wasn't correctly taken from the sender");

    });

    it("should unfreezeAccount correctly", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];
      let account_three = accounts[3];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;

      let transactionFee = await meta.transactionFee();
      transactionFee = transactionFee.toNumber();

      let balance = await meta.balanceOf.call(account_one);
      let account_one_starting_balance = balance.toNumber();

      balance = await meta.balanceOf.call(account_two);
      let account_two_starting_balance = balance.toNumber();

      balance = await meta.balanceOf.call(account_three);
      let account_three_starting_balance = balance.toNumber();

      let frozenBefore = await meta.frozenAccount(account_two);

      await meta.freezeAccount(account_two, false);
      await meta.transfer(account_three, amount, {from: account_two});

      let expectedFee = (amount * transactionFee)/1000;

      balance = await meta.balanceOf(account_one);
      let account_one_ending_balance = balance.toNumber();

      balance = await meta.balanceOf(account_two);
      let account_two_ending_balance = balance.toNumber();

      balance = await meta.balanceOf(account_three);
      let account_three_ending_balance = balance.toNumber();

      let frozenAfter = await meta.frozenAccount(account_two);

      console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);
      console.log("Account Two Balances: " + account_two_starting_balance, account_two_ending_balance);
      console.log("Account Three Balances: " + account_three_starting_balance, account_three_ending_balance);


      console.log(expectedFee);

      console.log(frozenBefore, frozenAfter);

      assert.notEqual(account_one, account_two, "account_one have to be different than account_two");
      assert.notEqual(account_one_starting_balance, account_one_ending_balance, "account_one starting balance and ending balance don't have to be equal");
      assert.notEqual(account_two_starting_balance, account_two_ending_balance, "account_two starting balance and ending balance don't have to be equal");
      assert.notEqual(account_three_starting_balance, account_three_ending_balance, "account_three starting balance and ending balance don't have to be equal");

      assert.equal(transactionFee, 100, "transactionFee must be equal to 100");
      assert.equal(account_one_ending_balance, account_one_starting_balance + expectedFee, "Fee wasn't correctly sent to the owner");
      assert.equal(account_one_starting_balance, account_one_ending_balance - expectedFee, "Fee wasn't correctly sent to the owner");
      assert.equal(account_two_ending_balance, account_two_starting_balance - amount, "Amount wasn't correctly sent to the receiver");
      assert.equal(account_two_starting_balance, account_two_ending_balance + amount, "Amount wasn't correctly sent to the receiver");
      assert.equal(account_three_ending_balance, amount - expectedFee, "Account three balance after transfer must be equal to amount - expectedFee");

    });

    it("should mint correctly", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];
      let account_three = accounts[3];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;


      let balance = await meta.balanceOf.call(account_one);
      let account_one_starting_balance = balance.toNumber();


      await meta.mint(account_one, amount);


      balance = await meta.balanceOf(account_one);
      let account_one_ending_balance = balance.toNumber();

      console.log("Account One Balances: " + account_one_starting_balance, account_one_ending_balance);

      assert.notEqual(account_one_starting_balance, account_one_ending_balance, "account_one starting balance and ending balance don't have to be equal");

      assert.equal(account_one_ending_balance, account_one_starting_balance + amount, "Amount wasn't correctly sent to the owner");


    });

    it("should sweep correctly", async () => {

      // Get initial balances of first and second account.
      let account_one = accounts[0];
      let account_two = accounts[1];
      let account_three = accounts[4];

      let amount = 10000;

      let instance = await Taboow.deployed();
      let meta = instance;

      let instance_two = await Taboow2.deployed();
      let meta2 = instance_two;

      await meta2.transfer(meta.address, 1000000, {from:account_three});

      let balanceBefore = await meta2.balanceOf(meta.address);
      balanceBefore = balanceBefore.toNumber();

      let ownerBalanceBefore = await meta2.balanceOf(account_one);
      ownerBalanceBefore = ownerBalanceBefore.toNumber();

      await meta.sweep(instance_two.address, amount);

      let balanceAfter = await meta2.balanceOf(meta.address);
      balanceAfter = balanceAfter.toNumber();
      console.log(balanceBefore, balanceAfter);

      let ownerBalanceAfter = await meta2.balanceOf(account_one);
      ownerBalanceAfter = ownerBalanceAfter.toNumber();
      console.log(ownerBalanceBefore, ownerBalanceAfter);

      console.log(meta.address, meta2.address);

      assert.notEqual(meta.address, meta2.address, "meta and meta2 addresses don't have to be equal");
      assert.notEqual(balanceBefore, balanceAfter, "balanceBefore and balanceAfter from meta2 don't have to be equal");
      assert.notEqual(ownerBalanceBefore, ownerBalanceAfter, "ownerBalance from meta2 don't have to be equal")

      assert.equal(balanceAfter, balanceBefore - amount, "balanceAfter must be equal to balanceBefore - amount");
      assert.equal(balanceBefore, balanceAfter + amount, "balanceBefore must be equal to balanceBefore + amount");
      assert.equal(ownerBalanceAfter, amount, "ownerBalanceAfter must be equal to amount");

    });

});
