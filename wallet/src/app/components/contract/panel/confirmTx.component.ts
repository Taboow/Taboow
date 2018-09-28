import { Component,  Inject } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import {MD_DIALOG_DATA} from '@angular/material';
import { AccountService } from '../../../services/account.service';

import { Web3 } from '../../../services/web3.service';
import { userInfo } from 'os';

@Component({
    selector: 'confirm-tx',
    templateUrl: './confirmTx.component.html'
})

export class ConfirmTxDialog{
    public pass;
    insufficient = false;
    constructor(@Inject(MD_DIALOG_DATA) public data: any, protected _account: AccountService, private _web3: Web3, private dialogRef: MdDialogRef<ConfirmTxDialog>){
        console.log("data del confirmtx",data);
        if(_web3.web3.toWei(this._account.account.balance,'ether') < data.cost ){
            this.insufficient= true;
        }
    }
    createContract(pass){
        if (typeof(pass)=='undefined' || pass==""){
            return false
        }
        this.dialogRef.close(pass);
    }

    closeDialog(){
        this.dialogRef.close();
    }

}