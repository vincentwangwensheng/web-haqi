import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {HttpClient} from '@angular/common/http';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';
import {DomSanitizer} from '@angular/platform-browser';
import {OpenCenterService} from '../../openCenterService/open-center.service';
import {CurrencyPipe} from '@angular/common';
import {AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../@fuse/animations/index';

@Component({
    selector: 'app-developer-auth',
    templateUrl: './developer-auth.component.html',
    styleUrls: ['./developer-auth.component.scss'] ,
    animations: fuseAnimations
})
export class DeveloperAuthComponent implements OnInit , OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();

    title = '开发者认证';  // 标题

    authForm: any;

    butType = 'sum'; //  按钮类型  sum --> 提交  auth---> 已认证 wait --> 等待审核

    cardType = [] ; // 证件类型

    licenseImageFormData: any;

    imgSrc: any;

    imgLoading = false; // 图片上传加载条

    authDetailType = '';

    suthUsername = ''; // 审核的用户登陆名

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
        this.authForm = new FormBuilder().group({
            companyName: new FormControl({value: '', disabled: false}, [companyNameValidator(null , '企业名称为必填项' , '个数在5-32之间')]),  // 公司名称
            name: new FormControl({value: '', disabled: false}, [Validators.required]),  // 申请人姓名
            email: new FormControl({value: '', disabled: false},
                [emailValidator(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/ , '邮箱为必填项' , '需填写正确的邮箱格式')]),  // 邮箱
            licenseType: new FormControl({value: '营业执照', disabled: true}, [Validators.required]),  // 证件类型
            licenseId: new FormControl({value: '', disabled: false},
                [licenseIDValidator(null , '营业执照号为必填项', '请输入正确的营业执照号码')]),  // 营业执照号
            licenseImageId: new FormControl({value: '', disabled: false}, [Validators.required]),  // 营业执照图片


        });
    }

    ngOnInit() {
        this.imgSrc = 'no';
        this.cardType = [
            {id: '营业执照' , value: '营业执照'}
        ];
        this.getAuthType();
    }





    getAuthType(){
        this.routeInfo.data.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            data => {
                const type = data.operation;
                this.authDetailType = type;
                if (type === 'Auth') {
                    // 默认进入认证页面
                    this.title = '开发者认证';
                    this.attestDetail();
                } else if (type === 'developerListEdit') {
                    // 进入开发者列表详情
                    this.title = '开发者详情';
                    this.getDetail(type);
                } else if (type === 'examine'){
                    // 审核列表详情
                    this.title = '审核详情';
                    this.getDetail(type);
                }

            }
        );
    }

    // 拿到详情
    getDetail(type){
        this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (param: Params)  => {
                const auth = param.id;
                const auth_arr = auth.split('&');
                this.setValue(auth_arr);
                this.authForm.disable();
            }
        );
    }

    // 赋值
    setValue(auth_arr){
        let reviewStatus = '';
        let reviewResult = '';
        for (let i = 0 ; i < auth_arr.length ; i++) {
            if (i === 0 ) {
                this.authForm.get('companyName').patchValue(auth_arr[i]);
            }
            if ( i === 1 ) {
                this.authForm.get('licenseId').patchValue(auth_arr[i]);
            }
            if ( i === 2 ) {
                this.authForm.get('licenseImageId').patchValue(auth_arr[i]);
                this.preImg(auth_arr[i]);
            }
            if ( i === 3 ) {
                this.authForm.get('email').patchValue(auth_arr[i]);
            }
            if ( i === 4 ) {
                this.authForm.get('name').patchValue(auth_arr[i]);
            }
            if ( i === 5 ){
                this.suthUsername = auth_arr[i];
            }
            if ( i === 6 ){
                reviewStatus = auth_arr[i];
            }
            if ( i === 7 ){
                reviewResult = auth_arr[i];
                if (reviewStatus === 'false') {
                    // 待审核
                    this.butType = 'wait';
                } else {
                    if ( reviewResult === 'CERTIFIED') {
                        // 已认证
                        this.butType = 'auth';
                    } else if ( reviewResult === 'REJECTED') {
                        // 审核未通过  已驳回
                        this.butType = 'sum';
                    }
                }

            }
        }
    }

    // 申请提交
    appSubmit(){
        const auuth_vm = this.authForm.getRawValue();
        const ve = this.setVerification(auuth_vm);
        if (ve) {
            return;
        }
        this.openCenterService.attest(this.authForm.getRawValue()).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.snackBar.open('提交申请成功，请耐心等待审核！！', '✖');
            this.butType = 'wait';
            this.authForm.disable();
        });

    }

   // 验证
    setVerification(auuth_vm){
        if (!auuth_vm.companyName){
            this.snackBar.open('企业名称为必填项', '✖');
            return true;
        } else {
            const le = (auuth_vm.companyName).length;
            if ( 5 < le && le < 32){

            } else {
                this.snackBar.open('个数必须在5和32之间', '✖');

            }
        }

        if (!auuth_vm.name){
            this.snackBar.open('申请人姓名为必填项', '✖');
            return true;
        }

        if (!auuth_vm.email){
            this.snackBar.open('邮箱为必填项', '✖');
            return true;
        } else {
            const mailChin = this.VerEmail(auuth_vm.email);
            if (mailChin) {
                this.snackBar.open('邮箱格式不正确', '✖');
                return true;
            }
        }

        if (!auuth_vm.licenseId){
            this.snackBar.open('营业执照号为必填项', '✖');
            return true;
        } else {

            const len = (auuth_vm.licenseId).length;
            if (len !== 15 && len !== 18){
                this.snackBar.open('营业执照号为15位或者18位，请输入正确', '✖');
                return true;
            }
        }

        if (!auuth_vm.licenseImageId){
            this.snackBar.open('必须上传营业执照照片', '✖');
            return true;
        }

        return false;
    }


    // 当前申请
    attestDetail(){
        this.openCenterService.attestDetail().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.authForm.patchValue(res);
                if (!res.reviewStatus) {
                    this.authForm.disable();
                    this.butType = 'wait';
                } else {
                    if (res.reviewResult) {
                        this.authForm.disable();
                        this.butType = 'auth';
                    } else {
                        this.snackBar.open('审核未通过，请重新提交信息！！！', '✖');
                        this.butType = 'sum';
                    }
                }
                this.preImg(res.licenseImageId);
                this.imgLoading = true;
            },
            error1 => {
                this.snackBar.open('还未进行认证喔~', '✖');
                this.butType = 'sum';
            });
    }


    // 上传接口
    realUpload(e) {

        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open(this.translate.instant('brand.tips3'), '✖'); //  上传文件大小不能超过1M
            return;
        }
        const imgType = 'image/jpg,image/png,image/gif,image/jpeg';
        const type = file.type;
        if (!imgType.includes(type)) {
            this.snackBar.open('请上传图片', '✖');
            return;
        }
        this.licenseImageFormData = new FormData();
        this.licenseImageFormData.append('files', file);
        this.imgLoading = true;
        this.openCenterService.FileUpload(this.licenseImageFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
            const saveID = res;
            if (saveID) {
                this.authForm.get('licenseImageId').patchValue(saveID);
                this.preImg(saveID);
            }
        }, error1 => {    this.imgLoading = false; });
    }

    // 上传图片显示
    preImg(saveID){
        this.openCenterService.previewFile(saveID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            rest => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(rest);
                fileReader.onloadend = (res1) => {
                    const result = res1.target['result'];
                    this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                    this.imgLoading = false;
                };
            },
            error1 => {
                this.imgLoading = false;
            });
    }


    // 验证邮箱
    VerEmail(val){
        const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,6})$/;
        if (!reg.test(val)) {
            return true;
        }
        return false;
    }

    // 营业执照号验证
    verCode(code){
        let tip = 'OK';
        let pass = true;

        if (code.length !== 18){
            tip = '社会信用代码长度错误！';
            pass = false;
        }
        const reg = /^([159Y]{1})([1239]{1})([0-9]{6})([0-9ABCDEFGHJKLMNPQRTUWXY]{9})([0-9ABCDEFGHJKLMNPQRTUWXY]{1})$/;
        if (!reg.test(code)){
            tip = '社会信用代码校验错误！';
            pass = false;
        }
        // 不用I、O、S、V、Z
        const str = '0123456789ABCDEFGHJKLMNPQRTUWXY';
        const ws = [ 1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];

        const codes  = [];
        let sum = 0;
        codes[0] = code.substr(0, code.length - 1 );
        codes[1] = code.substr(code.length - 1, code.length);

        for ( let i = 0; i < codes[0].length; i++){
            const Ancode = codes[0].charAt(i);
            const Ancodevalue = str.indexOf(Ancode);
            sum += Ancodevalue * ws[i];
        }
        const indexOfc18 = 31 - (sum % 31);
        const c18 = str.charAt(indexOfc18);
        if ( c18 !== codes[1]){
            tip = '社会信用代码有误！';
            pass = false;
        }

        return pass;
    }

    // 审核
    ToExamine(p) {
        let examine = {};
        if (p === 'pass') {
            // 通过
             examine = {
                 accept: true,
                 rejectReason: '',
                 username: this.suthUsername
            };
        } else {
            // 驳回
            examine = {
                accept: false,
                rejectReason: '',
                username: this.suthUsername
            };
        }
        this.openCenterService.Examine(examine).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.snackBar.open('审核成功', '✖');
            history.back();
        });
    }

    // 放大图片。先设置一个弹框类似的放大。后期可整改
    openBigImg(bigImg){
        if (!this.dialog.getDialogById('bigImgClass')) {
            this.dialog.open(bigImg, {id: 'bigImgClass', width: '480px', height: '680px'});
        }
    }

    toReturn(){
        history.back();
    }

    // 是否有认证请求
    attestExist(){
        this.openCenterService.attestExist().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                console.log(res.exist , '----res');
            }
        );
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}


export function companyNameValidator(nameRe: RegExp, tips15, tips17): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            const er_ = {forbiddenCh: tips15, forbiddenChNo: true, required: true}; //  此项必填
            return er_;
        }
        const forbidden = (control.value).length >= 5 && (control.value).length <= 32 ;
        const err_ = forbidden === false ? {forbiddenCh: tips17, forbiddenChNo: true, required: true} : null; //
        return err_;
    };
}


export function emailValidator(nameRe: RegExp, tips15, tips17): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            const er_ = {forbiddenCh: tips15, forbiddenChNo: true, required: true}; //  此项必填
            return er_;
        }
        const forbidden = nameRe.test(control.value);
        const err_ = forbidden === false ? {forbiddenCh: tips17, forbiddenChNo: true, required: true} : null; //
        return err_;
    };
}

export function licenseIDValidator(nameRe: RegExp, tips15, tips17): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            const er_ = {forbiddenCh: tips15, forbiddenChNo: true, required: true}; //  此项必填
            return er_;
        }
        let forbidden = false;
        if ((control.value).length === 15 || (control.value).length === 18){
            forbidden = true;
        }
        const err_ = forbidden === false ? {forbiddenCh: tips17, forbiddenChNo: true, required: true} : null; //
        return err_;
    };
}