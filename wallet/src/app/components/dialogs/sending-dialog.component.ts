import { Component,  Inject } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'sending-dialog',
    templateUrl: './sending-dialog.component.html'
})

export class SendingDialogComponent{

    constructor(@Inject(MD_DIALOG_DATA) public data: string, public dialogRef: MdDialogRef<SendingDialogComponent>){

    }
}