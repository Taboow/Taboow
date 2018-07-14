import { Component, OnInit } from '@angular/core'

/*Services*/
import { AccountService } from '../../../account.service'


@Component({
  selector: 'add-token-page',
  templateUrl: './add.html'
})

export class AddTokenPage implements OnInit {


  constructor(protected _account: AccountService) {
    // console.log('SendPage')
  }

  ngOnInit() {
    // console.log("Inited, ", devp2p)
  }
  addToken(){

  }
  cancel(){
    
  }
}
