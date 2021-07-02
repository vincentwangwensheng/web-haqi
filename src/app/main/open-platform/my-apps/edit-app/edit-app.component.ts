import {AfterContentInit, AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {CurrencyPipe} from '@angular/common';
import {MatDialog, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer} from '@angular/platform-browser';
import {Utils} from '../../../../services/utils';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateService} from '@ngx-translate/core';
import {OpenCenterService} from '../../openCenterService/open-center.service';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../@fuse/animations/index';

@Component({
    selector: 'app-edit-app',
    templateUrl: './edit-app.component.html',
    styleUrls: ['./edit-app.component.scss'],
    animations: fuseAnimations
})
export class EditAppComponent implements OnInit, OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('expiredTime', {static: true}) expiredTime: ElementRef;

    title = '新建应用';  // 标题

    btuDis = false;  // 设置提交按钮置灰

    ADD_DE_AUTH = 'ADD'; // 'ADD'--->添加  'DETAIL' --->列表详情  'EDIT'---> '我的申请详情' ,  'notAuth' --> 未认证

    ADD_DETAIL_AUTH = 'add'; // 'AUDIT'--->待审核  'REJECTED'-->已驳回  CERTIFIED1-->已激活

    modifyA = false;

    editAppForm: any;  // 表单

    appType = []; // 应用类型

    appInterface = []; // 应用接口

    configExpiredTime: any;

    checkboxDis = false; // 选择接口的要灰掉

    Tocken = '';

    tokenDetail = '';

    appUsername = ''; // 用户名

    constructor(
        private routeInfo: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        public dialog: MatDialog,
        private utils: Utils,
        private translate: TranslateService,
        private dateTransform: NewDateTransformPipe,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private loading: FuseProgressBarService,
        private openCenterService: OpenCenterService,
        private currency: CurrencyPipe
    ) {
        this.editAppForm = new FormBuilder().group({
            type: new FormControl({value: '1', disabled: false}, [Validators.required]),  // 评论编号
            expiredTime: new FormControl({value: '', disabled: false}, [Validators.required]), // 过期时间
        });
    }

    ngOnInit() {
        this.setAppType();
        this.initTimeConfig();

      //  this.attestExist();
      //  this.openapiToken();
    }


    // 当前申请
    openapiDetail(){
        this.openCenterService.openapiDetail().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.ADD_DE_AUTH = 'EDIT';
                this.Tocken = res['tokenSN'];
                const time = this.dateTransform.transform(res['tokenExpiredTime']);
                this.editAppForm.get('expiredTime').patchValue(time);
                this.appUsername = res['username'];
                const inf = res['api'];
                this.InterfaceOpenApi('detail', inf);
                const    reviewStatus =   res['reviewStatus'];
                const    reviewResult =   res['reviewResult'];
                if (reviewStatus === false) {
                    // 待审核
                    this.checkboxDis = true;
                    this.editAppForm.disable();
                    this.ADD_DETAIL_AUTH = 'AUDIT';
                } else {
                    if ( reviewResult === true) {
                        // 已激活
                        this.openapiToken();
                        this.checkboxDis = true;
                        this.editAppForm.disable();
                        this.ADD_DETAIL_AUTH = 'CERTIFIED1';
                    } else if ( reviewResult === false) {
                        // 审核未通过  已驳回
                        this.ADD_DETAIL_AUTH = 'REJECTED';
                        this.snackBar.open('申请被驳回了，请重新提交~', '✖');
                    }
                }

            },
            error1 => {
                this.ADD_DE_AUTH = 'ADD';
                this.InterfaceOpenApi('add' , null);
                this.snackBar.open('您还没有申请过~', '✖');
            }
        );
    }


    // 拿到类型
    setAppType() {
        this.routeInfo.data.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
            const type = data.operation;
            if (type === 'ADD') {
                this.createApp();
                this.checkboxDis = false;
            } else if (type === 'EDIT' || type === 'recycleBinEDIT') {
                this.checkboxDis = true;
                this.getAppID(type);
            }
        });
    }


    // 新建应用
    createApp() {
        this.title = '我的应用';
        this.ADD_DE_AUTH = 'ADD';
        this.attestDetail('add' , 'add');
    }

    // 拿到详情
    getAppID(type) {
        this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (param: Params) => {
                const detail  = param.id;
                this.setAppDetail(detail);
                if (type === 'recycleBinEDIT') {
                    this.title = '详情'; // 回收站详情  审核列表
                } else {
                    this.title = '详情'; // 简单编辑
                }
            }
        );
    }


    setAppDetail(detail){
        const detail_arr = detail.split('&');
        let reviewStatus = '';
        let reviewResult = '';
        for (let i = 0 ; i < detail_arr.length ; i++) {
            if (i === 0 ) {
                this.Tocken = detail_arr[i];
            }
            if (i === 1 ) {
                const time = this.dateTransform.transform(detail_arr[i]);
                this.editAppForm.get('expiredTime').patchValue(time);
                this.editAppForm.disable();
            }
            if (i === 2 ) {
                const inf = detail_arr[i];
                const in_arr = inf.split(',');
                this.InterfaceOpenApi('edit' , in_arr);
            }
            if ( i === 3 ){
                reviewStatus = detail_arr[i];
            }
            if ( i === 4 ){
                reviewResult = detail_arr[i];
                if (reviewStatus === 'false') {
                    // 待审核
                    this.ADD_DETAIL_AUTH = 'AUDIT';
                } else {
                    if ( reviewResult === 'CERTIFIED1') {
                        // 已激活
                        this.ADD_DETAIL_AUTH = 'CERTIFIED1';
                        this.openapiToken();
                    } else if ( reviewResult === 'REJECTED') {
                        // 审核未通过  已驳回
                        this.ADD_DETAIL_AUTH = 'REJECTED';
                    }
                }
              //  this.attestDetail( 'DETAIL', null);
                this.ADD_DE_AUTH = 'DETAIL';
            }
            if ( i === 5 ) {
                this.appUsername =  detail_arr[i];
            }
        }
    }


    // 拿到tocken
    openapiToken(){
        this.openCenterService.openapiToken().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
              this.tokenDetail = 'Bearer ' + res.token;
            }
        );
    }



    // 获取有无认证信息
    attestDetail(type , p) {
        this.openCenterService.attestDetail().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.ADD_DE_AUTH = type;
                if (p === 'add') {
                    this.openapiDetail();
                }
            },
            error1 => {
                this.snackBar.open('通过认证后才能申请~', '✖');
                this.ADD_DE_AUTH = 'notAuth';
            });
    }


    // 接口事件
    appInterChange(e, d) {
        d.checked = e.checked;
    }

    // 拿到接口列表
    InterfaceOpenApi(p , arr) {
        this.openCenterService.InterfaceOpenApi().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                let checked = true;
                if (p === 'add') {
                    checked = true;
                } else {
                    checked = false;
                }
                for (let i = 0; i < res.length; i++) {
                    this.appInterface.push({checked: checked, value: res[i].name, key: res[i].key});
                }
                if (arr) {
                    for (let r = 0 ; r < arr.length ; r ++) {
                        this.appInterface.forEach(
                            d => {
                                if (arr[r] === d.key) {
                                    d.checked = true;
                                }
                            }
                        );
                    }
                }
            }
        );
    }

    // 提交接口申请
    openapiSubmit() {
        const appIn = [];
        this.appInterface.forEach(d => {
            if (d.checked) {
                appIn.push(d.key);
            }
        });
        const time = this.editAppForm.get('expiredTime').value;
        if (!time) {
            this.snackBar.open('过期时间必选', '✖');
            return;
        } else {
            if (new Date(time).getTime() < new Date().getTime()) {
                this.snackBar.open('过期时间需大于当前时间', '✖');
                return;
            }
        }
        const submitVM = {
            apiList: appIn,
            expiredTime: new Date(time).toISOString()
        };
      //  this.openapiToken();
        this.openCenterService.openapiSubmit(submitVM).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.checkboxDis = true;
                this.editAppForm.disable();
                this.ADD_DETAIL_AUTH = 'AUDIT';
                this.snackBar.open('提交申请成功，请等待审核~', '✖');
            }
        );
    }

    // 修改申请
    modifyApp(){
        this.checkboxDis = false;
        this.modifyA = true;
        this.editAppForm.enable();
        this.ADD_DETAIL_AUTH = 'add';
    }

    // 取消重新申请
    cancelModify(){
        this.checkboxDis = true;
        this.modifyA = false;
        this.editAppForm.disable();
        this.ADD_DETAIL_AUTH = 'CERTIFIED1';
    }

    // 审核
    ToExamine(p){
        let examine = {};
        if (p === 'pass') {
            // 通过
            examine = {
                accept: true,
                rejectReason: '',
                username: this.appUsername
            };

        } else {
            // 驳回
            examine = {
                accept: false,
                rejectReason: '',
                username: this.appUsername
            };
        }

        this.openCenterService.openapiExamine(examine).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.openapiToken();
            this.snackBar.open('审核成功', '✖');
            history.back();
        });
}

    onSourceDate(Time) {
        const thisDate = new Date(); // 开始领取时间
        Time.picker.set('minDate', thisDate);
    }

    // 去认证
    toAuth() {
        this.router.navigate(['/open/developerAuth']).then(res => {
            this.loading.hide();
        });
    }

    initTimeConfig() {
        this.configExpiredTime = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
    }

    IsNull(para) {
        if (para !== undefined && para !== 'undefined' && para !== '' && para !== 'null' && para !== null) {
            return true;
        } else {
            return false;
        }
    }

    goBack() {
        history.back();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    initSelectPra() {
        this.appType = [
            {id: '1', value: 'IOS'},
            {id: '2', value: '微信小程序'},
            {id: '3', value: 'Android'},
            {id: '4', value: '网页端'},
            {id: '5', value: '服务端'},
        ];
    }
}
