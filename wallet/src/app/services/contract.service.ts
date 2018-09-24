import { Injectable } from '@angular/core';

import { Web3 } from "./web3.service";
import { WalletService } from "./wallet.service";
import { AccountService } from './account.service';

//models
import { UserInformation } from '../components/contract/panel/userInformation.model';
import { TaboowBroker } from '../components/contract/panel/taboowBroker.model';
//dialogs
import { DialogService } from './dialog.service';
import { MdDialog } from '@angular/material';
import { LoadingDialogComponent } from '../components/dialogs/loading-dialog.component';
let fs = require('fs');

@Injectable()
export class ContractService {
    public Taboow_Abi;
	  public TaboowBroker_Abi;
  
    public Taboow_Addr;
    public TaboowBroker_Addr;
	
  
	  public Taboow_Contract;
    public TaboowBroker_Contract;

    //import panel component to service variables
    public verifiedAccount;
    public verifiedMessageTaboow;
    public userInfo = new UserInformation;
    public interval;
    public loadingD;
    
  constructor(public dialogService: DialogService, public dialog: MdDialog,  private _web3: Web3, private _wallet: WalletService, protected _account: AccountService){
    Promise.resolve().then(() => { 
      this.loadingD = this.dialog.open(LoadingDialogComponent, {
        width: '660px',
        height: '150px',
        disableClose: true,
      });
    });
    this.setContract();
    
  }
  ngOnInit(){
    this.setContract();

  }
  ngOnChanges(){
    this.ngOnInit();
    console.log("dentro?");
    
  }


  async setContract(){
    this.getAbi();
    if(this._web3.network == 3){
      this.Taboow_Addr = "0x8F361970fcA245710Ce91b993c24617671Aaefd0";
      this.TaboowBroker_Addr = "0xA902494Cd646398DAe95Adc003a503Bf5979e17e";
      console.log("Testnet");
      
    }
    if(this._web3.network == 1  ){
      this.Taboow_Addr = "0x2558908ce17eDDA670359D27773fc1A04b4847B9";
      this.TaboowBroker_Addr = "0x0f778E8DA98c235BD2B45954546d487709ECE688";
      console.log("Mainnet");
      
    }
    if(this._web3.infuraKey != ''){
      this.Taboow_Contract = this._web3.web3.eth.contract(this.Taboow_Abi).at(this.Taboow_Addr);
      this.TaboowBroker_Contract = this._web3.web3.eth.contract(this.TaboowBroker_Abi).at(this.TaboowBroker_Addr);
    }
    await this.load();
  }

  async load(){
    await this.isVerifiedAccount();
    await this.loadUserInformation();
    let pubEnd = await this.getPubEnd();
    let today = new Date;
    let now = today.getTime()/1000;
    console.log("now: ", now, "pubEnd: ",  pubEnd);
    let count = 0;
    if(pubEnd > now){
      console.log("inside if");
      
      this.interval = setInterval(async() =>{
        console.log("insideInterval");
        console.log("now: ", now, "pubEnd: ",  pubEnd);
        this.userInfo.pubEnd = await this.getPubEnd();
        let todayd = new Date;
        now = todayd.getTime()/1000;
        this.userInfo.now = todayd.getTime()/1000;
        count = count +1;     
      }, 60000);
    }
    this.loadingD.close();
  }
  async isVerifiedAccount(){
    this.verifiedAccount  = await this.getVerified(this._account.account.address);
    
    if(this.verifiedAccount == true){
      this.verifiedMessageTaboow = "Your account is verified";
    }else{
      this.verifiedMessageTaboow = "Your account is not verified";
    }
  }
  async loadUserInformation(){
    this.userInfo.account = this._account.account.address;
    this.userInfo.tokenUnit = await this.getTokenUnit();
    this.userInfo.reservedAmount = await this.getReserve(this.userInfo.account);
    this.userInfo.reservedAmount = this.userInfo.reservedAmount / this.userInfo.tokenUnit;
    
    this.userInfo.soldAmount = await this.getSold(this._account.account.address);
    this.userInfo.soldAmount = this.userInfo.soldAmount / this.userInfo.tokenUnit;
    this.userInfo.pubEnd = await this.getPubEnd();
    this.userInfo.pubEndDate = new Date(this.userInfo.pubEnd*1000);
    let today = new Date;
    this.userInfo.now = today.getTime()/1000;
    this.userInfo.balance = await this.getBalances(this.userInfo.account);
    if(this.userInfo.balance > 0){
      this.userInfo.balance = this.userInfo.balance / this.userInfo.tokenUnit;
    }

    
  }

  getAbi(){

    this.Taboow_Abi = require('../../assets/contracts/Taboow.json');
    this.TaboowBroker_Abi = require('../../assets/contracts/Taboow_Broker.json');
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
      setFreezeAccount(addr ,value):string{
        let txData = this.Taboow_Contract.freezeAccount.getData(addr ,value);
        return txData
      }
      //verifyAccount() onlyOwner
      setVerifyAccount(addr ,value):string{
        let txData = this.Taboow_Contract.verifyAccount.getData(addr ,value);
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
              console.log("res?",res);
              
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
      EMGwithdraw(value):string{
        let txData = this.TaboowBroker_Contract.EMGwithdraw.getData(value);
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












	//newContractService
	async getAbi2(path){
		return require(path)	
	}
	
	contractInstance(abi, address){
		let contract = this._web3.web3.eth.contract(abi).at(address);
		return contract;
	}

	async callFunction(contractInst, functionName:string, params){
		return new Promise (function (resolve, reject) {
			contractInst[functionName].call(...params, function(err, res){  
				if (err) {
					reject(err);
				} else {
					resolve(res.toString());
				}
			});
		});
	}

	getFunctionData(contractInst,functionName:string, params?){
		return contractInst[functionName].getData(...params);
	}	
}
