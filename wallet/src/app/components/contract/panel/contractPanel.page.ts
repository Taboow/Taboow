import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';

import { ContractService  } from '../../../contract.service';

import { SendDialogService } from '../../../send-dialog.service';
import { AccountService } from '../../../account.service';
import { DialogService } from '../../../dialog.service';
import { Router } from '@angular/router';
import { Web3 } from '../../../web3.service';
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

  public frozenAccount;
  public verifiedAccount;
  public brokerAccount;
  public taboowOwnerAccount;

  constructor(protected contract: ContractService, private sendDialogService : SendDialogService, protected _account: AccountService, private _dialog: DialogService, private router : Router, private _web3: Web3) {
    //loading 
    //loading close after this.userRole();

  }

  async ngOnInit(){
    await this.userRole();
    
    /*
    let fees = 0;
    let cost = 0;
    let y = await this.contract.setTransactionFee(20);
    console.log(y);
    let estimateGas = await this._web3.estimateGas(this._account.account.address, this.contract.Taboow_Addr, y)
    let txInfo = await this.unsignedTx(this.contract.Taboow_Addr, y, estimateGas);
    fees += estimateGas;
    cost += estimateGas;
    let self= this;
    let serialized = self.serializeTx(txInfo[0],'0000');
    let sendResult = await self._web3.sendRawTx(serialized);
    console.log("1",sendResult)

    let z = await this.contract.getTransactionFee();
    console.log("tx fee after",z);
    
    */
  }

  async userRole(){
    console.log("dentro de userRole?");
    await this.isFrozenAccount();

    await this.isTaboowOwner();
    await this.isTaboowBrokerOwner();
    if(this.TaboowBrokerOwner == true && this.TaboowOwner == true){
      this.taboowOwnerAccount = true;
    }else{
      if(this.TaboowBrokerOwner == true || this.TaboowOwner == true){
        this.taboowOwnerAccount = false;
      }else{
        this.taboowOwnerAccount = null;
      }
    }

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
  async isVerifiedAccount(){
    this.verifiedAccount  = await this.contract.getVerified(this._account.account.address);
    
    if(this.verifiedAccount == true){
      this.messageTaboow = "Verified ROLE.";
    }    
  }
  /*

  //NEW CONTRACT MODE
  getControl(controlName: string): AbstractControl{
    return this.functionForm.get(controlName);
  }

  showFunction(){
    let funct = this.getControl('functionCtrl').value
    //console.log("funct",funct.inputs)
    if(funct != this.funct){
      this.submited = false;
      //Remove prev controls
      if(this.funct != null){
        console.log("dentro remove");
        this.functionForm = this._forms.removeControls(this.funct.inputs, this.functionForm);
        if(this.funct.payable){
          this.functionForm.removeControl('ethAmount');
        }
      }
      
      this.funct = funct;
      this.functionForm = this._forms.addControls(funct.inputs, this.functionForm);
      if(this.funct.payable){
        this.functionForm.addControl('ethAmount', new FormControl(0, [Validators.required, Validators.min(0)]));
      }
      let element = document.getElementById('contract');
    }
  }

  async onSubmit(){
    this.submited = true;
    if(this.functionForm.invalid){
      return false
    }
    //let params = this._forms.getValues(this.funct.inputs, this.functionForm, this.contractInfo.type);
    if(this.funct.constant){  
      let response = await this._TaboowContract.callFunction(this._TaboowContract.contract, this.funct.name, params);
      console.log("response", response)
      if(this.funct.decimals == 'decimals'){
        let number = parseInt(response.toString()) /Math.pow(10,this.contractInfo.decimals);
				let zero = '0'
				response = number.toLocaleString('en') + "."+zero.repeat(this.contractInfo.decimals)
      }else if(this.funct.decimals == "eth"){
        let number = this._web3.web3.fromWei(parseInt(response.toString()),'ether')
				response = number.toLocaleString('en')
      }

      this._dialog.openMessageDialog(this.funct.name, response)
    }else{
      let dialogRef = this._dialog.openLoadingDialog();
      let data = await this._TaboowContract.getFunctionData(this.funct.name, params)
      let amount = 0;
      if(this.funct.payable){
        amount =  parseFloat(this.getControl('ethAmount').value)
      }

      //ERROR in [at-loader] ./src/app/components/contract/panel/contractPanel.page.ts:121:80
      //TS2345: Argument of type '{ data: any; }' is not assignable to parameter of type 'string'.
      
      //let tx =  await this._rawtx.createRaw(this.contractInfo.address, amount, {data:data})
      let tx =  await this._rawtx.createRaw(this.contractInfo.address, amount)
      console.log(tx)
      dialogRef.close();
      //tx, to, amount, fees, total, action, token?
      this.sendDialogService.openConfirmSend(tx[0], this.contractInfo.address, tx[2],tx[1]-tx[2], tx[1], "send")
  }
}

  decimalsOutput(value){
    let result = value/Math.pow(10,this.contractInfo.decimals)
    return result
  }

  goBack(){
    this.back.emit(true);
  }
*/
  async unsignedTx(contractAddr,txData, gas, amount?){
    let gasLimit = gas;
    
    //console.log(amount,"---", gasLimit*2)
    let chainId = 3;
    let acc = this._account.account;
    let amountW = (typeof(amount) == "undefined")? 0 : amount;
    let gasPrice  = this._web3.web3.toWei('10','gwei');
    let nonce = await this._web3.getNonce(acc.address)

    let txParams = {
      nonce: nonce,
      gasPrice: this._web3.web3.toHex(gasPrice),
      gasLimit: this._web3.web3.toHex(gasLimit),
      to: contractAddr,
      value: this._web3.web3.toHex(amountW),
      data: txData,
      chainId:'0x3'
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
