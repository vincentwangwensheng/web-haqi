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
import {DatePipe} from '@angular/common';

@Component({
    selector: 'app-activity-list-detail',
    templateUrl: './activity-list-detail.component.html',
    styleUrls: ['./activity-list-detail.component.scss'],
    animations: fuseAnimations
})
export class ActivityListDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll = new Subject();
    title: any;
    operation = '';
    canSave = true;
    detailInfo = null;
    activityForm: FormGroup;
    storeForm: FormGroup;
    configurationTypeList = [];
    configPreheatTime: any; // 时间
    configStartTime: any;
    configEndTime: any;
    uploadFile = new UploadFile(); // 上传图片
    enabledInit = false;
    // 会员限制
    levelSource = [];
    levelShow = [];
    levelSourceLength = 0;
    previewData: any;  // 预览
    // 选择汽车类型
    mallSource = [];
    mallShow = [];
    mallSourceLength = 0;

    // 选择优惠券
    selectedRule = [];
    currentRule = [];
    canEdit = false;

    // 选择活动模板
    selectActivity: any;
    currentActivity: any;

    constructor(
        private dialog: MatDialog,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private notify: NotifyAsynService,
        private translate: TranslateService,
        private utils: Utils,
        public datePipe: DatePipe,
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
            // 额外参数，用于商户端活动
            extParams: new FormGroup({
                // maxQuantity: new FormControl(''),
                maxQuantity: new FormControl(''),
                beginTime: new FormControl(''),
                endTime: new FormControl(''),
                totalPoint: new FormControl('')
            }),
            // 选择弹框部分
            pic: new FormControl('', Validators.required),
            level: new FormControl('', Validators.required),
            mall: new FormControl('', Validators.required),
            maxJoin: new FormControl(1, Validators.required),
            maxJoinDaily: new FormControl(1, Validators.required),
            // 优惠券
            price: new FormControl(0, Validators.required),
            canRefund: new FormControl(true, Validators.required),
            refundTime: new FormControl(1, Validators.required),
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
        this.initTimeConfig();
        this.getPageInfo();
    }

    /******************** 获取页面属性及基础信息 ******************/
    // 获取套餐类型列表
    getTypeList(flag) {
        this.couponManageService.toGetActivityTypeList().subscribe(res => {
            if (res) {
                if (flag === 'detail'){ // 商户活动不能新增，但是能显示
                    this.configurationTypeList = res;
                } else {
                    this.configurationTypeList = res.filter(item => {
                        return item['id'] !== 'STORE';
                    });
                }
            } else {
                this.configurationTypeList = [];
            }
        });
    }

    getOperation() {
        return new Promise((resolve) => {
            this.activatedRoute.data.pipe(takeUntil(this._unsubscribeAll)).subscribe(p => {
                this.operation = p.operation;
                resolve(p.operation);
            });
        });
    }

    getPageInfo() {
        this.title = new Map([
            ['create', '新建活动'],
            ['detail', '活动详情'],
            ['edit', '活动编辑'],
        ]);
        this.getOperation().then(res => {
            this.getTypeList(res);
            if (res === 'detail') {
                this.getDetailInfo();
            } else if (res === 'create') {
                const configurationData = sessionStorage.getItem('activity');
                if (configurationData) {
                    this.initPageContent(JSON.parse(configurationData));
                    sessionStorage.removeItem('activity');
                } else {
                    this.toGetLevelList(); // 获取levelSourceLength，以便于选择会员时做所有判断
                    this.getMallType();
                }
                const activityDetailCouponDetail = sessionStorage.getItem('activityDetailCouponDetail');
                if (activityDetailCouponDetail) {
                    this.currentRule = JSON.parse(activityDetailCouponDetail);
                    sessionStorage.removeItem('activityDetailCouponDetail');
                }
            }
        });
    }

    // 获取详情页信息
    getDetailInfo() {
        this.activatedRoute.queryParams.subscribe(p => {
            const id = p.id;
            this.couponManageService.toGetActivityDetailById(id).subscribe(res => {
                this.detailInfo = res;
                if (res['coupons'] && res['coupons'].length !== 0){
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
        this.activityForm.patchValue({
            id: this.operation === 'detail' ? res['id'] : '',
            name: res['name'],
            enabled: res['enabled'],
            type: res['type'],
            preheatTime: res['preheatTime'],
            beginTime: res['beginTime'],
            endTime: res['endTime'],
            // 选择弹框部分
            pic: this.operation === 'detail' ? res['pic'][0] : res['pic'],
            level: res['level'],
            mall: res['mall'],
            extParams: res['extParams'],
            // 优惠券
            price: res['price'],
            canRefund: res['canRefund'],
            refundTime: res['refundTime'],
            // couponNumbers: this.operation === 'detail' ? (res['coupons'].length !== 0 ? res['coupons'][0]['id'] : []) : res['couponNumbers'],
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
            this.getStoreList();
        }
        this.storeForm.disable();
        setTimeout(() => {
            if (this.activityForm.get('type').value === 'STORESIGNUP'){
                this.activityForm.get('extParams').get('beginTime').setValue(this.stringDataToUTC(res['extParams']['beginTime']));
                this.activityForm.get('extParams').get('endTime').setValue(this.stringDataToUTC(res['extParams']['endTime']));
            }
        }, 20);
        this.activityForm.get('extParams').get('totalPoint').setValue(res['extParams']['totalPoint']);
        if (this.operation === 'detail' && res['pic'][0]) {
            this.uploadFile.previewImgStatus = true;
            this.uploadFile.umgUploadSuccessId = res['pic'][0];
            this.activityForm.disable();
            this.canEdit = true;
            this.enabledInit = res['enabled'];
        } else if (this.operation === 'create' && res['pic']) {
            this.uploadFile.previewImgStatus = true;
            this.uploadFile.umgUploadSuccessId = res['pic'];
        }
        this.toGetLevelList(res['level']);
        this.getMallType(res['mall']);
    }

    getStoreImg(id){
        this.couponManageService.previewFile(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(res);
            fileReader.onloadend = (res1) => {
                const result = res1.target['result'];
                this.storeForm.patchValue({
                    imgId: this.sanitizer.bypassSecurityTrustUrl(result)
                });
            };
        });
    }

    getStoreList() {
        this.couponManageService.searchStores(this.storeForm.value['storeId']).subscribe(res => {
            if (res['content'] && res['content'].length !== 0) {
                this.storeForm.get('storeName').setValue(res['content'][0]['storeName']);
            }
        });
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

    saveProject(closeOrderDialog) {
        this.activityForm.markAllAsTouched();
        if (this.activityForm.value['level'] === '' || this.activityForm.value['level'] === undefined) {
            this.snackBar.open('请选择会员等级！', '✖');
        } else if (this.activityForm.value['mall'] === '' || this.activityForm.value['mall'] === undefined || this.activityForm.value['mall'].length === 0) {
            this.snackBar.open('请选择商场限制！', '✖');
        } else if (this.activityForm.value['price'] === '') {
            this.snackBar.open('优惠券-价格不能为空！', '✖');
        } else if (this.activityForm.value['refundTime'] === '') {
            this.snackBar.open('优惠券-购买后时间不能为空！', '✖');
        } else if (this.activityForm.value['pic'] === '') {
            this.snackBar.open('活动图片未上传！', '✖');
        } else if (this.activityForm.value['couponNumbers'] === '') {
            this.snackBar.open('请选择优惠券信息！', '✖');
        } else if (this.activityForm.value['maxJoin'] === '') {
            this.snackBar.open('参加活动次数不能为空！', '✖');
        } else if (this.activityForm.value['maxJoinDaily'] === '') {
            this.snackBar.open('单日参加活动次数不能为空！', '✖');
        } else if (this.activityForm.get('type').value === 'REDEEM' && !this.activityForm.get('extParams').get('totalPoint').value) {
            this.snackBar.open('新建积分兑换活动需要给定兑换积分！', '✖');
        } else if (this.activityForm.get('type').value === 'STORESIGNUP' && !this.activityForm.get('extParams').get('maxQuantity').value
            && !this.activityForm.get('extParams').get('beginTime').value && !this.activityForm.get('extParams').get('endTime').value) {
            this.snackBar.open('新建商户报名活动需要选择开始结束时间以及发券数量！', '✖');
        } else if (this.activityForm.valid) {
            if (this.compareStartTimeAndEndTime(this.activityForm.value['endTime'], this.currentRule)) {
                this.dialog.open(closeOrderDialog, {id: 'frozenTips', width: '450px'}).afterOpened().subscribe(res => {
                });
            } else {
                this.toSaveProject();
            }
        } else {
            this.snackBar.open('还有未填项与校验不通过项！', '✖');
        }
    }

    toSureSaveProject() {
        this.dialog.closeAll();
        this.toSaveProject();
    }

    toSaveProject() {
        this.snackBar.open('待开发！', '✖');
        return;
        const data = {
            'beginTime': this.activityForm.value['beginTime'],
            'canRefund': this.activityForm.value['canRefund'],
            'couponNumbers': this.activityForm.value['couponNumbers'],
            'endTime': this.activityForm.value['endTime'],
            'level': this.activityForm.value['level'],
            'mall': this.activityForm.value['mall'],
            'name': this.activityForm.value['name'],
            'pic': [this.activityForm.value['pic']],
            'preheatTime': this.activityForm.value['preheatTime'],
            'price': this.activityForm.value['price'],
            'refundTime': this.activityForm.value['refundTime'],
            'remarks': '',
            'ruleText': this.activityForm.value['ruleText'],
            'maxJoin': this.activityForm.value['maxJoin'],
            'extParams': this.activityForm.get('extParams').value,
            'maxJoinDaily': this.activityForm.value['maxJoinDaily'],
            'type': this.activityForm.value['type'] // 更新接口这个字段没有
        };
        data['beginTime'] = new Date(data['beginTime']).toISOString();
        data['endTime'] = new Date(data['endTime']).toISOString();
        data['preheatTime'] = new Date(data['preheatTime']).toISOString();
        data['extParams']['beginTime'] = this.datePipe.transform(this.activityForm.get('extParams').get('beginTime').value, 'yyyyMMddHHmmSS');
        data['extParams']['endTime'] = this.datePipe.transform(this.activityForm.get('extParams').get('endTime').value, 'yyyyMMddHHmmSS');
        this.canSave = false;
        if (this.operation === 'create') {
            this.couponManageService.toCreateActivity(data).subscribe(res => {
                this.snackBar.open('新增成功！', '✖');
                this.canSave = true;
                this.router.navigate(['apps/activityReview']);
            }, error => {
                this.canSave = true;
            });
        } else if (this.operation === 'edit') {
            this.couponManageService.toUpdateActivityById(this.activityForm.get('id')['value'], data).subscribe(res => {
                this.snackBar.open('修改成功！', '✖');
                this.canSave = true;
                this.router.navigate(['apps/activityReview']);
            }, error => {
                this.canSave = true;
            });
        }
    }

    compareStartTimeAndEndTime(startTime, currentRule): boolean {
        let flag = false;
        if (currentRule.length !== 0){
            currentRule.forEach(item => {
                if (startTime && item['endTime']) {
                    const startTimeValue = Number(this.datePipe.transform(startTime, 'yyyyMMddHHmmss'));
                    const endTimeValue = Number(this.datePipe.transform(item['endTime'], 'yyyyMMddHHmmss'));
                    if (endTimeValue < startTimeValue) {
                        flag = true;
                    }
                }
            });
        }
        return flag;
    }

    editProject() {
        this.operation = 'edit';
        this.uploadFile.previewImgStatus = true;
        this.activityForm.enable();
        this.activityForm.get('id').disable();
        this.activityForm.get('type').disable();
        this.activityForm.get('enabled').disable();
        this.canEdit = false;
    }

    /************ 优惠券选择 *************/
    openMemberSelect(memberTemplate) {
        this.selectedRule = this.currentRule;
        this.dialog.open(memberTemplate, {id: 'memberSelect', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentRule = this.selectedRule;
                const couponNumbersList = this.currentRule.map(item => item['number']);
                this.activityForm.get('couponNumbers').setValue(couponNumbersList);
            } else {
                const couponNumbersList = this.currentRule.map(item => item['number']);
                this.activityForm.get('couponNumbers').setValue(couponNumbersList);
            }
        });
    }

    onMemberSelect(event) {
        this.selectedRule = event;
    }

    removeMember(id) {
        this.currentRule = this.currentRule.filter(item => item['id'] !== id);
        const couponNumbersList = this.currentRule.map(item => item['number']);
        this.activityForm.get('couponNumbers').setValue(couponNumbersList);
    }

    goBack() {
        if (this.operation !== 'detail' && this.operation !== 'create') {
            this.operation = 'detail';
            this.getDetailInfo();
        } else {
            this.router.navigate(['apps/activityList']);
        }
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

    onSourcePreheatTime() {
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
    // 打开上传文件选项框
    openUploadImgDiloag(uploadImgDloag) {
        if (!this.dialog.getDialogById('uploadImageDialog_')) {
            this.uploadFile.uploadStatus = false;
            this.uploadFile.finishStatus = true;
            this.uploadFile.fileData = null;
            this.uploadFile.imgName = '';
            this.dialog.open(uploadImgDloag, {
                id: 'uploadImageDialog_',
                width: '500px',
                height: '245px',
                position: {top: '200px'},
                hasBackdrop: true,
            });
        }
    }

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
            // this.couponManageService.previewFile(this.uploadFile.umgUploadSuccessId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            //     const fileReader = new FileReader();
            //     fileReader.readAsDataURL(res);
            //     fileReader.onloadend = (res1) => {
            //         const result = res1.target['result'];
            //         this.uploadFile.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
            //         this.uploadFile.imgPreLoading = false;
            //     };
            // });
            this.uploadFile.imgPreLoading = false;
            this.snackBar.open('上传接口待开发!', '✖');
        }
    }

    // 上传券文件 选择并展示路径
    couponImgUpload(event) {
        const oneM = 1024 * 1024;
        const file = event.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open('上传文件大小不能超过1M', '✖');
            return;
        }
        this.uploadFile.fileData = new FormData();
        this.uploadFile.imgName = file.name;
        this.uploadFile.fileData.append('files', file);
    }

    // 上传文件
    onUploadImg() {
        if (!this.uploadFile.fileData) {
            this.snackBar.open('请选择一个文件', '✖');
        } else {
            this.uploadFile.uploading = true;
            this.couponManageService.uploadFile(this.uploadFile.fileData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                if (res.type === 1) {
                    this.uploadFile.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
                }
                if (res.status === 200) {
                    this.uploadFile.previewImgStatus = true;
                    this.uploadFile.progressLoad = 100;
                    this.uploadFile.uploading = false;
                    this.uploadFile.uploadStatus = true;
                    this.uploadFile.finishStatus = false;
                    this.uploadFile.umgUploadSuccessId = res['body'];
                    this.activityForm.get('pic').setValue(res['body']);
                }
            });
        }
    }

    /******会员限制******/
    // 获取会员列表
    toGetLevelList(data?) {
        // this.couponManageService.searchMemberCardList().subscribe(res => {
        //     this.levelSourceLength = res.body.length;
        //     this.levelSource = [];
        //     this.levelShow = [];
        //     if (res.body && data) {
        //         if (data[0] === '__ALL__') {
        //             this.levelSource = res.body;
        //             this.levelShow.push('__ALL__');
        //         } else {
        //             res.body.forEach(item => {
        //                 if (data.includes(item.id + '')) {
        //                     this.levelSource.push(item);
        //                     this.levelShow.push(item['levelName']);
        //                 }
        //             });
        //         }
        //     }
        // });
    }

    // 打开活动选择
    openActivitySelect(template) {
        this.selectActivity = this.currentActivity;
        this.dialog.open(template, {id: 'activityTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.currentActivity = this.selectActivity;
                if (this.selectActivity) {
                    this.activityForm.get('extParams').get('template').setValue(this.selectActivity.number);
                } else {
                    this.activityForm.get('extParams').get('template').setValue('');
                }
            } else {
                this.selectActivity = null;
            }
        });
    }

    onActivitySelect(event) {
        this.selectActivity = event;
    }

    openLevelSelect(template) {
        this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                if (this.levelSource.length === this.levelSourceLength) {
                    this.activityForm.get('level').setValue(['__ALL__']);
                    this.levelShow.push('__ALL__');
                } else {
                    const levelNameList = [];
                    this.levelShow = [];
                    this.levelSource.forEach(item => {
                        levelNameList.push(item['id']);
                        this.levelShow.push(item['levelName']);
                    });
                    this.activityForm.get('level').setValue(levelNameList);
                }
            }
        });
    }

    onSelectLevelLimit(event) {
        this.levelSource = event;
    }

    /******商场限制******/
    getMallType(data?) {
        this.couponManageService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            this.mallSourceLength = res['content'].length;
            this.mallSource = [];
            this.mallShow = [];
            if (res['content']) {
                if (data && data[0] === '__ALL__') {
                    this.mallSource = res['content'];
                    this.mallShow.push('__ALL__');
                } else {
                    res['content'].forEach(item => {
                        if (data && data.includes(item.mallId + '')) {
                            this.mallSource.push(item);
                            this.mallShow.push(item['mallName']);
                        }
                    });
                }
            }
        });
    }

    openMallSelect(template) {
        this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                if (this.mallSource.length === this.mallSourceLength && sessionStorage.getItem('isSystemSuperAdmin') === 'true') {
                    this.activityForm.get('mall').setValue(['__ALL__']);
                    this.mallShow.push('__ALL__');
                } else {
                    const carTypeNameList = [];
                    this.mallShow = [];
                    this.mallSource.forEach(item => {
                        carTypeNameList.push(item['mallId']);
                        this.mallShow.push(item['mallName']);
                    });
                    this.activityForm.get('mall').setValue(carTypeNameList);
                }
            }
        });
    }


    onSelectMallType(event) {
        this.mallSource = event;
    }

    toGetSendCheckMallInfo(data) {
        if (data.flag) {
            this.mallSourceLength = data.count;
            this.mallSource = data.body;
            // 非系统超级管理员点击选择所有时保存的是所有数据(不分页）
            if (sessionStorage.getItem('isSystemSuperAdmin') === 'true'){
                this.mallShow = ['__ALL__'];
                this.activityForm.get('mall').setValue(['__ALL__']);
            } else {
                const carTypeNameList = [];
                this.mallShow = [];
                this.mallSource.forEach(item => {
                    carTypeNameList.push(item['mallId']);
                    this.mallShow.push(item['mallName']);
                });
                this.activityForm.get('mall').setValue(carTypeNameList);
            }
        } else {
            this.mallSource = [];
            this.mallShow = [];
            this.activityForm.get('mall').setValue([]);
        }
        this.dialog.closeAll();
    }

    // 预览事件
    openPreData(PreDetailTe, data, flag) {
        this.previewData = '';
        if (flag === 'level') {
            if (this.activityForm.value['level'][0] === '__ALL__') {
                this.previewData = '默认对所有会员等级开放，没有限制';
            } else {
                this.previewData = this.levelSource.map(item => item['levelName']).join().replace(/,/g, '\n\n');
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

    /*******输入校验*******/
    onNumberInput1(event) {
        if (!this.utils.isNumber(event.target.value)) {
            event.target.value = event.target.value.replace(/\D/g, '');
        } else {
            if (Number(event.target.value) <= 1) {
                event.target.value = 1;
            }
        }
        this.activityForm.get('maxJoin').setValue(event.target.value);
    }

    onNumberInput2(event) {
        if (!this.utils.isNumber(event.target.value)) {
            event.target.value = event.target.value.replace(/\D/g, '');
        } else {
            if (Number(event.target.value) <= 1) {
                event.target.value = 1;
            }
        }
        this.activityForm.get('maxJoinDaily').setValue(event.target.value);
    }

    onNumberInput3(event) {
        if (!this.utils.isNumber(event.target.value)) {
            event.target.value = event.target.value.replace(/\D/g, '');
        } else {
            if (Number(event.target.value) <= 1) {
                event.target.value = 1;
            }
        }
        this.activityForm.get('extParams').get('totalPoint').setValue(event.target.value);
    }


    onNumberInput(event, flag) {
        if (flag === 'price') {
            if (!this.utils.isFixed2(event.target.value)) {
                event.target.value = event.target.value.replace(/\D/g, '');
            } else {
                if (Number(event.target.value) <= 1) {
                    event.target.value = 1;
                }
            }
            this.activityForm.get('price').setValue(event.target.value);
        } else if (flag === 'refundTime') {
            if (!this.utils.isNumber(event.target.value)) {
                event.target.value = event.target.value.replace(/\D/g, '');
            } else {
                if (Number(event.target.value) <= 1) {
                    event.target.value = 1;
                }
            }
            this.activityForm.get('refundTime').setValue(event.target.value);
        }
    }

    /************ 富文本编辑框 *************/
    onEditorCreatedPro(editor) {
        this.utils.onEditorCreated(editor, this.activityForm.get('ruleText'));
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
