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

@Component({
  selector: 'panel-page',
  templateUrl: './contractPanel.page.html'
})
export class ContractPanelPage implements OnInit {
  //should think about administration panel (GET server role?) in a new tab

  roles: string[] = ['OWNER','BROKER', 'USER'];

  //hereded From LCX

  @Input() moreInfo;
  @Input() functions;

  @Output() back = new EventEmitter<boolean>();

  public submited: boolean = false;
  public contractInfo: any;
  public functionForm: FormGroup;
  
  public infoFunctions = [];
  public transFunctions = [];
  public funct: any;
  public owner: string;

  public message;

  //Old structure
  //abi : any = {};
  //cAddress = "0x5ce5615485d4BE300C1e413a27B4fDdCaD7B2fa3";
  //contract;

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  //revisar function forms
  constructor(protected contract: ContractService, private sendDialogService : SendDialogService, protected _account: AccountService, private _dialog: DialogService, private router : Router, private _web3: Web3) {
  
    //this.contract.setContract();
  }

  async ngOnInit(){
    let x = await this.contract.getTaboowOwner();
    console.log(x);

    if(this._account.account.address == x){
      this.message = "You're the owner";
    }else{
      this.message = "You're not the owner";
    }
    

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
    
    
  }
  /*
  setContractsInstances(){
    this.getAbis();
    if(this._web3.infuraKey != ''){
      this.Taboow_Contract =this._web3.web3.eth.contract(this.Taboow_Abi).at(this.Taboow_Addr);
      this.TaboowBroker_Contract =this._web3.web3.eth.contract(this.TaboowBroker_Abi).at(this.TaboowBroker_Addr);
      console.log("taboowContract", this.Taboow_Contract);
      console.log("taboowBrokerContract", this.TaboowBroker_Contract);
    }
  }
  getAbis(){
    this.Taboow_Abi = require('../../../../contracts/Taboow.json');
    this.TaboowBroker_Abi = require('../../../../contracts/Taboow_Broker.json');
    console.log("Taboow_Abi", this.Taboow_Abi);
    console.log("TaboowBroker_Abi", this.TaboowBroker_Abi);
    
    
  }


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
