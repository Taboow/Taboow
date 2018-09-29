import { Component,  Inject, OnInit} from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA} from '@angular/material';


@Component({
    selector: 'country-dialog',
    templateUrl: './country-dialog.component.html'
})

export class CountryDialogComponent implements OnInit{
    constructor(@Inject(MD_DIALOG_DATA) public data: any, public dialogRef: MdDialogRef<CountryDialogComponent>){

    }
    ngOnInit(){

    }
    closeDialog(){
       
        this.dialogRef.close();
    }

}