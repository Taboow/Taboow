import { Component, OnInit } from '@angular/core'

import { AccountService } from '../../services/account.service'
import { Web3 } from '../../services/web3.service';

@Component({
  selector: 'kyc-component',
  templateUrl: './kyc.component.html',
})
export class KYCComponent implements OnInit {

  constructor(public _account:AccountService, private _web3: Web3) {
  }
  ngOnInit() {
    console.log("dentro de contractComponent");
    console.log(this._account.apikey);
    console.log(this._account.account.address)
  }
   
}
