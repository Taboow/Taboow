import { Component, OnInit } from '@angular/core';

import { AccountService } from '../../services/account.service';
import { Web3 } from '../../services/web3.service';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
})
export class ContractComponent implements OnInit {

  constructor(public _account:AccountService, protected _web3: Web3) {
  }
  ngOnInit() {
    console.log("dentro de contractComponent");
    console.log(this._account.apikey);
    console.log(this._account.account.address)
    
    
  }
}
