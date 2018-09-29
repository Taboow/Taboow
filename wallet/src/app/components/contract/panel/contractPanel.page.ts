import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

import { ContractService  } from '../../../services/contract.service';
import { Taboow } from './taboow.model';
import { TaboowBroker } from './taboowBroker.model';
import { UserInformation } from './userInformation.model';

import { MdDialog } from '@angular/material';
import { LoadingDialogComponent } from '../../dialogs/loading-dialog.component';
import { BuyDialog } from './buy-dialog.component';
import { ConfirmTxDialog } from './confirmTx.component';
import { WithdrawDialog } from './withdraw-dialog.component';
import { WithdrawTxDialog } from './withdrawTx.component';

import { SendDialogService } from '../../../services/send-dialog.service';
import { AccountService } from '../../../services/account.service';
import { DialogService } from '../../../services/dialog.service';
import { Router } from '@angular/router';
import { Web3 } from '../../../services/web3.service';
import * as EthTx from 'ethereumjs-tx';
import * as EthUtil from 'ethereumjs-util'
import { ThrowStmt } from '../../../../../node_modules/@angular/compiler';


@Component({
  selector: 'panel-page',
  templateUrl: './contractPanel.page.html'
})
export class ContractPanelPage implements OnInit {
  
  public messageTaboow;
  public messageTaboowBroker;

  public TaboowOwner:boolean;
  public TaboowBrokerOwner:boolean;

  public loadingD;

  public frozenAccount;
  public verifiedAccount;
  public brokerAccount;
  public taboowOwnerAccount;

  public inputValue1;

  public taboow = new Taboow;
  public taboowBroker = new TaboowBroker;
  public userInfo = new UserInformation;

  public interval;
  
 
  constructor(public dialogService: DialogService, protected contract: ContractService, protected sendDialogService : SendDialogService, protected _account: AccountService, public _dialog: DialogService, private router : Router, private _web3: Web3, public dialog: MdDialog) {
   /* Promise.resolve().then(() => { 
      this.loadingD = this.dialog.open(LoadingDialogComponent, {
        width: '660px',
        height: '150px',
        disableClose: true,
      });
    });*/
  }

  async ngOnInit(){

    await this.load();
    this.userInfo.account = this._account.account.address;
    let pubEnd = await this.contract.getPubEnd();
    let today = new Date;
    let now = today.getTime()/1000;
    console.log("now: ", now, "pubEnd: ",  pubEnd);
    let count = 0;
    if(pubEnd > now){
      console.log("inside if");
      
      this.interval = setInterval(() =>{
        console.log("insideInterval");
        this.userInfo.pubEnd = this.contract.getPubEnd();
        let todayd = new Date;
        now = todayd.getTime()/1000;
        this.userInfo.now = todayd.getTime()/1000;
        count = count +1;     
      }, 60000);
    }
    
  }

  async load(){
    
    await this.contract.isVerifiedAccount();
    await this.contract.loadUserInformation();
    //this.loadingD.close();
  }

  async userRole(){
    await this.isFrozenAccount();

    await this.isTaboowOwner();
    await this.isTaboowBrokerOwner();
    if(this.TaboowBrokerOwner == true && this.TaboowOwner == true){
      this.taboowOwnerAccount = true;
    }else{
        await this.isBrokerAccount();
        await this.contract.isVerifiedAccount();
      if(this.TaboowBrokerOwner == true || this.TaboowOwner == true){
        this.taboowOwnerAccount = false;
      }else{
        this.taboowOwnerAccount = null;
      }
    }
    await this.TaboowInfo();
    await this.TaboowBrokerInfo();
  }

  async isTaboowOwner(){
    let x = await this.contract.getTaboowOwner();
    
    if(this._account.account.address == x){
      this.TaboowOwner = true;
      this.messageTaboow = "You're the owner";
    }else{
      this.TaboowOwner = false;
      this.messageTaboow = "You're not the owner";
    }
  }

  async isTaboowBrokerOwner(){
    let x = await this.contract.getTaboowBrokerOwner();
    
    if(this._account.account.address == x){
      this.TaboowBrokerOwner = true;
      this.messageTaboowBroker = "You're the owner";
    }else{
      this.TaboowBrokerOwner = false;
      this.messageTaboowBroker = "You're not the owner";
    }
  }

  async isFrozenAccount(){
    this.frozenAccount  = await this.contract.getFrozenAccount(this._account.account.address);
    
    if(this.frozenAccount == true){
      this.messageTaboow = "Your account has been frozen, please contact our support team.";
    }    
  }

  async isBrokerAccount(){
    this.brokerAccount  = await this.contract.getBrokers(this._account.account.address);
    
    if(this.brokerAccount == true){
      this.messageTaboow = "Broker ROLE.";
    }    
  }


  async TaboowInfo(){
    this.taboow.TaboowName = await this.contract.getNameTaboow();
    this.taboow.TaboowStandard = await this.contract.getStandard();
    this.taboow.TaboowSymbol = await this.contract.getSymbol();
    this.taboow.TaboowDecimals = await this.contract.getDecimalsTaboow();
    this.taboow.TaboowTotalSupply = await this.contract.getTotalSupply();
    this.taboow.TaboowTotalSupply = this.taboow.TaboowTotalSupply / 1000000000000000000;
    this.taboow.TabooowTransactionFee = await this.contract.getTransactionFee();
    
  }
  async TaboowBrokerInfo(){
    this.taboowBroker.TaboowBrokerName = await this.contract.getNameTaboowBroker();
    this.taboowBroker.TaboowBrokerDecimals = await this.contract.getDecimalsTaboowBroker();
    this.taboowBroker.FWDaddrEth = await this.contract.getFWDaddrETH();
    this.taboowBroker.pubEnd = await this.contract.getPubEnd();
    this.taboowBroker.pubEndDate = new Date(this.taboowBroker.pubEnd*1000);
    
    this.taboowBroker.taboowAddr = await this.contract.getTaboowAddr();
    this.taboowBroker.tokenPrice = await this.contract.getTokenPrice();
    this.taboowBroker.tokenUnit = await this.contract.getTokenUnit();
  }

  //Taboow.sol call functions

  async isAllowed(owner, spender){
    this.taboow.allowanceResponse = await this.contract.getAllowance(owner, spender);
    this.taboow.allowanceResponse = "Amount allowed to spend: " + this.taboow.allowanceResponse;
  }
  async balances(addr){
    this.taboow.balanceResponse = await this.contract.getBalances(addr);
    this.taboow.balanceResponse = this.taboow.balanceResponse / 1000000000000000000;
    this.taboow.balanceResponse = "Balance: " + this.taboow.balanceResponse;
  }
  async isBroker(addr){
    this.taboow.brokerResponse = await this.contract.getBrokers(addr);
    if(this.taboow.brokerResponse == true){
      this.taboow.brokerResponse = "Is broker";
    }else{
      this.taboow.brokerResponse = "Is not broker";
    }
  }
  async isFrozen(addr){
    this.taboow.frozenResponse = await this.contract.getFrozenAccount(addr);
    if(this.taboow.frozenResponse == true){
      this.taboow.frozenResponse = "Is frozen";
    }else{
      this.taboow.frozenResponse = "Is not frozen";
    }
  }
  async isVerified(addr){
    this.taboow.verifiedResponse = await this.contract.getVerified(addr);
    if(this.taboow.verifiedResponse == true){
      this.taboow.verifiedResponse = "Is verified";
    }else{
      this.taboow.verifiedResponse = "Is not verified";
    }
  }
  async isReserved(addr){
    this.taboow.reservedResponse = await this.contract.getReserve(addr);
    this.taboow.reservedResponse = "Reserved amount: " + this.taboow.reservedResponse;
  }

  //Taboow.sol transaction functions

  async setTransactionFee(value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTransactionFee(value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)

    this.taboow.TabooowTransactionFee = value; //change to call
    //await this.contract.getTransactionFee();
  }

  async setBroker(addr, bool){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setBrokers(addr, bool);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }

  async verifyAccount(addr, bool){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setVerifyAccount(addr, bool);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }

  async freezeAccount(addr, bool){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setFreezeAccount(addr, bool);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async mint(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setMint(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async Taboow_Sweep(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setSweepTaboow(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async reserveTokens_Taboow(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setReserveTokens_Taboow(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async withdrawTokens(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setWithdrawTokens(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async approve(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setApprove(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async increaseApproval(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setIncreaseApproval(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async decreaseApproval(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setDecreaseApproval(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async transferTokens(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTransferTokens(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async transfer(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTransfer(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async transferFrom(addr1,addr2, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTransferFrom(addr1,addr2, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async approveAndCall(addr,value, data){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setApproveAndCall(addr,value, data);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
  }
  async TaboowTransferOwnership(addr){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.transferOwnership_Taboow(addr);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }


  //TaboowBroker.sol Call Functions
  async isSold(addr){
    this.taboowBroker.soldResponse = await this.contract.getSold(addr);
    //this.taboowBroker.soldResponse = "Sold amount: " + this.taboowBroker.soldResponse;
  }
 
  async isReserved_TaboowBroker(addr){
      this.taboowBroker.isReservedResponse = await this.contract.getIsReserved(addr);
      this.taboowBroker.isReservedResponse = "Reserved amount: " + this.taboowBroker.isReservedResponse;
  }
  async isVerified_TaboowBroker(addr){
      this.taboowBroker.isVerifiedResponse = await this.contract.getIsVerified(addr);
      if(this.taboowBroker.isVerifiedResponse == true){
        this.taboowBroker.isVerifiedResponse = "Is verified";
      }else{
        this.taboowBroker.isVerifiedResponse = "Is not verified";
      }
  }
  //to Implement
  async TaboowBrokerTransferOwnership(addr){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.transferOwnership_TaboowBroker(addr);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
  async setTaboowAddress(addr){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTaboowAddr(addr);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
  async setBrokerPrice(value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setPrice(value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
  async setBrokerPubEnd(value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setPubEnd(value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }

  
  async buyTaboow(){
    console.log("this.taboowBroker.buyValue", this.taboowBroker.buyValue);
    console.log("contract", this.userInfo);
    
    let estimateGas = 1000000000;
    let gasLimit = 1000000;
    let amount = this._web3.web3.toWei(this.taboowBroker.buyValue);
    console.log(this.userInfo);
    
    let dialogRef = this.dialog.open( ConfirmTxDialog, {
      width: '660px',
      height: '350px',
      data : {
        contract: this.userInfo,
        amount: amount,
        fees: estimateGas,
        cost: gasLimit
      }
    }); 
    let self = this;
    dialogRef.afterClosed().subscribe(async function(pass){
      let title = "Unable to buy tokens";
      let message = "Something went wrong"
      let error ="";
      let dialogRef;
      if(typeof(pass)== 'undefined' || pass==""){
        return false;
      }else{
        dialogRef = self.dialog.open( BuyDialog,
          {
            width: '660px',
            height: '150px',
            disableClose: true,
          }
        )
          let tx2Data = await self.contract.buy();
          let txInfo2 = await self.unsignedTx(self.contract.TaboowBroker_Addr ,tx2Data,1000000, amount);
          
          let serialized2 = self.serializeTx(txInfo2[0],pass);
          let sendResult2 = await self._web3.sendRawTx(serialized2);
          if(sendResult2 instanceof Error){
            let error = sendResult2.message;
            dialogRef.close();
            dialogRef = self.dialogService.openErrorDialog(title,message,error);
          }else{
            
            let pending: any = await self._web3.getTx(sendResult2);
            pending.timeStamp = Date.now()/1000;
            self._account.addPendingTx(pending);
            title = "Transaction has been sended";
            message = "You can see the transaction in the history tab"
            dialogRef.close();
            dialogRef = self.dialogService.openErrorDialog(title,message,error, 'redirect');
            dialogRef.afterClosed().subscribe(result=>{
                self.router.navigate(['/wallet/history']);
          })
          }
        }
    });
   
  }
  async withdrawPUB(){
    let estimateGas = 10000000000;
    let gasPrice = 10000000000;
    //let amount = this._web3.web3.toWei(this.taboowBroker.buyValue);
    let dialogRef = this.dialog.open( WithdrawTxDialog, {
      width: '660px',
      height: '450px',
      data : {
        contract: this.userInfo,
        fees: estimateGas,
        cost: 1000000
      }
    }); 
    let self = this;
    dialogRef.afterClosed().subscribe(async function(pass){
      let title = "Unable to withdraw tokens";
      let message = "Something went wrong"
      let error ="";
      let dialogRef;
      if(typeof(pass)== 'undefined' || pass==""){
        return false;
      }else{
        dialogRef = self.dialog.open( WithdrawDialog,
          {
            width: '660px',
            height: '150px',
            disableClose: true,
          }
        )
          let tx2Data = await self.contract.withdrawPUB();
          let txInfo2 = await self.unsignedTx(self.contract.TaboowBroker_Addr ,tx2Data,1000000);
          
          let serialized2 = self.serializeTx(txInfo2[0],pass);
          let sendResult2 = await self._web3.sendRawTx(serialized2);
          if(sendResult2 instanceof Error){
            let error = sendResult2.message;
            dialogRef.close();
            dialogRef = self.dialogService.openErrorDialog(title,message,error);
          }else{
            
            let pending: any = await self._web3.getTx(sendResult2);
            pending.timeStamp = Date.now()/1000;
            self._account.addPendingTx(pending);
            title = "Transaction has been sended";
            message = "You can see the transaction in the history tab"
            dialogRef.close();
            dialogRef = self.dialogService.openErrorDialog(title,message,error, 'redirect');
            dialogRef.afterClosed().subscribe(result=>{
                self.router.navigate(['/wallet/history']);
          })
          }
        }
    });

  }
  async EMGwithdraw(value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.EMGwithdraw(value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
  async sweepTaboowBroker(addr, value){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setSweepTaboowBroker(addr, value);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
  async tokensDelivery(value, addr){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTokensDelivery(value, addr);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
  async reserveTokens_TaboowBroker(value, addr){
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setReserveTokens_TaboowBroker(value, addr);
    //console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    //console.log("1",sendResult)
    //await this.userRole();
  }
 
  async unsignedTx(contractAddr,txData, gas, amount?){
    let gasLimit = gas;
    
    //console.log(amount,"---", gasLimit*2)
    let chainId;
    if(this._web3.network == 1){
      chainId = "0x1";
    }
    if(this._web3.network == 3){
      chainId = "0x3";
    }
    
    let acc = this._account.account;
    console.log("account unsignedTxs", acc);
    
    let amountW = (typeof(amount) == "undefined")? 0 : amount;
    let gasPrice  = this._web3.web3.toWei('10','gwei');
    let nonce = await this._web3.getNonce(acc.address)
    console.log("nonce de este account", nonce);
    console.log("contractAddr", contractAddr);
    

    let txParams = {
      nonce: nonce,
      gasPrice: this._web3.web3.toHex(gasPrice),
      gasLimit: this._web3.web3.toHex(gasLimit),
      to: contractAddr,
      value: this._web3.web3.toHex(amountW),
      data: txData,
      chainId: chainId
    }
  
    let tx= new EthTx(txParams);
    
    let fees = gasLimit*gasPrice;
    let cost = 0;
    if(typeof(amount) == "undefined"){
      cost = fees
    }else{
      cost = fees+parseFloat(amount);
    }

    return [tx, fees, cost, EthUtil.bufferToHex(tx.hash(true))]

  }
  serializeTx(tx,pass){
    let tx2= tx;
    let privateKey;
    try{
      privateKey = this._account.getPrivateKey(pass)
    }catch(e){
      return false;
    }
    tx2.sign(privateKey);
    let serialized = EthUtil.bufferToHex(tx2.serialize());
    return serialized;
  }
}
