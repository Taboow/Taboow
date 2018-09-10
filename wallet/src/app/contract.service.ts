import { Injectable } from '@angular/core';

import { Web3 } from "./web3.service";
import { WalletService } from "./wallet.service";

let fs = require('fs');

@Injectable()
export class ContractService {
    public Taboow_Abi;
	  public TaboowBroker_Abi;
  
	  public Taboow_Addr = "0x8F361970fcA245710Ce91b993c24617671Aaefd0";
	  public TaboowBroker_Addr = "0xA902494Cd646398DAe95Adc003a503Bf5979e17e";
  
	  public Taboow_Contract;
    public TaboowBroker_Contract;
    
  constructor(private _web3: Web3, private _wallet: WalletService){
    this.setContract();
    
  }
  ngOnInit(){

  }

  setContract(){
    this.getAbi();
    if(this._web3.infuraKey != ''){
      this.Taboow_Contract = this._web3.web3.eth.contract(this.Taboow_Abi).at(this.Taboow_Addr);
      this.TaboowBroker_Contract = this._web3.web3.eth.contract(this.TaboowBroker_Abi).at(this.TaboowBroker_Addr);
    }
  }
  getAbi(){

    this.Taboow_Abi = require('../assets/contracts/Taboow.json');
    this.TaboowBroker_Abi = require('../assets/contracts/Taboow_Broker.json');
  }
  //FUNCIONES Taboow.sol
    
    //OWNABLE
      // getOwner (address public owner)
      getTaboowOwner(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.owner.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //function transferOwnership()
      transferOwnership_Taboow(value):string{
        let txData = this.Taboow_Contract.transferOwnership.getData(value);
        return txData
      }
    //Taboow_ERC20
      //getBalances (mapping addr=>uint256) public balances
      getBalances(addr): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.balances.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //getName
      getNameTaboow(): Promise<string>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.name.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //getSymbol
      getSymbol(): Promise<string>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.symbol.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //getStandard
      getStandard(): Promise<string>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.standard.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //getTotalSupply
      getTotalSupply(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.totalSupply.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //getDecimals
      getDecimalsTaboow(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.decimals.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //getFrozenAccount (mapping addr bool) public frozenAccount
      getFrozenAccount(addr): Promise<boolean>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.frozenAccount.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //getVerified (mapping addr bool) public verified
      getVerified(addr): Promise<boolean>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.verified.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //getReserve (addr uint256) public reserve
      getReserve(addr): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.reserve.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //getBrokers (addr bool) public brokers
      getBrokers(addr): Promise<boolean>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.brokers.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //getTxFee () public
      getTransactionFee(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.transactionFee.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
       //allowance
       getAllowance(owner, spender): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.Taboow_Contract.allowance.call(owner, spender, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //setBrokers() onlyowner
      setBrokers(addr, bool):string{
        let txData = this.Taboow_Contract.setBrokers.getData(addr, bool);
        return txData
      }
      //setTransactionFee() onlyowner
      setTransactionFee(value):string{
        let txData = this.Taboow_Contract.setTransactionFee.getData(value);
        return txData
      }
      //freezeAccount() onlyowner
      setFreezeAccount(value):string{
        let txData = this.Taboow_Contract.freezeAccount.getData(value);
        return txData
      }
      //verifyAccount() onlyOwner
      setVerifyAccount(value):string{
        let txData = this.Taboow_Contract.verifyAccount.getData(value);
        return txData
      }
      //reserveTokens() public
      setReserveTokens_Taboow(addr ,value):string{
        let txData = this.Taboow_Contract.reserveTokens.getData(addr, value);
        return txData
      }
      //withdrawTokens() public (sender tiene que ser broker addr tiene que estar verified)
      setWithdrawTokens(addr ,value):string{
        let txData = this.Taboow_Contract.withdrawTokens.getData(addr, value);
        return txData
      }
      //transferTokens
      setTransferTokens(addr ,value):string{
        let txData = this.Taboow_Contract.transferTokens.getData(addr, value);
        return txData
      }
      //transfer
      setTransfer(to, value):string{
        let txData = this.Taboow_Contract.transfer.getData(to, value);
        return txData
      }
      //transferFrom
      setTransferFrom(from, to, value):string{
        let txData = this.Taboow_Contract.transferFrom.getData(from, to, value);
        return txData
      }
      //approve
      setApprove(to, value):string{
        let txData = this.Taboow_Contract.approve.getData(to, value);
        return txData
      }
      //increaseApproval
      setIncreaseApproval(to, value):string{
        let txData = this.Taboow_Contract.increaseApproval.getData(to, value);
        return txData
      }
      //decreaseApproval
      setDecreaseApproval(to, value):string{
        let txData = this.Taboow_Contract.decreaseApproval.getData(to, value);
        return txData
      }
      //approveAndCall
      setApproveAndCall(to, value, data):string{
        let txData = this.Taboow_Contract.approveAndCall.getData(to, value, data);
        return txData
      }
    //Taboow
      //mint onlyowner
      setMint(addr, value):string{
        let txData = this.Taboow_Contract.mint.getData(addr, value);
        return txData
      }
      //sweep onlyOwner
      setSweepTaboow(addr, value):string{
        let txData = this.Taboow_Contract.mint.getData(addr, value);
        return txData
      }

  //FUNCIONES Taboow_Broker.sol
    //OWNABLE
      //owner
      getTaboowBrokerOwner(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.owner.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //transferOwnership
      transferOwnership_TaboowBroker(value):string{
        let txData = this.TaboowBroker_Contract.transferOwnership.getData(value);
        return txData
      }
    //Taboow_Broker
      //name
      getNameTaboowBroker(): Promise<string>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.name.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //tokenPrice
      getTokenPrice(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.tokenPrice.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      getTokenUnit(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.tokenUnit.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //fwdAddr //mostrar solo al owner
      getFWDaddrETH(): Promise<string>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.FWDaddrETH.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //taboowAddr //mostrar solo al owner
      getTaboowAddr(): Promise<string>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.taboowAddr.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //decimals //
      getDecimalsTaboowBroker(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.decimals.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //sold (addr uint) public
      getSold(addr): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.sold.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //pubEnd
      getPubEnd(): Promise<number>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.pubEnd.call(function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res.toNumber());
            }
          });
        });
      }
      //isVerified public
      getIsVerified(addr): Promise<boolean>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.isVerified.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }
      //isReserved public
      getIsReserved(addr): Promise<boolean>{
        let self=this
        return new Promise (function (resolve, reject) {
          self.TaboowBroker_Contract.isReserved.call(addr, function(err, res){  
            if (err) {
              reject(err);
            } else {
              resolve(res);
            }
          });
        });
      }

      //setTaboow onlyowner
      setTaboowAddr(addr):string{
        let txData = this.TaboowBroker_Contract.setTaboow.getData(addr);
        return txData
      }
      //setPrice onlyowner
      setPrice(value):string{
        let txData = this.TaboowBroker_Contract.setPrice.getData(value);
        return txData
      }
      //setPubEnd onlyowner
      setPubEnd(value):string{
        let txData = this.TaboowBroker_Contract.setPubEnd.getData(value);
        return txData
      }
      //buy public
      buy():string{
        let txData = this.TaboowBroker_Contract.buy.getData();
        return txData
      }
      //withdrawPub public
      withdrawPUB():string{
        let txData = this.TaboowBroker_Contract.withdrawPUB.getData();
        return txData
      }
      //EMGwithdraw onlyowner
      EMGwithdraw():string{
        let txData = this.TaboowBroker_Contract.EMGwithdraw.getData();
        return txData
      }

      //sweep onlyowner
      setSweepTaboowBroker(addr, value):string{
        let txData = this.TaboowBroker_Contract.sweep.getData(addr, value);
        return txData
      }
      //reserveTokens onlyowner
      setReserveTokens_TaboowBroker(addr, value):string{
        let txData = this.TaboowBroker_Contract.reserveTokens.getData(addr, value);
        return txData
      }
      //tokensDelivery onlyowner
      setTokensDelivery(value, addr):string{
        let txData = this.TaboowBroker_Contract.tokensDelivery.getData(value, addr);
        return txData
      }
}
