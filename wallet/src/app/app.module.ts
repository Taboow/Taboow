
import { NgModule, CUSTOM_ELEMENTS_SCHEMA }  from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Http, HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { MdInputModule, MdCheckboxModule, MdSidenavModule } from '@angular/material';
import { MdCardModule, MdButtonModule, MD_DIALOG_DATA} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MdDialogModule } from '@angular/material';



/*Routes*/
import { AppRoutingModule } from './app.routes';


/*Components*/
import { MyApp } from './app.component';
import { NavComponent } from './components/navComponent/nav.component'

import { PaginatorComponent } from './components/paginator/paginator.component'

import { WalletComponent } from './components/wallet/wallet.component'
import { GlobalPage } from './components/wallet/global/global.page'
import { SendPage } from './components/wallet/send/send.page'
import { ReceivePage } from './components/wallet/receive/receive.page'
import { ListComponent } from './components/wallet/global/list.component'
import { WsettingsPage } from './components/wallet/wsettings/wsettings.page'

import { TokensComponent } from './components/tokens/tokens.component'
import { GeneralPage } from './components/tokens/general/general.page'
import { SendTokensPage } from './components/tokens/send/send-tokens.page'
import { AddTokenPage } from './components/tokens/add/add.page'


import { ContractComponent } from './components/contract/contract.component';
import { ContractPanelPage } from './components/contract/panel/contractPanel.page';

import { SettingsComponent } from './components/settings/settings.component'

/*Dialogs*/
import { SelectAccountDialogComponent } from './components/navComponent/selectAccount-dialog.component';
import { AddAccountDialogComponent } from './components/navComponent/addAccount-dialog.component';
import { NewAccountDialogComponent } from './components/navComponent/newAccount-dialog.component';
import { ImportAccountDialogComponent } from './components/navComponent/importAccount-dialog.component';
import { SendDialogComponent } from './components/dialogs/send-dialog.component';
import { DeleteComponent } from './components/wallet/wsettings/confirm-delete.component';
import { JSONDialogComponent } from './components/wallet/wsettings/json-dialog.component';
import { PrivateKeyDialogComponent } from './components/wallet/wsettings/privatekey-dialog.component'
import { ErrorDialogComponent } from './components/dialogs/error-dialog.component';
import { LoadingDialogComponent } from './components/dialogs/loading-dialog.component';
import { WaitingDialogComponent } from './components/dialogs/waiting-dialog.component';
import { PendingDialogComponent } from './components/dialogs/pending-dialog.component';
import { ConfirmTxDialog } from './components/contract/panel/confirmTx.component';
import { BuyDialog } from './components/contract/panel/buy-dialog.component';
import { WithdrawTxDialog } from './components/contract/panel/withdrawTx.component';
import { WithdrawDialog } from './components/contract/panel/withdraw-dialog.component';


/*Servicies*/
import { WalletService } from './wallet.service';
import { AccountService } from './account.service';
import { ContractService } from './contract.service';
import { Web3 } from './web3.service';
import { DialogService } from './dialog.service';
import { SendDialogService } from './send-dialog.service';
import { TokenService } from './token.service';

/*Pipes*/
import { ConverterPipe } from './converter.pipe';



@NgModule({
  declarations: [
    MyApp,
    NavComponent,
    WalletComponent,
    GlobalPage,
    SendPage,
    ReceivePage,
    WsettingsPage,
    SettingsComponent,
    ConverterPipe,
    SelectAccountDialogComponent,
    AddAccountDialogComponent,
    NewAccountDialogComponent,
    ImportAccountDialogComponent,
    SendDialogComponent,
    DeleteComponent,
    ErrorDialogComponent,
    LoadingDialogComponent,
    WaitingDialogComponent,
    PendingDialogComponent,
    JSONDialogComponent,
    PrivateKeyDialogComponent,
    ConfirmTxDialog,
    BuyDialog,
    WithdrawTxDialog,
    WithdrawDialog,
    ListComponent,
    PaginatorComponent,
    TokensComponent,
    GeneralPage,
    SendTokensPage,
    AddTokenPage,
    ContractComponent,
    ContractPanelPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    MdSidenavModule,
    MdDialogModule,
    MdCardModule,
    MdButtonModule,
    MdInputModule,
    AppRoutingModule,
  ],
  exports: [
    MaterialModule,
    BrowserAnimationsModule,
  ],
  bootstrap: [MyApp],
  entryComponents: [
    MyApp,
    SelectAccountDialogComponent,
    AddAccountDialogComponent,
    NewAccountDialogComponent,
    ImportAccountDialogComponent,
    SendDialogComponent,
    DeleteComponent,
    ErrorDialogComponent,
    LoadingDialogComponent,
    WaitingDialogComponent,
    PendingDialogComponent,
    JSONDialogComponent,
    PrivateKeyDialogComponent,
    ConfirmTxDialog,
    BuyDialog,
    WithdrawTxDialog,
    WithdrawDialog
  ],
  providers: [
    WalletService,
    AccountService,
    ContractService,
    Web3,
    DialogService,
    SendDialogService,
    TokenService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
