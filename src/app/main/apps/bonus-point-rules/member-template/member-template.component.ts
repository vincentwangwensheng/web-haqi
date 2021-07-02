import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MemberListEntity, MembersListServiceService, SysParam} from '../membersListService/members-list-service.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';

@Component({
  selector: 'app-member-tempalte',
  templateUrl: './member-template.component.html',
  styleUrls: ['./member-template.component.scss']
})
export class MemberTemplateComponent implements OnInit  , OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject();
    @Input()
     M_ID: string;

    sysPara: SysParam;
    MemberListTitle: string;
    MemberPra: MemberEntity;
    options: FormGroup;
    memberListSource: MemberListEntity; // 定义一个实体接收单个编辑的值
    btuDis: boolean;
   constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private routeInfo: ActivatedRoute,
      private router: Router,
      public dialog: MatDialog,
      private loading: FuseProgressBarService,
      private membersListService: MembersListServiceService,
    ) {
      this.options = new FormBuilder().group({
          id:  new FormControl({value: ''  }, [Validators.required] ),
          memberName:  new FormControl({value: ''}, [Validators.required] ),
          authMethod: new FormControl({value: ''}, [Validators.required] ),
          url: new FormControl({value: ''}, [Validators.required] ),
          username: new FormControl({value: ''}, [Validators.required] ),
          password: new FormControl({value: ''}, [Validators.required] ),
          appID: new FormControl({value: ''}, [Validators.required] ),
          appSecret: new FormControl({value: ''}, [Validators.required] ),
          enabled: new FormControl({value: ''}, [Validators.required] ),
          createdBy: new FormControl({value: ''}, [Validators.required] ),
          createdDate: new FormControl({value: ''}, [Validators.required] ),
          lastModifiedBy: new FormControl({value: ''}, [Validators.required] ),
          lastModifiedDate: new FormControl({value: ''}, [Validators.required] ),
      });
  }


  ngOnInit() {
       this.initParam();
       if (CouponParameter.Member_ID === this.M_ID){
           this.MemberListTitle = this.translate.instant('BonusPointUnion.MembersList.AddMemberTitle'); // '新建成员';
           this.sysPara.EditStruts = true;
           this.sysPara.authMethodName =  this.translate.instant('BonusPointUnion.MembersList.notAuthMethod'); // '免认证';
           this.options.controls.id.patchValue(null);
           this.options.controls.memberName.patchValue(null) ;
           this.options.controls.authMethod.patchValue(null);
           this.options.controls.url.patchValue(null);
           this.options.controls.username.patchValue(null);
           this.options.controls.password.patchValue(null);
           this.options.controls.appID.patchValue(null);
           this.options.controls.appSecret.patchValue(null);
           this.options.controls.enabled.patchValue(true);
           this.options.controls.createdBy.patchValue(null);
           this.options.controls.createdDate.patchValue(null);
           this.options.controls.lastModifiedBy.patchValue(null);
           this.options.controls.lastModifiedDate.patchValue(null);
       } else {
           this.getMemberEntityByID();
           this.sysPara.EditStruts = false;
           this.MemberListTitle =   this.translate.instant('BonusPointUnion.MembersList.DetailTitle'); // '成员详情';
       }
  }

    // 初始化变量
    initParam(){
        this.sysPara = new SysParam();
        this.MemberPra = new MemberEntity();
        this.sysPara.pwdType = CouponParameter.INPUT_PASSWORD;
        this.sysPara.AppSecretType = CouponParameter.INPUT_PASSWORD;
        this.sysPara.ShowPwd = false;
        this.sysPara.showAppSecret = false;
        this.sysPara.selectAuthMethodStruts = false;
        this.sysPara.authMethodTypes = [
            {id: 0 , name: this.translate.instant('BonusPointUnion.MembersList.notAuthMethod')}, // 免认证
            {id: 1 , name:  CouponParameter.OAUTH2},
        ];
        this.sysPara.StrutsSource = [
            {id: true  , name: this.translate.instant('BonusPointUnion.normal')}, // 正常
            {id: false , name: this.translate.instant('BonusPointUnion.frozen')}, // 冻结
        ];
    }

    ChangePwdStruts(){
        if (this.sysPara.ShowPwd){
            this.sysPara.pwdType = CouponParameter.INPUT_PASSWORD;
            this.sysPara.ShowPwd = false;
        } else {
            this.sysPara.pwdType = CouponParameter.INPUT_TEXT;
            this.sysPara.ShowPwd = true;
        }
     }

    ChangeAppSecretStruts(){
        if (this.sysPara.showAppSecret){
            this.sysPara.AppSecretType = CouponParameter.INPUT_PASSWORD;
            this.sysPara.showAppSecret = false;
        } else {
            this.sysPara.AppSecretType = CouponParameter.INPUT_TEXT;
            this.sysPara.showAppSecret = true;
        }
    }


     getMemberEntityByID(){
         this.membersListService.getMemberById(this.M_ID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
             res => {
                 this.memberListSource = res ;
                 this.sysPara.authMethodName = this.memberListSource.authMethod;
                 this.options.controls.memberName.patchValue(this.memberListSource.memberName) ;
                 this.options.controls.authMethod.patchValue(this.memberListSource.authMethod) ;
                 this.options.controls.url.patchValue(this.memberListSource.url) ;
                 this.options.controls.username.patchValue( this.memberListSource.username) ;
                 this.options.controls.password.patchValue(this.memberListSource.password) ;
                 this.options.controls.appID.patchValue(this.memberListSource.appID) ;
                 this.options.controls.appSecret.patchValue( this.memberListSource.appSecret) ;
                 this.options.controls.enabled.patchValue(this.memberListSource.enabled) ;
                 this.options.controls.createdBy.patchValue(this.memberListSource.createdBy) ;
                 this.options.controls.createdDate.patchValue(this.memberListSource.createdDate) ;
                 this.options.controls.lastModifiedBy.patchValue( this.memberListSource.lastModifiedBy) ;
                 this.options.controls.lastModifiedDate.patchValue(this.memberListSource.lastModifiedDate) ;   // 免认证
                 this.options.disable();
                 if ( this.memberListSource.authMethod ===  this.translate.instant('BonusPointUnion.MembersList.notAuthMethod')) {
                     this.sysPara.selectAuthMethodStruts = false;
                 } else {
                     this.sysPara.selectAuthMethodStruts = true;
                 }
             },
             error1 => {},
         );
     }



    // 编辑保存
    toSaveEdit(){
        if (CouponParameter.Member_ID === this.M_ID) {
            // 新增
            this.options.controls.authMethod.patchValue(this.sysPara.authMethodName)  ;
            const b = this.reSnackBar();
            if (b){
                return;
            }
            this.btuDis = true;
            this.options.controls.createdBy.patchValue(sessionStorage.getItem('username')) ;
            this.options.controls.createdDate.patchValue(new Date()) ;
            this.membersListService.createMember(this.options.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                   //  this.btuDis = false;
                    this.snackBar.open(this.translate.instant('BonusPointUnion.saveSuccess'), '✖'); // 保存成功
                    document.getElementById('clear_btu').click();
                },
                error1 => { this.btuDis = false; }
            );
        } else {
            // 修改
            this.options.value[this.MemberPra.authMethod] = this.sysPara.authMethodName ;
            this.options.value[this.MemberPra.id]  = this.memberListSource.id;
            const b = this.reSnackBar();
            if (b){
                return;
            }
            this.btuDis = true;
            // this.memberListSource.authMethod = this.sysPara.authMethodName;
            this.membersListService.updateMember(this.options.value).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    // this.btuDis = false;
                    this.snackBar.open(this.translate.instant('BonusPointUnion.saveSuccess'), '✖');  // 保存成功
                    document.getElementById('clear_btu').click();
                },
                error1 => { this.btuDis = false; }
            );
        }
    }


    reSnackBar(){
        if (this.options.value[this.MemberPra.memberName] === null ||  this.options.value[this.MemberPra.memberName] === ''){
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.memberNameNotNull'), '✖');
            return true;
        }
        if (this.options.value[this.MemberPra.url] === null ||  this.options.value[this.MemberPra.url] === ''){
            this.snackBar.open(this.translate.instant('BonusPointUnion.tips.urlDomainNameNotNull'), '✖');
            return true;
        }
       if (this.sysPara.authMethodName === this.translate.instant('BonusPointUnion.MembersList.notAuthMethod')) { // 免认证
           if (this.options.value[this.MemberPra.username] === null || this.options.value[this.MemberPra.username]  === '') {
               // 用户名 不能为空
               this.snackBar.open(this.translate.instant('BonusPointUnion.tips.usernameNotNull'), '✖');
               return true;
           }
           if ( this.options.value[this.MemberPra.password] === null   || this.options.value[this.MemberPra.password]  === '' ) {
               //  密码不能为空
               this.snackBar.open(this.translate.instant('BonusPointUnion.tips.pwdNotNull'), '✖');
               return true;
           }
           const p_value = this.options.value[this.MemberPra.password];
           if (p_value.length <= 5) {
               // 密码必须在6位数以及以上
               this.snackBar.open(this.translate.instant('BonusPointUnion.tips.pwdThenSix'), '✖');
               return true;
           }
       } else {
           if (this.options.value[this.MemberPra.appID] === null || this.options.value[this.MemberPra.appID] === '' ) {
               // appID 不能为空
               this.snackBar.open(this.translate.instant('BonusPointUnion.tips.APPIDNotNull'), '✖');
               return true;
           }
           if ( this.options.value[this.MemberPra.appSecret] === null ||  this.options.value[this.MemberPra.appSecret] === '') {
               this.snackBar.open(this.translate.instant('BonusPointUnion.tips.AppSecretNotNull'), '✖');
               return true;
           }
       }
       return false;
   }


    changeEditSave(){
        console.log(this.sysPara.authMethodName , '...this.sysPara.authMethodName');

        this.sysPara.EditStruts = true;
        this.options.enable();
        // this.sysPara.selectAuthMethodStruts = true;
        // this.sysPara.EditStruts = true;
        // this.sysPara.authMethodName =  CouponParameter.OAUTH2;
    }

    selectAuthMethodChange(){
        if (this.sysPara.authMethodName === this.translate.instant('BonusPointUnion.MembersList.notAuthMethod')){
            this.sysPara.selectAuthMethodStruts = false;
        } else {
            this.sysPara.selectAuthMethodStruts = true;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}


export class MemberEntity {
    id = 'id';
    memberName = 'memberName';
    authMethod = 'authMethod';
    url = 'url';
    username = 'username';
    password = 'password';
    appID = 'appID';
    appSecret = 'appSecret';
    enabled = 'enabled';
    createdBy = 'createdBy';
    createdDate = 'createdDate';
    lastModifiedBy = 'lastModifiedBy';
    lastModifiedDate = 'lastModifiedDate';
}