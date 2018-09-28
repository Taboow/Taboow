import { Injectable} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router'

import { WalletService } from './wallet.service'
import { TokenService } from './token.service'
import { Web3 } from "./web3.service";

import * as EthWallet from 'ethereumjs-wallet'
import { EtherscanService } from './etherscan.service';

@Injectable()
export class AccountService{
  updated = false;
  updatedTokens = false;
  account : any = {};
  pending: Array<any> = [];
  events : Array<any> = [];
  marginCalls : Array<any> = [];
  interval;
  tokenInterval;
  apikey: string = "";

  constructor(private http: Http, private _wallet : WalletService, private _token : TokenService,private _web3: Web3, private router: Router, private _scan: EtherscanService){
    this._scan.getApiKey();
    if(this._scan.apikey != "" && this._web3.infuraKey != ""){     
      this.getAccountData();
      if('address' in this.account){
        this.startIntervalData();
        this.account.tokkens = [];
      }
    }
  }

  async setAccount(account){
    if('address' in this.account && typeof(this.account.address)!= "undefined"){
      console.log("clear intervals")
      clearInterval(this.interval)
      this.clearIntervalTokens();
    }
    this.router.navigate(['/wallet/global']);
    this.account = account;
    localStorage.setItem('acc',JSON.stringify(account.address));
    this.getPendingTx();
    await this.startIntervalData();
    await this.setTokens();
    
  }

  async refreshAccountData(){
      this.updatedTokens = false;
      clearInterval(this.interval)
      this.clearIntervalTokens();
      this.getPendingTx();
      await this.startIntervalData();
      await this.setTokens(); 
  }
  
  refreshAccount(){
    localStorage.removeItem('acc');
    this.getAccountData();
    if(typeof(this.account.address) == "undefined"){
      clearInterval(this.interval);
      this.clearIntervalTokens();
    }
    this.router.navigate(['/wallet/global']);
  }

  getAccount(){
    let acc:any = {};
    if(localStorage.getItem('acc') &&  localStorage.getItem('acc')!= 'undefined'){
      let addr = JSON.parse(localStorage.getItem('acc'));  
      acc = this._wallet.getAccount(addr);
    }else if(this._wallet.wallet !== null && this._wallet.wallet.length >0){
      acc = this._wallet.wallet[0];
      localStorage.setItem('acc', JSON.stringify(acc.address));
    }else{
      acc = {};
    }
    return acc;
  }

  async setData(){
    let addr = this.account.address;
    let self= this;
    this._web3.web3.eth.getBalance(addr,(err,result)=>{
      self.account.balance = self._web3.web3.fromWei(result.toNumber(),'ether');
    })
    let history = await this._scan.getHistory(addr);

    for(let i = 0; i<this.pending.length; i++){
      let result = history.findIndex(x => (x.hash).toLowerCase() == this.pending[i].hash.toLowerCase());
      if(result == -1){
        history.unshift(this.pending[i]);
      }else{
        this.pending.splice(i,1)
        this.removePendingTx();
      }    
    }
    for(let i =0; i<history.length; i++){
      let date = this.tm(history[i].timeStamp);
      history[i].date = date;
    }
    this.account.history = await history;
    this.updated=true;
  }
  
  async getAccountData(){
    console.log("into getAccoount data");
    
    this.account = this.getAccount();
    
    if(Object.keys(this.account).length != 0){
      await this.getPendingTx();
      await this.setData();
      await this.setTokens();
      
    }
  }

  getTokensLocale(){
    if(localStorage.getItem('ethAcc')){
      let wallet = JSON.parse(localStorage.getItem('ethAcc'));
      let result = wallet.findIndex(x => x.address == this.account.address);
      if(wallet[result].hasOwnProperty('tokens')){
        let tokens = wallet[result].tokens.filter(x=> x.network == this._web3.network)
        return tokens;
      }else{
        return [];
      }
    }
  }

  async setTokens(){
    this.account.tokens = [];
    this.updatedTokens =false;
    if('address' in this.account){
      this.account.tokens = this.getTokensLocale();
      console.log("tokens local", this.account.tokens)
      await this.updateTokens();
    }
    this.updatedTokens = true;
  }

  saveAccountTokens(){
    if(localStorage.getItem('ethAcc')){
      let wallet = JSON.parse(localStorage.getItem('ethAcc'));
      let result = wallet.findIndex(x => x.address.toLowerCase() == this.account.address.toLowerCase());
      wallet[result].tokens = this.account.tokens;
    }
  }
  
  addToken(token){
      if('tokens' in this.account){
        this.account.tokens.push(token);
      }else{
        this.account.tokens = [token]
      }
      this.saveAccountTokens();
  }

  deleteToken(tokenAdrr){
      if('tokens' in this.account){
        this.account.tokens.forEach(tk=>{
          if(tk.contractAddress == tokenAdrr){
            tk.deleted = true;
          }
        })
      }
      this.saveAccountTokens();
  }

  async updateTokens(){
    let self = this;
    let tokens = this.account.tokens
    tokens = await this.updateTokenBalances(tokens);
    let resultTokens =  await this._scan.getTokensTransfers(this.account.address).toPromise();
    let tkns : Array<any> = [];
    tkns = resultTokens.result;
    for(let i = 0; i<tkns.length; i++){
      if(tokens.findIndex(x=> x.contractAddress == tkns[i].contractAddress) == -1){
        let token: any = {
          contractAddress :  tkns[i].contractAddress,
          tokenName:  tkns[i].tokenName,
          tokenSymbol:  tkns[i].tokenSymbol,
          tkenDecimal: parseInt( tkns[i].tokenDecimal),
          network : self._web3.network,
          deleted: false
        }
        token = await self.updateTokenBalance(token);
        if(!isNaN(token.tokenDecimal)){
            tokens.push(token);
        }
      }
    }
      self.account.tokens = await tokens;
      self.saveAccountTokens();
  }

  async updateTokenBalances(tokens){
    for(let i = 0; i<tokens.length; i++){
      tokens[i] = await this.updateTokenBalance(tokens[i]);        
    }
    
    return tokens;
  }

  async updateTokenBalance(token){
    if(!('balance' in token) || !token.deleted){
      this._token.setToken(token.contractAddress);
      if(isNaN(token.tokenDecimal)){
        token.tokenName = await this._token.getName();
        token.tokenSymbol = await this._token.getSymbol();
        token.tokenDecimal = await this._token.getDecimal();
      }      
      let exp = 10 ** token.tokenDecimal;
      let balance : any = await this._token.getBalanceOf(this.account.address);
      
      token.balance = balance.div(exp).toNumber();  
    }
    
    return token
  }
  
  
  getPendingTx(){
    this.pending=[];
    if(localStorage.getItem('ethAcc')){
      let wallet = JSON.parse(localStorage.getItem('ethAcc'));
      let result = wallet.findIndex(x => x.address == this.account.address);
      if(wallet[result].hasOwnProperty('pending')){
        this.pending= wallet[result].pending.filter(x=> x.network == this._web3.network);
      }
    }
  }
  
  async addPendingTx(tx){
    tx.network=this._web3.network;
    this.pending.push(tx);
    if(localStorage.getItem('ethAcc')){
      let wallet = JSON.parse(localStorage.getItem('ethAcc'));
      let result = wallet.findIndex(x => x.address == this.account.address);
      wallet[result].pending = this.pending;
      localStorage.setItem('ethAcc',JSON.stringify(wallet));
    }
    await this.setData();
  }

  removePendingTx(){
    let wallet = JSON.parse(localStorage.getItem('ethAcc'));
    let result = wallet.findIndex(x => x.address == this.account.address);
    wallet[result].pending = this.pending;
    localStorage.setItem('ethAcc',JSON.stringify(wallet));
  }

  getPrivateKey(pass){
    let wallet = EthWallet.fromV3(this.account.v3, pass);
    return wallet.getPrivateKey();
  }

  async startIntervalData(){
    await this.setData();
    this.interval = setInterval(async ()=>{
      await this.setData();
    },3000); 
      
  }

  startIntervalTokens(){
    this.tokenInterval = setInterval(()=>{
      if(this.account.tokens != []){
        this.updateTokens();
      }
    },3000);
  }
  clearIntervalTokens(){
    clearInterval(this.tokenInterval);
    this.tokenInterval = null;
  }

  tm(unix_tm) {
    let dt = new Date(parseInt(unix_tm)*1000); // Devuelve más 2 horas
    let  strDate = dt.getUTCDate()+"-"+(dt.getUTCMonth()+1)+"-"+dt.getUTCFullYear();
    return strDate;
  }

}