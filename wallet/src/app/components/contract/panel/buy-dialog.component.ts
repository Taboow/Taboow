import { Component,  Inject } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { MD_DIALOG_DATA } from '@angular/material';
import { ConfirmTxDialog } from './confirmTx.component';

@Component({
    selector: 'buy-deal',
    templateUrl: './buy-dialog.component.html'
})

export class BuyDialog{

    constructor(@Inject(MD_DIALOG_DATA) public data: string, public dialogRef: MdDialogRef<ConfirmTxDialog>){
    }
}