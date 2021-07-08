import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {DomSanitizer} from '@angular/platform-browser';
import {NotifyAsynService} from '../../../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../../../services/utils';
import {ActivatedRoute, Router} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {CouponManageService} from '../../coupon-manage.service';
import {fuseAnimations} from '../../../../../../../@fuse/animations';

@Component({
    selector: 'app-activity-review-detail',
    templateUrl: './activity-review-detail.component.html',
    styleUrls: ['./activity-review-detail.component.scss'],
    animations: fuseAnimations
})
export class ActivityReviewDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll = new Subject();
    canSave = true;
    activityForm: FormGroup;
    storeForm: FormGroup;
    configurationTypeList = [];
    configPreheatTime: any; // 时间
    configStartTime: any;
    configEndTime: any;
    uploadFile = new UploadFile(); // 上传图片
    previewData: any;  // 预览
    // 选择优惠券
    currentRule = [];
    canEdit = false;
    levelSource = [];
    // 选择商场限制
    mallSource = [];
    mallShow = [];

    reasonAdjust = '';
    flag: boolean;
    id = 0;

    constructor(
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private notify: NotifyAsynService,
        private translate: TranslateService,
        private utils: Utils,
        private router: Router,
        public activatedRoute: ActivatedRoute,
        private newDateTransformPipe: NewDateTransformPipe,
        private couponManageService: CouponManageService
    ) {
        this.activityForm = new FormGroup({
            id: new FormControl({value: '', disabled: true}),
            name: new FormControl('', Validators.required),
            enabled: new FormControl({value: false, disabled: true}),
            type: new FormControl('', Validators.required),
            preheatTime: new FormControl('', Validators.required),
            beginTime: new FormControl('', Validators.required),
            endTime: new FormControl('', Validators.required),
            // 选择弹框部分
            pic: new FormControl('', Validators.required),
            level: new FormControl('', Validators.required),
            mall: new FormControl('', Validators.required),
            maxJoin: new FormControl(1, Validators.required),
            maxJoinDaily: new FormControl(1, Validators.required),
            limitUse: new FormControl({value: 1, disabled: true}),

            // 额外参数，用于商户端活动
            extParams: new FormGroup({
                // maxQuantity: new FormControl(''),
                maxQuantity: new FormControl(''),
                beginTime: new FormControl(''),
                endTime: new FormControl(''),
                totalPoint: new FormControl('')
            }),
            // 优惠券
            price: new FormControl(0), // 隐藏
            canRefund: new FormControl(true), // 隐藏
            refundTime: new FormControl(1), // 隐藏
            couponNumbers: new FormControl([], Validators.required),
            // 收费标准
            ruleText: new FormControl('', Validators.required),
        });

        this.activityForm.get('extParams').get('maxQuantity').valueChanges.subscribe(res => {
            this.utils.transformToNumberWithControl(res, this.activityForm.get('extParams').get('maxQuantity'), 0, 999999999);
        });

        this.storeForm = new FormGroup({
            imgId: new FormControl(''),
            storeId: new FormControl(''),
            storeName: new FormControl(''),
            quantity: new FormControl(0),
            residueAmount: new FormControl(0)
        });
    }

    ngOnInit() {
        this.getTypeList();
        this.initTimeConfig();
        this.getDetailInfo();
    }

    /******************** 获取页面属性及基础信息 ******************/
    // 获取套餐类型列表
    getTypeList() {
        this.couponManageService.toGetActivityTypeList().subscribe(res => {
            if (res) {
                this.configurationTypeList = res;
            } else {
                this.configurationTypeList = [];
            }
        });
    }

    // 获取详情页信息
    getDetailInfo() {
        this.activatedRoute.queryParams.subscribe(p => {
            const id = p.id;
            this.id = p.id;
            this.couponManageService.toGetActivityDetailById(id).subscribe(res => {
                if (res['coupons'] && res['coupons'].length !== 0){
                    // this.currentRule = res['coupons'][0];
                    this.currentRule = res['coupons'];
                    this.currentRule.forEach(item => {
                        item['validity'] = this.newDateTransformPipe.transform(item['beginTime']) + ' - ' +
                            this.newDateTransformPipe.transform(item['endTime']);
                    });
                } else {
                    this.currentRule = [];
                }
                this.initPageContent(res);
            });
        });
    }

    initPageContent(res) {
        const pic_ = res['pic'] ? (res['pic'][0] ? res['pic'][0] : '') : '';
        this.activityForm.patchValue({
            id: res['id'],
            name: res['name'],
            enabled: res['enabled'],
            type: res['type'],
            preheatTime: res['preheatTime'],
            beginTime: res['beginTime'],
            endTime: res['endTime'],
            extParams: res['extParams'],
            // 选择弹框部分
            pic: pic_,
            level: res['level'],
            mall: res['mall'],
            // 优惠券
            price: res['price'],
            canRefund: res['canRefund'],
            refundTime: res['refundTime'],
            // couponNumbers: res['coupons'].length !== 0 ? res['coupons'][0]['id'] : null,
            couponNumbers: res['coupons'].map(item => item['number']),
            // 收费标准
            ruleText: res['ruleText'],
            maxJoin: res['maxJoin'],
            maxJoinDaily: res['maxJoinDaily'],
        });
        if (this.activityForm.get('type').value === 'STORE' && res['extParams']){
            let residueAmount = 0;
            if (res['extParams'] && res['extParams'].quantity && res['extParams'].joinedCount) {
                residueAmount = Number(res['extParams'].quantity) - Number(res['extParams'].joinedCount);
            } else {
                residueAmount = Number(res['extParams'].quantity);
            }
            this.storeForm.patchValue({
                imgId: '',
                storeId: res['extParams']['StoreLimit'],
                storeName: res['extParams']['StoreLimit'],
                quantity: res['extParams']['quantity'],
                residueAmount: residueAmount
            });
            this.getStoreImg(res['extParams']['FromId']);
        }
        this.storeForm.disable();
        this.activityForm.get('id').patchValue(res['id']);
        setTimeout(() => {
            if (this.activityForm.get('type').value === 'STORESIGNUP'){
                this.activityForm.get('extParams').get('beginTime').setValue(this.stringDataToUTC(res['extParams']['beginTime']));
                this.activityForm.get('extParams').get('endTime').setValue(this.stringDataToUTC(res['extParams']['endTime']));
            }
        }, 20);

        this.activityForm.get('extParams').get('totalPoint').setValue(res['extParams']['totalPoint']);
        if (pic_) {
            this.uploadFile.previewImgStatus = true;
            this.uploadFile.umgUploadSuccessId = pic_;
        }
        this.activityForm.disable();
        this.activityForm.get('level').enable();
        this.activityForm.get('mall').enable();
        this.canEdit = true;
        this.toGetLevelList(res['level']);
        this.getMallList(res['mall']);
    }

    getStoreImg(id){
        // this.couponManageService.previewFile(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        //     const fileReader = new FileReader();
        //     fileReader.readAsDataURL(res);
        //     fileReader.onloadend = (res1) => {
        //         const result = res1.target['result'];
        //         // this.uploadFile.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
        //         this.storeForm.patchValue({
        //             imgId: this.sanitizer.bypassSecurityTrustUrl(result)
        //         });
        //     };
        // });
    }

    // 将字符串时间格式转化为UTC
    stringDataToUTC(value){
        if (value !== '' && value !== null) {
            const d = value as string;
            const y = d.substring(0, 4),
                m = d.substring(4, 6),
                day = d.substring(6, 8),
                hh = d.substring(8, 10),
                mm = d.substring(10, 12),
                ss = d.substring(12, 14);
            const date = y + '.' + m + '.' + day + ' ' + hh + ':' + mm + ':' + ss;
            return new Date(date).toISOString();
        }
    }

    goBack() {
        this.router.navigate(['apps/activityReview']);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /***********日期选择**********/
    initTimeConfig() {
        this.configPreheatTime = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
        this.configStartTime = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
        this.configEndTime = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '23',
            defaultMinute: '59',
            defaultSeconds: '59'
        };
    }

    onSourceDate(e, endTime, startTime, p) {
        if (p === 'startTime') {
            e.setHours(23);
            e.setMinutes(59);
            e.setSeconds(59);
        }
        'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
    }

    /******活动图片******/
    // 打开预览的文件框
    openPreviewDilog(previewImgDloag) {
        if (this.uploadFile.umgUploadSuccessId) {
            this.uploadFile.imgPreLoading = true;
            if (!this.dialog.getDialogById('previewImageDialog_')) {
                this.dialog.open(previewImgDloag, {
                    id: 'previewImageDialog_',
                    width: '690px',
                    height: '300px',
                    position: {top: '200px'},
                    hasBackdrop: true,
                });
            }
            this.couponManageService.previewFile(this.uploadFile.umgUploadSuccessId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(res);
                fileReader.onloadend = (res1) => {
                    const result = res1.target['result'];
                    this.uploadFile.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                    this.uploadFile.imgPreLoading = false;
                };
            });
        }
    }

    /******商场限制******/
    getMallList(data) {
        this.couponManageService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            this.mallSource = [];
            this.mallShow = [];
            if (res['content']) {
                if (data[0] === '__ALL__') {
                    this.mallSource = res['content'];
                    this.mallShow.push('__ALL__');
                } else {
                    res['content'].forEach(item => {
                        if (data.includes(item.mallId + '')) {
                            this.mallSource.push(item);
                            this.mallShow.push(item['mallName']);
                        }
                    });
                }
            }
        });
    }

    /********** 会员限制 **********/
    // 获取会员列表
    toGetLevelList(data) {
        // this.couponManageService.searchMemberCardList().subscribe(res => {
        //     this.levelSource = [];
        //     if (res.body) {
        //         if (data[0] === '__ALL__') {
        //             this.levelSource.push('__ALL__');
        //         } else {
        //             res.body.forEach(item => {
        //                 if (data.includes(item.id + '')) {
        //                     this.levelSource.push(item['levelName']);
        //                 }
        //             });
        //         }
        //     }
        // });
    }

    // 预览事件
    openPreData(PreDetailTe, data, flag) {
        this.previewData = '';
        if (flag === 'level') {
            if (this.activityForm.value['level'][0] === '__ALL__') {
                this.previewData = '默认对所有会员等级开放，没有限制';
            } else {
                this.previewData = this.levelSource.join().replace(/,/g, '\n\n');
            }
        } else if (flag === 'mall') {
            if (this.activityForm.value['mall'][0] === '__ALL__') {
                this.previewData = '默认对所有商场开放，没有限制';
            } else {
                this.previewData = this.mallSource.map(item => item['mallName']).join().replace(/,/g, '\n\n');
            }
        }
        if (!this.dialog.getDialogById('PreDetailTeClass')) {
            this.dialog.open(PreDetailTe, {id: 'PreDetailTeClass', width: '600px', height: '550px', hasBackdrop: true});
        }
    }

    // 通过/驳回
    openAdjustDialog(passDialog, flag) {
        this.flag = flag;
        this.dialog.open(passDialog, {id: 'frozenTips', width: '450px', disableClose: true}).afterOpened().subscribe(ref => {});
    }

    toSure(){
        this.snackBar.open('待开发！', '✖');
        return;
        if (!this.flag && !this.reasonAdjust){
            this.snackBar.open('请输入您的意见！');
        } else {
            const data = {
                'accept': this.flag,
                'rejectReason': this.reasonAdjust
            };
            this.couponManageService.toPassOrRejectActivity(this.id, data).subscribe(res => {
                if (this.flag){
                    this.snackBar.open('已通过！', '✖');
                } else {
                    this.snackBar.open('已驳回！', '✖');
                }
                this.dialog.closeAll();
                this.router.navigate(['apps/activityList']);
            });
        }
    }
}

export class UploadFile {
    previewImgStatus = false; // 图片预览的状态
    progressLoad: number;  // 上传长度
    imgName: string; // 图片名称
    uploading = false; // 是否在上传 在上传则显示进度条
    fileData: any; // 图片数据
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    imgSrc = null; // 预览图片路径
    imgPreLoading = false; // 加载条
    umgUploadSuccessId: string; // 图片上传成功返回id
}
