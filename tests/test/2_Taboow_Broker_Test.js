var Taboow = artifacts.require("Taboow");
var Taboow1 = artifacts.require("Taboow_Broker");
var Taboow2 = artifacts.require("TaboowCYC2");
var expectThrow = require('./helper.js');

contract('Taboow Test',  async (accounts) => {

    it("check constructor and default params", async () => {
      let account_one = accounts[0];

      let instance = await Taboow1.deployed();
      let meta = instance;

      let expectedAddrFWD = 0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e;
      let expectedToken = 0x8cdaf0cd259887258bc13a92c0a6da92698644c0;

      let addrFWD = await meta.FWDaddrETH()
      let taboowAddr = await meta.taboowAddr();

      //expected values
      let expectedName = "Taboow Broker";
      let expectedTokenPrice = 10000000000000000;
      let expectedPubEnd = 0;
      let expectedDecimals = 18;
      let expectedOwner = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;

      let name = await meta.name();
      let owner = await meta.owner();
      let decimals = await meta.decimals();
      decimals = decimals.toNumber();
      let tokenPrice = await meta.tokenPrice();
      tokenPrice = tokenPrice.toNumber();
      let pubEnd = await meta.pubEnd();
      pubEnd = pubEnd.toNumber();


      console.log("Contract owner: " + owner);
      console.log("Contract name: " + name);
      console.log("Decimals: " + decimals);
      console.log("tokenPrice: " +  tokenPrice);
      console.log("pubEnd: " + pubEnd);

      assert.equal(name, expectedName, "Name must be equal than expectedName");
      assert.equal(owner, expectedOwner, "Owner must be equal than expectedOwner");
      assert.equal(decimals, expectedDecimals, "Decimals must be equal to expectedDecimals");
      assert.equal(pubEnd, expectedPubEnd, "pubEnd must be equal than expectedPubEnd");
      assert.equal(tokenPrice, expectedTokenPrice, "tokenPrice must be equal than expectedTokenPrice");
      assert.equal(addrFWD, expectedAddrFWD, "addrFWD must be equal than expectedAddrFWD");
      assert.equal(taboowAddr, expectedToken, "taboowAddr must be equal to expectedToken");
    });

    it("should initialize functions and variables to start running", async () => {
      let account_one = accounts[0];
      let account_two = accounts[2];

      let instance = await Taboow.deployed();
      let meta = instance;

      let tbwAddr = meta.address;

      let instance1 = await Taboow1.deployed();
      let meta1 = instance1;

      let tbwAddr1 = meta1.address;

      await meta.setTaboowAddr(tbwAddr1);
      await meta1.setTaboow(tbwAddr);

      await meta.verifyAccount(account_one, true);
      await meta.verifyAccount(account_two, true);

      let taboowAddr = await meta1.taboowAddr();
      console.log(taboowAddr);

      let isVerifiedOne = await meta1.isVerified(account_one);
      console.log(isVerifiedOne);

      let isVerifiedTwo = await meta1.isVerified(account_two);
      console.log(isVerifiedTwo);

      assert.equal(isVerifiedOne, true, "account_one verification must be equal to true");
      assert.equal(isVerifiedTwo, true, "account_two verification must be equal to true");
      assert.equal(taboowAddr, tbwAddr, "tbwAddr must be equal to taboowAddr");

    });

    it("should buy amount correctly", async () => {
      let account_one = accounts[0];
      let account_two = accounts[2];

      let instance = await Taboow1.deployed();
      let meta = instance;

      let instance1 = await Taboow.deployed();
      let meta1 = instance1;

      let amount = 10000000000000000000;
      // let expectedToken = "0xf12b5dd4ead5f743c6baa640b0216200e89b60da";

      await meta.setPrice(1000000000000000000);

      let tokenPrice = await meta.tokenPrice();
      tokenPrice = tokenPrice.toNumber();
      console.log(tokenPrice);

      let isVerified = await meta.isVerified(account_two);
      console.log(isVerified);

      await meta.setPubEnd(2828064138);

      let owner = await meta.owner();

      let soldBefore = await meta.sold(account_two);
      soldBefore = soldBefore.toNumber();
      console.log("soldBefore: " + soldBefore);

      await meta.buy({from: account_two, value:amount});

      let soldAfter = await meta.sold(account_two);
      soldAfter = soldAfter.toNumber();
      console.log("soldAfter: " + soldAfter);

      let tokenUnit = await meta.tokenUnit();
      tokenUnit = tokenUnit.toNumber();

      let tokenAmount = (amount*tokenUnit)/1000000000000000000;
      console.log(tokenAmount);

      assert.notEqual(soldBefore , soldAfter , "sold value don't have to be equal before and after buy");

      assert.equal(soldAfter, tokenAmount, "sold value after buy have to be equal to tokenAmount");

    });

    it("should buy amount correctly from fallback function", async () => {
      let account_one = accounts[0];
      let account_two = accounts[2];

      let instance = await Taboow1.deployed();
      let meta = instance;

      let amount = 1000000000000000000;

      await meta.setPubEnd(1628064138);

      let owner = await meta.owner();

      let soldBefore = await meta.sold(account_two);
      soldBefore = soldBefore.toNumber();
      console.log(soldBefore);

      await meta.sendTransaction({from: accounts[2], value: 10**18});

      let soldAfter = await meta.sold(account_two);
      soldAfter = soldAfter.toNumber();
      console.log(soldAfter);

      let tokenUnit = await meta.tokenUnit();
      tokenUnit = tokenUnit.toNumber();

      let tokenAmount = (amount*tokenUnit)/1000000000000000000;
      console.log(tokenAmount);

      assert.notEqual(soldBefore , soldAfter , "sold value don't have to be equal before and after buy");

      assert.equal(soldAfter - soldBefore, tokenAmount, "sold value after buy have to be equal to tokenAmount");

    });

    it("should reserve and deliver tokens", async () => {
      let account_one = accounts[2];

      let instance = await Taboow1.deployed();
      let meta = instance;

      let instance_two = await Taboow.deployed();
      let meta_two = instance_two;

      await meta_two.setOwners(meta.address, true);
      await meta_two.verifyAccount(meta.address, true);
      await meta_two.verifyAccount(account_one, true);

      let amount = 1000000000000000000;

      let account_one_reserved = await meta.isReserved(account_one);
      account_one_reserved = account_one_reserved.toNumber();
      console.log("account_one_reserved: ", account_one_reserved);

      await meta.reserveTokens(account_one, amount);

      let account_one_reserved_after = await meta.isReserved(account_one);
      account_one_reserved_after = account_one_reserved_after.toNumber();
      console.log("account_one_reserved_after: ", account_one_reserved_after);

      let balanceTaboowBefore = await meta_two.balanceOf(account_one);
      balanceTaboowBefore = balanceTaboowBefore.toNumber();
      console.log("balanceTaboowBefore: ", balanceTaboowBefore);

      await meta.tokensDelivery(amount, account_one);

      let account_one_reserved_last = await meta.isReserved(account_one);
      account_one_reserved_last = account_one_reserved_last.toNumber();
      console.log("account_one_reserved_last: ", account_one_reserved_last);

      let balanceTaboowAfter = await meta_two.balanceOf(account_one);
      balanceTaboowAfter = balanceTaboowAfter.toNumber();
      console.log("balanceTaboowAfter: ", balanceTaboowAfter);

      assert.notEqual(account_one_reserved, account_one_reserved_after, "reserved amount before and after reserve don't have to be equal");
      assert.notEqual(balanceTaboowBefore, balanceTaboowAfter, "account balance of Taboow Contract don't have to be equal before and after deliver tokens");

      assert.equal(account_one_reserved_after, amount, "amount reserved must be equal to amount given");
      assert.equal(balanceTaboowAfter, amount, "account balance of Taboow Contract must be equal to amount given");
      assert.equal(account_one_reserved_after, balanceTaboowAfter, "amount reserved must be equal to account balance");
      assert.equal(account_one_reserved, account_one_reserved_last, "account reserved amount before and amount after deliver must be equal");
      assert.equal(account_one_reserved, 0, "account_one_reserved must be equal to 0");
      assert.equal(account_one_reserved_last, 0, "account_one_reserved_last must be equal to 0");
      assert.equal(balanceTaboowBefore, 0, "balanceTaboowBefore must be equal to 0");
    });

    it("should withdrawPUB correctly", async () => {
      let account_one = accounts[2];

      let instance = await Taboow1.deployed();
      let meta = instance;

      let instance_two = await Taboow.deployed();
      let meta_two = instance_two;

      let balanceBefore = await meta_two.balanceOf(account_one);
      balanceBefore = balanceBefore.toNumber();
      console.log("balanceBefore: " + balanceBefore);

      await meta.setPubEnd(0);

      let pubEnd = await meta.pubEnd();
      pubEnd = pubEnd.toNumber();
      console.log("pubEnd: " + pubEnd);

      let soldBefore = await meta.sold(account_one);
      soldBefore = soldBefore.toNumber();
      console.log("soldBefore: " + soldBefore);

      let tokenPrice = await meta.tokenPrice();
      tokenPrice = tokenPrice.toNumber();
      console.log("tokenPrice: " + tokenPrice);

      await meta.withdrawPUB({from:account_one});

      let balanceAfter = await meta_two.balanceOf(account_one);
      balanceAfter = balanceAfter.toNumber();
      console.log("balanceAfter: " + balanceAfter);

      let soldAfter = await meta.sold(account_one);
      soldAfter = soldAfter.toNumber();
      console.log("soldAfter: " + soldAfter);

      assert.notEqual(soldBefore , soldAfter , "sold value don't have to be equal before and after buy");

      assert.equal(soldBefore + balanceBefore, balanceAfter, "sold before withdraw and balance after withdraw have to be equal");
      assert.equal(soldAfter, 0, "sold value must be equal to 0 after withdrawPUB");
    });


    it("should sweep correctly to send tokens to owner account", async() => {
         // Get initial balances of first and second account.
         let account_one = accounts[0];
         let account_two = accounts[1];

         let amount = 1000000000000000000000000;

         let instance = await Taboow.deployed();
         let meta = instance;

         let instance2 = await Taboow1.deployed();
         let meta2 = instance2;

         let instance3 = await Taboow2.deployed();
         let meta3 = instance3;

         let contract2Addr = meta.address;

         await meta.setTaboowAddr(contract2Addr);

         await meta.verifyAccount(account_one, true);

         let verifiedAccountOne = await meta.verified(account_one);
         console.log(verifiedAccountOne);

         let verifiedContract2Addr = await meta.verified(contract2Addr);
         console.log(verifiedContract2Addr);

         let balance = await meta.balanceOf(account_one);
         let account_one_starting_balance = balance.toNumber();

         balance = await meta.balanceOf(contract2Addr);
         let contract2_balance = balance.toNumber();
         console.log(contract2_balance);

         await meta.sweep(meta.address, amount);

         balance = await meta.balanceOf(account_one);
         let account_one_ending_balance = balance.toNumber();

         balance = await meta.balanceOf(contract2Addr);
         let contract2_balance_after = balance.toNumber();
         console.log(contract2_balance_after);

         console.log(account_one_starting_balance, account_one_ending_balance);

         assert.notEqual(account_one_starting_balance, account_one_ending_balance, "starting and ending balance of account one don't have to be equal after sweep");

         assert.equal(account_one_ending_balance, amount, "account_one_ending_balance must be equal to amount")
         assert.equal(contract2_balance, contract2_balance_after, "contract2_balance must be equal before and after sweep");
         assert.equal(verifiedAccountOne, true, "verifiedAccountOne must be equal to true");
         assert.equal(verifiedContract2Addr, true, "verifiedContract2Addr must be equal to true");

       });


});
