import { Component, Inject, OnInit } from '@angular/core'
import { Http, Headers, ResponseOptions, RequestOptions} from '@angular/http';
import { Router } from '@angular/router';
import { AccountService } from '../../../services/account.service';

import { Web3 } from '../../../services/web3.service';
import fs = require('fs');
import { AngularDateTimePickerModule } from 'angular2-datetimepicker';

import { MdDialog } from '@angular/material';
import { DialogService } from '../../../services/dialog.service';
import { CountryDialogComponent } from './country-dialog.component';
import { ErrorDialogComponent } from '../../dialogs/error-dialog.component';
import { LoadingDialogComponent } from '../../dialogs/loading-dialog.component';

import * as EthUtil from 'ethereumjs-util';
import * as EthWallet from 'ethereumjs-wallet'
import { stringify } from 'querystring';

let resources = './extraResources/';

//eval(fs.readFileSync(resources+'jquery.facedetection.min.js')+'');
eval(fs.readFileSync(resources+'worker.js')+'');

var KYC = require('./../../../../../extraResources/kyc.js');

const ethGSV = require('ethereum-gen-sign-verify');


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

  public formSubmit = true;
  public videoSubmit;
  public kycComplete;
  public accountStatus;

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
  public region;
  public province;

  protected pass;

  public submited = false;

  public moment = require('moment');

  protected url = "http://taboow.org:3000";

  public kycAddrStatusText;
  public kycCompanyQuestions;
  public kycUserQuestions;
  public kycStatus;

  public loadingPercentage = '';
  public currentStep = 0;
  public retryStep = false;
  public showContinue = false;
  public showDoStep = false;
  
  private kyc;
  private runSubStep = false;
  public loadingD;

  public hideSubstep = true;

  settings = {
      bigBanner: true,
      format: 'dd-MM-yyyy',
      defaultOpen: false,
      timePicker : false,
      closeOnSelect: true
  }

  constructor(protected router : Router, private http: Http, protected _account: AccountService, protected _web3 : Web3, public dialog: MdDialog, private dialogService: DialogService) {
  }

  async ngOnInit() {
    
    this.ethAddr = this._account.account.address;
    this.type = this.accountType[0];
    this.displayPersonal = true;

    if(!localStorage.getItem('kyc')){
        this.formSubmit = true;
        this.type = this.accountType[0];
        this.displayPersonal = true;
    
      }
      if(localStorage.getItem('kyc')){
        let acca= JSON.parse(localStorage.getItem('kyc'));
        for (let i = 0; i < acca.length; i++) {
            if(acca[i].address == this._account.account.address){
                this.formSubmit = null;
                this.displayPersonal = null;
                this.displayCompany = null;
                this.videoSubmit = null;
                if(this.accountStatus == null){

                }
                this.accountStatus;
            }else{
                this.formSubmit = true;
                this.type = this.accountType[0];
                this.displayPersonal = true;
            }
        }
      }



  }
  
  initKyc() {
    let lastStep;
    let video = document.getElementById('videoFrame');
    let domain = './';

    let that = this;

    this.kyc = new KYC({
        video: video,
        domain: domain,
        steps: [{
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
                validators: [],
                snapshot: true,
                auto: false,
                autoNext: true
            },{
                wait: 2000,
                validators: [],
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
          that.loadingPercentage = percentage;
        },
        onFinish: function(result) {
            console.log('On finish');
            that.blobToBase64(result.video, function(video) {
                that.postFiles(result.images[0].split(',')[1], result.images[1].split(',')[1], result.images[2].split(',')[1], video);
            })
        },
        onStep: function(stepNumber, step, subStep) {
            console.log('On step '+stepNumber);
            lastStep = step;
            that.currentStep = stepNumber;

            

            if (!step.auto) {
                that.showDoStep = true;
            } else {
                that.showDoStep = false;
            }
            that.showContinue = false;
            if (subStep == 0) {
                that.runSubStep= false;
                that.hideSubstep = true;
            } else {
                that.currentStep = 10;
                that.runSubStep = true;
                that.hideSubstep = false;
            }
        },
        onRetry: function(stepNumber, verificationsFailed) {
            console.log('Try again');
            that.retryStep = true;
            setTimeout(() => {
                that.retryStep = false;
            }, 5000);
            if (!lastStep.auto) {
                this.showDoStep = true;
            }
        },
        onSuccess: function(stepNumber, step) {
            console.log('Success. Step = '+step);
            console.log(step);
            that.showContinue = true;
            that.showDoStep = false;
            
        }
      });
      this.kyc.init();
  }
  blobToBase64 = function(blob, cb) {
    var reader = new FileReader();
    reader.onload = function() {
        var dataUrl = reader.result.toString();
        var base64 = dataUrl.split(',')[1];
        cb(base64);
    };
    reader.readAsDataURL(blob);
  }

  doStep() {
    if (this.runSubStep) {
        this.kyc.runNextStepSubStep();
    } else {
        this.kyc.runNextStep();
    }
    this.showDoStep = false;
  }

  nextStep() {
    this.kyc.goToNextStep();
  }

  home(){
    this.router.navigate(['/wallet/global']);
  }

  async checkStatus(){
    this.getStatus();
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
            this.prefix = parseInt(this.prefix) ;
            console.log("typeOf?",typeof(this.prefix));
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
   validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

  async confirm(form){
    let dialogRef;
    this.submited = true;
    if(form.invalid){
        return false;
    }

    let formControls = form.controls;
    console.log("PREFIX",formControls.prefix.value);
    
    let x = this.validateEmail(form.controls.email.value);

    console.log("respuesta validate mail",x);
    if(x == false){
        
        let title = "This email is not valid";
        let message= '';
        let error="invalid email";
        dialogRef = this.dialogService.openErrorDialog(title, message, error);
        
        dialogRef.afterClosed().subscribe(res=>{            
            document.getElementById("email").focus();
            
        })
        
        return false;
        
    }


    if(EthUtil.isValidAddress(form.controls.ethAddr.value) == false){  
        this.ethAddrErr = true;
        let title = "This address is not valid";
        let message= '';
        let error="invalid addr";
        
        dialogRef = this.dialogService.openErrorDialog(title, message, error);
        dialogRef.afterClosed().subscribe(res=>{
            document.getElementById("ethAddr").focus();
        })
        return false;
    }

    if(EthUtil.isValidAddress(form.controls.ethAddr.value) == true){
        console.log("addr", form.controls.ethAddr.value);
        this.ethAddrErr = null;
    }

   
    let addr :string= form.controls.ethAddr.value.toString();
    let pass :string= form.controls.pass.value;

    let years = this.moment().diff(this.date, 'years');
    console.log("age", years);
    if(years < 18){
        this.dateErr = true;
        let title = "Registration is only allowed to users older than 18 years";
        let message= '';
        let error="invalid birthdate";
        let dialogRef = this.dialogService.openErrorDialog(title, message, error);

        dialogRef.afterClosed().subscribe(res=>{            
            document.getElementById("country").focus();
        })
        return false;
    }else{
        this.dateErr = null
    }

    

    //connect with api
    if(this.dateErr == null && this.ethAddrErr == null){
        this.postAddr(addr, pass, formControls);
    }

  
  }

  async delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}   
  postAddr(data, pass, form){
    let path = "/kyc";
    data = data.toString();
    let obj = { address: data};
    let addr = JSON.stringify(obj);
    let wallet;
    let error="";
    let priv;

    this.loadingD = this.dialog.open(LoadingDialogComponent, {
        width: '660px',
        height: '150px',
        disableClose: true,
      });
      let sign
    
    try{
        wallet = EthWallet.fromV3(this._account.account.v3, pass);
        priv = wallet.getPrivateKeyString();
        sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
      }catch(e){
        this.loadingD.close();
        error= e.message;
        let title = "Error:";
        let message= '';

        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
        console.log(e);
      }
    if(error==""){
       
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            sign = JSON.stringify(sign)
            sign = btoa(sign)
            sign = sign.toString();
            let data = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoU2VjcmV0IjoiamFza2pzZGhpdWR1aWh3cWl1MjEyIiwiaWF0IjoxNTM3ODk0NTMzLCJleHAiOjE3MDg5ODk0NTMzfQ.f06c1LCyR-FYT9nJRm2r_6K8hSETqghw5Vwlq19ZqbI';
            data = "Bearer "+data;
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', data);
            headers.append('Signature', sign);
            let options = new RequestOptions({headers: headers});    
            console.log("outside post addr");
            
            
            this.http.post(this.url+path, addr, options).subscribe(async res =>{

                console.log("into response post addr");
                //this.kycAddrStatusText = res.statusText;
                this.setStatusAddrText(res.statusText);
                console.log(this._account.account.address, pass, form);
                this.loadingD.close();
                await this.getQuestions(this._account.account.address, pass, form);
                this.formSubmit = null;
                this.videoSubmit = true;
                
            }, err =>{
                this.loadingD.close();
                err= err.json();
                console.log(err);
               
                if(err.message || err._body){
                    if(err.message){
                        let title = "Error:";
                        let message= '';
                        let error=err.message;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);    
                    }
                    if(err._body){
                        console.log("errbody", err._body);
                        
                        let title = "Error:";
                        let message= '';
                        let error=err._body;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);
                    }
                }else{
                    let title = "Error:";
                    let message= '';
                    let error=err.message;
                    let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                    console.log(err);
                    reject(err);
                }
            });
            
        });
        
      }
      
  }

  setStatusAddrText(txt){
    this.kycAddrStatusText = txt;
  }
  getStatusAddrText(){
      return this.kycAddrStatusText;
  }
  getQuestions(data, pass, form){
      console.log("this.kycAddrStatusText", this.kycAddrStatusText);
      
      /*
        GET /kyc/:address/questions/
        Returns questions and their order to kyc video module
      */
    let path = "/kyc/"+data+"/questions";
    data = data.toString();
    let obj = { address: data};
    let addr = JSON.stringify(obj);
    let wallet;
    let error="";
    let priv;
    let sign;
    try{
        wallet = EthWallet.fromV3(this._account.account.v3, pass);
        priv = wallet.getPrivateKeyString();
        sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
      }catch(e){
        this.loadingD.close();
        error= e.message;
        let title = "Error:";
        let message= '';

        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
        console.log(e);
      }
      
    if(error==""){
        priv = wallet.getPrivateKeyString();
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            let sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
            sign = JSON.stringify(sign)
            sign = btoa(sign)
            sign = sign.toString();
            let data = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoU2VjcmV0IjoiamFza2pzZGhpdWR1aWh3cWl1MjEyIiwiaWF0IjoxNTM3ODk0NTMzLCJleHAiOjE3MDg5ODk0NTMzfQ.f06c1LCyR-FYT9nJRm2r_6K8hSETqghw5Vwlq19ZqbI';
            data = "Bearer "+data;
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', data);
            headers.append('Signature', sign);
            let options = new RequestOptions({headers: headers});   
            console.log("into get questions before GET");
            
            this.http.get(this.url+path, options).map(ans => ans.json()).subscribe(async (res:any) =>{
            
                console.log("res?",res);
                
                console.log("res.companyQuestions", res.companyQuestions);
                console.log("res.userQuestions", res.userQuestions);
                this.kycCompanyQuestions = res.companyQuestions;
                this.kycUserQuestions = res.userQuestions;
                await this.patchData(this._account.account.address, pass, form);
                this.formSubmit = null;
                this.videoSubmit = true;
            }, err =>{
                this.loadingD.close();
                err= err.json();
                console.log(err);
               
                if(err.message || err._body){
                    if(err.message){
                        let title = "Error:";
                        let message= '';
                        let error=err.message;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);    
                    }
                    if(err._body){
                        console.log("errbody", err._body);
                        
                        let title = "Error:";
                        let message= '';
                        let error=err._body;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);
                    }
                }else{
                    let title = "Error:";
                    let message= '';
                    let error=err.message;
                    let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                    console.log(err);
                    reject(err);
                }
            });
        });
      }
  }

 patchData(data, pass, form){
     /*
        PATCH /kyc/:address
        Set values of each field
     */
    let path = "/kyc/"+data;
    data = data.toString();
    let obj;

    if(form.type.value == this.accountType[0]){
        //personal
        obj = { 
        accountType: form.type.value,
        name: form.name.value,
        surname: form.surnames.value,
        passport: form.id.value,
        nationality: form.nationality.value,
        birthdate: this.date,
        zip: form.postalCode.value.toString(),
        city: form.city.value,
        street: form.address.value,
        email: form.email.value,
        country: this.ownCountry,
        prefix: form.prefix.value,
        phone: form.phone.value,
        ocupation: form.occupation.value,
        incomes: form.monthly.value,
        yearIncomes: form.annual.value
        };
    }
    if(form.type.value == this.accountType[1]){
        //company
        obj = { 
            companyName: form.companyAddress.value,
            companyCif: form.companyCif.value,
            companyAddress: form.companyAddress.value,
            companyWeb: form.companyWebsite.value,
            accountType: form.type.value,
            name: form.name.value,
            surname: form.surnames.value,
            passport: form.id.value,
            nationality: form.nationality.value,
            birthdate: this.date,
            zip: form.postalCode.value.toString(),
            city: form.city.value,
            street: form.address.value,
            email: form.email.value,
            country: this.ownCountry,
            prefix: form.prefix.value,
            phone: form.phone.value,
            ocupation: form.occupation.value,
            incomes: form.monthly.value,
            yearIncomes: form.annual.value
            };
    }
    
    let postData = JSON.stringify(obj);
    console.log(postData);
    
    let wallet;
    let error="";
    let priv;
    let sign;
    
    try{
        wallet = EthWallet.fromV3(this._account.account.v3, pass);
        priv = wallet.getPrivateKeyString();
        sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
      }catch(e){
        this.loadingD.close();
        error= e.message;
        let title = "Error:";
        let message= '';

        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
        console.log(e);
      }
    if(error==""){
        priv = wallet.getPrivateKeyString();
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            let sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
            sign = JSON.stringify(sign)
            sign = btoa(sign)
            sign = sign.toString();
            let data = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoU2VjcmV0IjoiamFza2pzZGhpdWR1aWh3cWl1MjEyIiwiaWF0IjoxNTM3ODk0NTMzLCJleHAiOjE3MDg5ODk0NTMzfQ.f06c1LCyR-FYT9nJRm2r_6K8hSETqghw5Vwlq19ZqbI';
            data = "Bearer "+data;
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', data);
            headers.append('Signature', sign);
            let options = new RequestOptions({headers: headers});   
            console.log("into patch data before PATCH");
            
            this.http.patch(this.url+path, postData, options).subscribe(async res =>{
                console.log("dentro del patch?????");
                
                console.log("res patch form?",res);
                if(res.status == 204){
                    this.formSubmit = null;
                    this.videoSubmit = true;
                    this.initKyc();
                    await this.getStatus();
                }
            }, err =>{
                this.loadingD.close();
                err= err.json();
                console.log(err);
               
                if(err.message || err._body){
                    if(err.message){
                        let title = "Error:";
                        let message= '';
                        let error=err.message;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);    
                    }
                    if(err._body){
                        console.log("errbody", err._body);
                        
                        let title = "Error:";
                        let message= '';
                        let error=err._body;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);
                    }
                }else{
                    let title = "Error:";
                    let message= '';
                    let error=err.message;
                    let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                    console.log(err);
                    reject(err);
                }
            });
        });
      }
  }

  postFiles(face, paper, passport, video){
    //POST /kyc/:address/files
    //Let send a file for "face", "paper", "passport" y "video".

    //base64 objects “face", "paper", "passport" y "video"
    //how to send?
    //how to get?
    let data = this._account.account.address;
    let pass = this.pass;

    let path = "/kyc/"+data+"/files";
    data = data.toString();
    let obj = { face: face, paper: paper, passport: passport, video: video};
    let addr = JSON.stringify(obj);
    let wallet;
    let error="";
    let priv;
    this.loadingD = this.dialog.open(LoadingDialogComponent, {
        width: '660px',
        height: '150px',
        disableClose: true,
      });

    let sign;
    
    try{
        wallet = EthWallet.fromV3(this._account.account.v3, pass);
        priv = wallet.getPrivateKeyString();
        sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
      }catch(e){
        this.loadingD.close();
        error= e.message;
        let title = "Error:";
        let message= '';

        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
        console.log(e);
      }
    if(error==""){
        priv = wallet.getPrivateKeyString();
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            let sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
            sign = JSON.stringify(sign)
            sign = btoa(sign)
            sign = sign.toString();
            let data = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoU2VjcmV0IjoiamFza2pzZGhpdWR1aWh3cWl1MjEyIiwiaWF0IjoxNTM3ODk0NTMzLCJleHAiOjE3MDg5ODk0NTMzfQ.f06c1LCyR-FYT9nJRm2r_6K8hSETqghw5Vwlq19ZqbI';
            data = "Bearer "+data;
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', data);
            headers.append('Signature', sign);
            let options = new RequestOptions({headers: headers});

            this.http.post(this.url+path, addr, options).subscribe(async res =>{
                
                if(res.status == 201){
                
                    await this.getStatus();
                    
                }
            }, err =>{
                this.loadingD.close();
                err= err.json();
                console.log(err);
               
                if(err.message || err._body){
                    if(err.message){
                        let title = "Error:";
                        let message= '';
                        let error=err.message;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);    
                    }
                    if(err._body){
                        console.log("errbody", err._body);
                        
                        let title = "Error:";
                        let message= '';
                        let error=err._body;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);
                    }
                }else{
                    let title = "Error:";
                    let message= '';
                    let error=err.message;
                    let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                    console.log(err);
                    reject(err);
                }
            });
        });
      }
  }



  getStatus(){
    /*
       GET /kyc/:address/status/
       returns status
    */
    let data = this._account.account.address;
    let pass = this.pass;

    let path = "/kyc/"+data+"/status";
    data = data.toString();
    let obj = { address: data};
    let addr = JSON.stringify(obj);
    let wallet;
    let error="";
    let priv;
    let sign;
    
    try{
        wallet = EthWallet.fromV3(this._account.account.v3, pass);
        priv = wallet.getPrivateKeyString();
        sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
      }catch(e){
        this.loadingD.close();
        error= e.message;
        let title = "Error:";
        let message= '';

        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
        console.log(e);
      }
    if(error==""){
        priv = wallet.getPrivateKeyString();
        return new Promise((resolve, reject) => {
            let headers = new Headers();
            let sign = ethGSV.sign("HO1231DF1HUOW23UFO579EFOIWUE32FB0WEF", priv);
            sign = JSON.stringify(sign)
            sign = btoa(sign)
            sign = sign.toString();
            let data = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoU2VjcmV0IjoiamFza2pzZGhpdWR1aWh3cWl1MjEyIiwiaWF0IjoxNTM3ODk0NTMzLCJleHAiOjE3MDg5ODk0NTMzfQ.f06c1LCyR-FYT9nJRm2r_6K8hSETqghw5Vwlq19ZqbI';
            data = "Bearer "+data;
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', data);
            headers.append('Signature', sign);
            let options = new RequestOptions({headers: headers});   
            console.log("into get questions before GET");
            
            this.http.get(this.url+path, options).map(ans => ans.json()).subscribe((res:any) =>{
            
                console.log("res getStatus?",res);
                //check if res.status exists
                this.accountStatus = res.status;

                let acc:any = {
                    address: this._account.account.address,
                    response: res.status
                }

                if(!localStorage.getItem('kyc')){
                    let acca= new Array();
                    acca[0]=acc;
                    localStorage.setItem('kyc',JSON.stringify(acca));
                
                  }else{
                    let  acca= JSON.parse(localStorage.getItem('kyc'));
                    acca.push(acc);
                    localStorage.setItem('kyc',JSON.stringify(acca));
                  }
                
            }, err =>{
                this.loadingD.close();
                err= err.json();
                console.log(err);
               
                if(err.message || err._body){
                    if(err.message){
                        let title = "Error:";
                        let message= '';
                        let error=err.message;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);    
                    }
                    if(err._body){
                        console.log("errbody", err._body);
                        
                        let title = "Error:";
                        let message= '';
                        let error=err._body;
                        let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                        console.log(err);
                        reject(err);
                    }
                }else{
                    let title = "Error:";
                    let message= '';
                    let error=err.message;
                    let dialogRef = this.dialogService.openErrorDialog(title, message, error);
                    console.log(err);
                    reject(err);
                }
            });
        });
      }
  }

}