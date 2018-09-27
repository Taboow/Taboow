import { Component, Inject  } from '@angular/core'
import { Router } from '@angular/router'

import { DialogService } from '../../services/dialog.service'
import { MdDialogRef } from '@angular/material';
import { MD_DIALOG_DATA } from '@angular/material';


import { Web3 } from '../../services/web3.service'
import { AccountService } from '../../services/account.service'


@Component({
  selector: 'send-dialog',
  templateUrl: './send-dialog.component.html'
})
export class SendDialogComponent{
  insufficient = false;
  constructor(public _web3: Web3, public _account: AccountService, private router: Router, public dialogService: DialogService, @Inject(MD_DIALOG_DATA) public data: any, public dialogRef: MdDialogRef<SendDialogComponent>) {
    if(parseInt(_web3.web3.toWei(this._account.account.balance,'ether')) < data.total ){
      this.insufficient= true;
    }
  }
   

  async sendTx(pass){

    console.log("network",this._web3.network)
    let self = this;
    let error = "";
    let title = "";
    let message = "";
    let txs: any[];

    if (typeof(pass)=='undefined' || pass==""){
      return false
    }
    let privateKey;
    try{
      privateKey = this._account.getPrivateKey(pass)
    }catch(e){
      title = "Unable to complete transaction";
      message = "Something went wrong";
      error = e.message;
      self.dialogRef.close();
      let dialogRef = self.dialogService.openErrorDialog(title,message,error);
      return false
    }
    if(typeof(this.data.tx.length) == 'undefined'){
      txs = [this.data.tx]
    }else{
      txs = this.data.tx
    }
    console.log('antes del for', txs)
    for(let i=0; i<txs.length; i++){
      console.log('dentro del forrrrr')
      txs[i].sign(privateKey);
      let serialized = "0x"+(txs[i].serialize()).toString('hex');
      let sendResult = await this._web3.sendRawTx(serialized);
     
      self.dialogRef.close();

      if(sendResult instanceof Error){
        console.log("error",sendResult);
        title = "Unable to complete transaction";
        message = "Something went wrong"
        error = sendResult.message;
        self.dialogRef.close();
        let dialogRef = self.dialogService.openErrorDialog(title,message,error);
      }else{
        console.log("no error",sendResult)
        if(this.data.action == "order") {

        }

        let pending: any = null;
        let j = 0;
        while(pending == null && i<15){
          pending = await self._web3.getTx(sendResult);
          console.log(pending);
          j++;
        }
        if(i>=15){
          title = "Unable to complete transaction";
          message = "Something went wrong"
          error = "We can not check network confirmation";
          self.dialogRef.close();
          let dialogRef = self.dialogService.openErrorDialog(title,message,error);
        }else{
          pending.timeStamp = Date.now()/1000;
          self._account.addPendingTx(pending);
          if(this.data.action == 'contractDeploy'){
       
          }
          console.log("que pasaaaaa",i==txs.length-1)
          if(i==txs.length-1){
            title = "Your transaction has been sent";
            message = "You can see the progress in the history tab"
            self.dialogRef.close();
            console.log(this.data.action)
            let dialogRef = self.dialogService.openErrorDialog(title, message, error, this.data.action);
            dialogRef.afterClosed().subscribe(result=>{
              console.log('result', result)
                if(typeof(result)!= 'undefined' || result != ''){
                  this.router.navigate(['/wallet/history']);
                }
            })
          }
        }
      }
    }
  }

  closeDialog(){
    this.dialogRef.close();
  }

}