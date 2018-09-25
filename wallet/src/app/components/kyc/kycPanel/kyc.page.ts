import { Component, Inject, OnInit } from '@angular/core'
import { Http, HttpModule, Headers, ResponseOptions} from '@angular/http';

import { AccountService } from '../../../services/account.service';
import { Web3 } from '../../../services/web3.service';
import fs = require('fs');
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';
import { MdDialog } from '@angular/material';
import { CountryDialogComponent } from './country-dialog.component';
import * as EthUtil from 'ethereumjs-util';


let resources = './extraResources/';

//eval(fs.readFileSync(resources+'jquery.facedetection.min.js')+'');
eval(fs.readFileSync(resources+'worker.js')+'');
var hark = require('hark');


var KYC = require('./../../../../../extraResources/kyc.js');

const ethGSV = require('ethereum-gen-sign-verify');

/*  usage example

account.service.ts // getPrivateKey(password) // returns this.account.privatekey
const keypair = ethGSV.generateKeyPair(); // keypair = { privateKey: '0xe3888eaa8bc6...', publicKey: '0xc1b8e4d...', address: '0xb24f93212....' }
const signature = ethGSV.sign('SomeDataAsString', keypair.privateKey); // signature = { r: '0x14aedb650....', s: '0x4a9aa9d436....', v: 27 }
const isValid = ethGSV.verify('SomeDataAsString', signature, keypair.address); // isValid = true
*/
@Component({
  selector: 'kyc-page',
  templateUrl: './kyc.page.html',
  
  styles:[
    `
        :host >>> angular2-date-picker >>> .wc-date-popover{           
            margin-top: 20px !important;

        }
        :host >>> angular2-date-picker >>> .wc-date-popover banner-true {           
            margin-top: 10px !important;

        }
        :host >>> angular2-date-picker >>> .wc-date-container {
            font-size: 10pt !important;
            font-family: "Lato-Regular", sans-serif !important;
            color: #000 !important;
            box-sizing: border-box !important;

            padding: 20px !important;
            border-radius: 5px !important;
            border: 1px solid #abb0b2 !important;
            margin-top: 10px !important;
            margin-bottom: 20px !important;
            background-color: white !important;

            display: block !important;
            width: 100% !important;
            
        }
        :host >>> angular2-date-picker >>> .wc-banner {
            background-color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .wc-date-container > span{
            display: block !important;
            font-family: "Lato-Regular", sans-serif !important;
            color: #000 !important;
            margin-top: -10px !important;
        }
        :host >>> angular2-date-picker >>> .current-year{
            color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .years-list-view > span:hover{
            color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .wc-details{
            background-color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .year-title{
            background-color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .selected-day > span{
            background-color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .calendar-day > span:hover{
            background-color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .months-view > span:hover{
            color: #41e241 !important;
        }
        
        :host >>> angular2-date-picker >>> .today > span{
            border: 1px solid #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .cal-util > .ok{
            color: #41e241 !important;
        }
        :host >>> angular2-date-picker >>> .current-month{
            color: #41e241 !important;
        }
        
        :host >>> angular2-date-picker >>> .current-year{
            color: #41e241 !important;
        }`
    
  ],
})
export class KYCPage implements OnInit {

  public countries =  require('../../../../assets/json/countries.json');
  public prefixes = require('../../../../assets/json/phonePrefixes.json');
  public accountType : string[] = ["Personal", "Company"];
  public country;

  public displayPersonal;
  public displayCompany;

  public ethAddrErr;
  public dateErr;

  public type;
  public ethAddr;
  public name;
  public surnames;
  public id;
  public nationality;
  public date: Date = new Date();
  public postalCode;
  public city;
  public address;
  public email;
  public ownCountry;
  public prefix;
  public phone;
  public occupation;
  public monthly;
  public annual;
  public companyName;
  public companyCif;
  public companyAddress;
  public companyWebsite;

  public submited = false;

  public moment = require('moment');

  protected url = "http://taboow.org:3000";

  
  settings = {
      bigBanner: true,
      format: 'dd-MM-yyyy',
      defaultOpen: false,
      timePicker : false,
      closeOnSelect: true
  }

  constructor(private http: Http, protected _account: AccountService, protected _web3 : Web3, public dialog: MdDialog) {
  }

  ngOnInit() {
    this.type = this.accountType[0];
    this.displayPersonal = true;
    let video = document.querySelector('video');
    let domain = './';

    let kyc = new KYC({
      video: video,
      domain: domain,
      steps: [
          {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          }, {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          }, {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          }, {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          }, {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          }, {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          }, {
              wait: 2000,
              validators: ['VOICE'],
              snapshot: false,
              auto: true,
              autoNext: false
          },{
              wait: 2000,
              validators: ['FACE'],
              snapshot: true,
              auto: false,
              autoNext: true
          },{
              wait: 2000,
              validators: ['FACE'],
              snapshot: true,
              auto: false,
              autoNext: true
          }, {
              wait: 2000,
              validators: ['PASSPORT/ID'],
              snapshot: true,
              auto: false,
              autoNext: true
          }
      ],
      loading: function(percentage) {
        console.log('Loading '+percentage+'%');
      },
      onFinish: function(result) {
          console.log('On finish');
          //uploadMedia(result.video, result.images[0], result.images[1], result.images[2]);
      },
      onStep: function(stepNumber, step, subStep) {
          console.log('On step '+stepNumber);
      },
      onRetry: function(stepNumber, verificationsFailed) {
          console.log('Try again');
      },
      onSuccess: function(stepNumber, step) {
          console.log('Success. Step = '+step);
          console.log(step);
          
      }
    });
    kyc.init();

  }

  myCountry(value){
    console.log(value)
    for (let ind = 0; ind < this.countries.length; ind++) {
        if(value == this.countries[ind].code){
            this.ownCountry= this.countries[ind].name;
        }    
    }
    for (let index = 0; index < this.prefixes.length; index++) {
        if(value == this.prefixes[index].code){
            this.prefix = this.prefixes[index].dial_code;
            console.log("this.prefix?", this.prefix);
        }
    }
  }
  myBirthdate(){
   console.log(this.date);
     
  }
  onDateSelect(x){
    this.date = x;
    
  }
  selectAccountType(x){
      this.type = x;
      console.log(this.type);
    
      if(this.type == "Personal"){
          this.displayPersonal = true;
          this.displayCompany = null;
      }
      if(this.type == "Company"){
          this.displayCompany = true;
          this.displayPersonal = false;
      }
  }
  openCountryDialog() {
    let dialogRef = this.dialog.open(CountryDialogComponent, {
      width: '660px',
      height: '',
      panelClass: 'dialog'
    });
  }

  confirm(form){
    this.submited = true;

    if(form.invalid){
        return false;
    }

    if(EthUtil.isValidAddress(form.controls.ethAddr.value) == false){  
        this.ethAddrErr = true;
    }

    if(EthUtil.isValidAddress(form.controls.ethAddr.value) == true){
        console.log("addr", form.controls.ethAddr.value);
        this.ethAddrErr = null;
    }

    
    let years = this.moment().diff(this.date, 'years');
    console.log("años de diferencia", years);
    if(years < 18){
        this.dateErr = true;
    }else{
        this.dateErr = null
    }
    
    if(this.dateErr == null && this.ethAddrErr == null){
        let x :string= form.controls.ethAddr.value.toString();
        console.log("x??",x);
        
        this.postAddr(x);
    }

    //this.postAddr(form.controls.ethAddr.value);
      
  }

  postAddr(data){
    let path = "/kyc?address="+data;
    //let userData = {"address":data}
    console.log("path", path);
    
    
    return new Promise((resolve, reject) => {
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      this.http.post(this.url+path, {headers: headers}).subscribe(res =>{
        resolve(res.json());
        //localStorage.setItem('userCredentials', JSON.stringify(data));
        let response = res.json();
        console.log("Post Res", res);
        //localStorage.setItem('access_token', JSON.stringify(response.access_token));
        //localStorage.setItem('refresh_token', JSON.stringify(response.refresh_token));
        
        
        console.log(response.access_token); 
        console.log(response.refresh_token);
        
      }, err =>{
        console.log(err);
        reject(err);
      });
    });



  }
}
