import { Component, OnInit } from '@angular/core'

/*Services*/
import { AccountService } from '../../account.service'

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html'
})

export class ContractComponent implements OnInit {

  constructor(protected _account:AccountService) {
  }

  ngOnInit() {}
}
