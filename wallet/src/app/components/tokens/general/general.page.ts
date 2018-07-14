import { Component, OnInit } from '@angular/core'

/*Services*/
import { AccountService } from '../../../account.service'


@Component({
  selector: 'general-page',
  templateUrl: './general.html'
})

export class GeneralPage implements OnInit {


  constructor(protected _account: AccountService) {
    // console.log('SendPage')
  }

  ngOnInit() {
    // console.log("Inited, ", devp2p)
  }
}
