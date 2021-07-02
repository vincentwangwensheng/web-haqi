import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, ValidatorFn, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {AppointmentService} from '../appointment-service/appointment.service';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Subject} from 'rxjs';
import {Utils} from '../../../../services/utils';
import {CurrencyPipe} from '@angular/common';
import {environment} from '../../../../../environments/environment.hmr';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
    selector: 'app-appointment-add',
    templateUrl: './appointment-add.component.html',
    styleUrls: ['./appointment-add.component.scss'],
    animations: fuseAnimations
})

/** 新建事件 **/
export class AppointmentAddComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('startDate', {static: true}) startDate: ElementRef;
    @ViewChild('endDate', {static: true}) endDate: ElementRef;

    title = '新建事件';

    IncidentID: string; // 当前ID

    butShow = 'ADD'; // 控制按钮 显示 ADD--> 添加  EDIT---> 编辑 DETAIL---> 详情

    FormOption: any;  // 表单

    IncidentSource: any; // 本编辑页面信息备份

    configStartTime: any; // 设置开始时间
    configEndTime: any; // 设置结束时间

    quillConfig: any; // 富文本编辑框的配置项
    editor;   // 富文本


    type = []; // 预约类型
    status = []; // 状态
    paySupplierSource = []; // 支付供应商数组

    eventCheckbox: EventCheckbox; // 多选框
    mallEnabled = false; // 商场按钮是否可点

    mallInfo: any; // 记录商场选择数
    mallNameShow = ''; // 显示的商场名称
    mallIdShow = ''; // 显示的商场ID

    memberCardInfo = []; // 记录会员卡选 择数
    memberCardNameShow = ''; // 显示会员卡名称

    previewData: any;

    butDis = false;

    tlKey = ''; // 环境

    tips15 = this.translate.instant('appointment.CRUD.tips15');
    tips16 = this.translate.instant('appointment.CRUD.tips16');
    tips17 = this.translate.instant('appointment.CRUD.tips17');

    checkboxButDis = false;

    upImg_: UpImg; // 上传图片 声明变量

    imgSrc: any; // 图片路径

    showImgSpinner = false; // 加载条

    upTitle = '' ; // 上传图片的标题

    UpLoadImgType = ''; // detail是详情图片  cover是封面图片

    detailImgSec: any; // 详情图路径

    detailImgLoading = false; // 详情加载条

    // 报名方式类型
    applyTypeList = [];

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private routeInfo: ActivatedRoute,
        private router: Router,
        public  dialog: MatDialog,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private dateTransform: NewDateTransformPipe,
        private document: ElementRef,
        private utils: Utils,
        private sanitizer: DomSanitizer,
        private currency: CurrencyPipe,
        private appointmentService: AppointmentService
    ) {
        if (localStorage.getItem('currentProject')) {
            this.tlKey = localStorage.getItem('currentProject');
        }

        this.FormOption = new FormBuilder().group({
            id: new FormControl({value: null, disabled: true}, [Validators.required]), // id
            incidentId: new FormControl({value: null, disabled: true}, [Validators.required]), // 编号
            type: new FormControl({value: '服务预约', disabled: false}, [Validators.required]), // 事件类型
            incidentName: new FormControl({value: null, disabled: false}, [Validators.required]), // 名称
            image: new FormControl({value: null, disabled: false}, [Validators.required]), // 图片
            enabled: new FormControl({value: true, disabled: false}, [Validators.required]), // 状态
            desc: new FormControl({value: null, disabled: false}, [Validators.required]),  // 说明
            beginTime: new FormControl({value: null, disabled: false}, [Validators.required]), // 开始时间
            endTime: new FormControl({value: null, disabled: false}, [Validators.required]),  // 结束时间
            membersLimit: new FormControl({value: null, disabled: false}, [Validators.required]),  // 会员限制
            paidRegistration: new FormControl({value: null, disabled: false}, [Validators.required]),  // 报名付费
            paidAmount: new FormControl({
                value: null,
                disabled: false
            }, [paidAmountValidator(/^\d+(\.\d{1,2})?$/, this.tips15, this.tips16)]),  // 付费金额
            paymentProvider: new FormControl({value: '首都机场股份有限公司', disabled: false}, [Validators.required]),  // 支付供应商
            automatic: new FormControl({value: null, disabled: false}, [Validators.required]),  // 自动确认
            sms: new FormControl({value: null, disabled: false}, [Validators.required]),  // 短信通知
            reception: new FormControl({value: null, disabled: false}, [Validators.required]),  // 接待限制
            receptionCount: new FormControl({
                value: null,
                disabled: false
            }, [receptionCountValidator(/^[0-9]*[1-9][0-9]*$/, this.tips15, this.tips17)]),  // 接待限制  数量  /[^\d]/g
            sponsor: new FormControl({value: null, disabled: false}, [Validators.required]),  // 主办方
            sitLocation: new FormControl({value: null, disabled: false}, [Validators.required]),  // 地点位置
            mallId: new FormControl({value: null, disabled: false}, [Validators.required]),  // 商场ID
            mallName: new FormControl({value: null, disabled: false}, [Validators.required]),  //  商场名称
            createdBy: new FormControl({value: null, disabled: false}, [Validators.required]),
            createdDate: new FormControl({value: null, disabled: false}, [Validators.required]),
            lastModifiedBy: new FormControl({value: null, disabled: true}, [Validators.required]),
            lastModifiedDate: new FormControl({value: null, disabled: true}, [Validators.required]),

            // 新增字段
            applyType: new FormControl('FREE'),  // 报名方式
            point: new FormControl(1),  // 积分
        });
        this.FormOption.get('point').valueChanges.subscribe(res => {
            this.utils.transformToNumberWithControl(res, this.FormOption.get('point'), 1, 9999999);
        });

    }

    ngOnInit() {
        this.initParam();
        this.initConfig();
        this.getApplyTypeList();
        this.getIncidentType().then((res) => {
            this.type = res;
        }).finally(() => {
            this.initID().then((p) => {
                if (p === 'DETAIL') {
                    this.getIncidentById();
                }
            });
        });
    }

    // 获取报名方式类型
    getApplyTypeList(){
        this.appointmentService.getApplyType().subscribe(res => {
            console.log('res:', res);
            if (res){ // 接口返回的是一个对象
                // tslint:disable-next-line:forin
                for (const item in res){
                    this.applyTypeList.push({value: item, desc: res[item]});
                }
            }
        });
    }

    // 获取预约类型
    getIncidentType() {
        return new Promise<any>( (resolve, reject) => {
            this.appointmentService.getIncidentType().pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    this.FormOption.get('type').patchValue(res[0].key); // 预约类型
                    resolve(res);
                },
                error1 => {   reject(error1); }
            );
        });

    }


    // 拿到对应的ID信息
    initID() {
        this.loading.show();
        return new Promise<any>((resolve, reject) => {
            this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (param: Params) => {
                        const theId = param.id;
                        this.IncidentID = theId;
                        if (theId === 'ADD') {
                            // 新增
                            this.butShow = 'ADD';
                            this.title = this.translate.instant('appointment.CRUD.' + this.tlKey + '.addEvent'); // 新建事件
                            this.loading.hide();
                            resolve('ADD');
                        } else {
                            // 编辑
                            this.butShow = 'DETAIL';
                            resolve('DETAIL');
                            this.title = this.translate.instant('appointment.CRUD.' + this.tlKey + '.editEvent'); // 编辑事件
                        }
                    },
                    error1 => {
                        reject(error1);
                    });
        });

    }



    // 根据ID拿到对应的详情
    getIncidentById() {
        this.appointmentService.getIncidentById(this.IncidentID).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.setEditContent(res);
            this.loading.hide();
            this.IncidentSource = res;
            this.FormOption.patchValue(res);
            this.startDate['picker'].set('maxDate',  new Date(this.FormOption.get('endTime').value));
            this.endDate['picker'].set('minDate',  new Date(this.FormOption.get('beginTime').value));
            if (this.butShow === 'DETAIL') {
                this.checkboxButDis = true;
                this.mallEnabled = true;
                this.FormOption.disable();
            }

        });
    }

    setEditContent(res) {
        res.beginTime = this.dateTransform.transform(res.beginTime);
        res.endTime = this.dateTransform.transform(res.endTime);
        res.lastModifiedDate = this.dateTransform.transform(res.lastModifiedDate);
        res.createdDate = this.dateTransform.transform(res.createdDate);

        res.paidRegistration === true ? this.eventCheckbox.paidRegistrationYes = true : this.eventCheckbox.paidRegistrationYes = false; // 付费报名
        res.paidRegistration === true ? this.eventCheckbox.paidRegistrationNo = false : this.eventCheckbox.paidRegistrationNo = true;  // 付费报名

        res.automatic === true ? this.eventCheckbox.automaticYes = true : this.eventCheckbox.automaticYes = false; // 自动确认
        res.automatic === true ? this.eventCheckbox.automaticNo = false : this.eventCheckbox.automaticNo = true; // 自动确认

        res.sms === true ? this.eventCheckbox.smsYes = true : this.eventCheckbox.smsYes = false; // 短信通知
        res.sms === true ? this.eventCheckbox.smsNo = false : this.eventCheckbox.smsNo = true; // 短信通知

        res.reception === true ? this.eventCheckbox.receptionYes = true : this.eventCheckbox.receptionYes = false; // 接待限制
        res.reception === true ? this.eventCheckbox.receptionNo = false : this.eventCheckbox.receptionNo = true; // 接待限制


        this.eventCheckbox.paidRegistrationYes === true ? this.FormOption.get('paidAmount').enable() : this.FormOption.get('paidAmount').disable(); // 付费报名
        this.eventCheckbox.paidRegistrationYes === true ? this.FormOption.get('paymentProvider').enable() : this.FormOption.get('paymentProvider').disable(); // 付费报名

        this.eventCheckbox.receptionYes === true ? this.FormOption.get('receptionCount').enable() : this.FormOption.get('receptionCount').disable(); // 接待限制
        this.eventCheckbox.receptionYes === true ? this.mallEnabled = false : this.mallEnabled = true; // 接待限制

        this.setTheTeSource(res); // 处理选择商场和会员的string
    }


    // 处理选择商场和会员的string
    setTheTeSource(res) {
        this.mallNameShow = res.mallName;
        this.mallIdShow = res.mallId;
        this.memberCardNameShow = res.membersLimit;
        const mallId_str = res.mallId;
        const cardName_str = res.membersLimit;

        if (this.IsNull(mallId_str) && this.IsNull(res.mallName)) {

            this.mallInfo = {mallId: mallId_str, mallName: res.mallName};
        }
        if (this.IsNull(cardName_str)) {
            if (cardName_str.includes(',')) {
                const cardName_json = cardName_str.split(',');
                cardName_json.forEach(card => {
                    this.memberCardInfo.push({levelName: card});
                });
            } else {
                this.memberCardInfo = [{levelName: cardName_str}];
            }

        }


    }


    // 初始化参数
    initParam() {
        this.mallInfo = [];
        // 状态
        this.status = [
            {id: true, value: this.translate.instant('appointment.CRUD.' + this.tlKey + '.normal')}, // 正常
            {id: false, value: this.translate.instant('appointment.CRUD.' + this.tlKey + '.frozen')}, // 冻结
        ];

        // 支付供应商
        this.paySupplierSource = [
            {
                id: this.translate.instant('appointment.CRUD.' + this.tlKey + '.PaySupplier_bcia'),
                value: this.translate.instant('appointment.CRUD.' + this.tlKey + '.PaySupplier_bcia')
            }, //  首都机场股份有限公司
        ];

        this.FormOption.get('paymentProvider').patchValue(this.translate.instant('appointment.CRUD.' + this.tlKey + '.PaySupplier_bcia')); // 支付供应商
        this.eventCheckbox = new EventCheckbox();
    }


    // 添加修改保存
    saveIncident(p) {
        const incident = this.FormOption.getRawValue();

        incident.membersLimit = this.memberCardNameShow;
        incident.mallName = this.mallNameShow;
        incident.mallId = this.mallIdShow;
        this.eventCheckbox.paidRegistrationYes === true ? incident.paidRegistration = true : incident.paidRegistration = false; // 报名付费
        this.eventCheckbox.automaticYes === true ? incident.automatic = true : incident.automatic = false; // 自动确认
        this.eventCheckbox.smsYes === true ? incident.sms = true : incident.sms = false; // 短信通知
        this.eventCheckbox.receptionYes === true ? incident.reception = true : incident.reception = false; // 接待限制

        const val = this.setValidator(incident);
        if (val) {
            return true;
        }
        incident.beginTime = this.formatToZoneDateTime(incident.beginTime);
        incident.endTime = this.formatToZoneDateTime(incident.endTime);
        incident.lastModifiedBy = sessionStorage.getItem('username');
        if (p === 'add') {
            this.butDis = true;
            incident.createdBy = sessionStorage.getItem('username');
            this.appointmentService.incidents(incident).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips1'), '✖'); // 保存成功！！！
                this.router.navigate(['/apps/appointmentList']);
            }, error1 => {
                this.butDis = false;
            });
        }
        if (p === 'up') {
            this.butDis = true;
            incident.lastModifiedDate = this.formatToZoneDateTime(incident.lastModifiedDate);
            incident.createdDate = this.formatToZoneDateTime(incident.createdDate);
            this.appointmentService.updateIncident(incident).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips2'), '✖'); //  编辑成功！！！
                this.router.navigate(['/apps/appointmentList']);
            }, error1 => {
                this.butDis = false;
            });
        }

    }


    // 转为可编辑模式
    canEdit() {
        this.butShow = 'EDIT';
        this.FormOption.enable();
        this.FormOption.get('incidentId').disable();
        this.checkboxButDis = false;
        this.eventCheckbox.paidRegistrationYes === true ? this.FormOption.get('paidAmount').enable() : this.FormOption.get('paidAmount').disable(); // 付费报名
        this.eventCheckbox.paidRegistrationYes === true ? this.FormOption.get('paymentProvider').enable() : this.FormOption.get('paymentProvider').disable(); // 付费报名

        this.eventCheckbox.receptionYes === true ? this.FormOption.get('receptionCount').enable() : this.FormOption.get('receptionCount').disable(); // 接待限制
        this.eventCheckbox.receptionYes === true ? this.mallEnabled = false : this.mallEnabled = true; // 接待限制
    }

    // 取消可编辑模式
    CancelEdit() {
        this.butShow = 'DETAIL';
        const bfString = JSON.stringify(this.IncidentSource);
        const bfJson = JSON.parse(bfString);
        this.setEditContent(bfJson);
        this.FormOption.patchValue(bfJson);
        this.checkboxButDis = true;
        this.mallEnabled = true;
        this.FormOption.disable();
    }

    // 验证
    setValidator(incident) {

        if (!this.IsNull(incident.incidentName)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips3'), '✖'); // 事件名称为必填项
            return true;
        }
        if (!this.IsNull(incident.desc)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips4'), '✖'); //  事件说明为必填项
            return true;
        }
        if (!this.IsNull(incident.beginTime)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips5'), '✖'); //  开始时间不能为空
            return true;
        }
        if (!this.IsNull(incident.endTime)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips6'), '✖');  //  结束时间不能为空
            return true;
        }
        if (this.FormOption.get('applyType').value === 'POINT' && !this.FormOption.get('point').value) {
            this.snackBar.open(this.translate.instant('积分不能为空'), '✖');  //  积分不能为空
            return true;
        }
        if (!this.IsNull(incident.image)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips19'),  '✖');  //  还未上传图片
            return true;
        }

        if (!this.IsNull(incident.membersLimit)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips7'), '✖');  //  会员限制为必选项
            return true;
        }

        // if (incident.paidRegistration) {
        //     if (!this.IsNull(incident.paidAmount)) {
        //         this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips8'), '✖'); // 付费金额为必填项
        //         return true;
        //     } else {
        //         const reg = /^\d+(\.\d{1,2})?$/;
        //         if (!reg.test(incident.paidAmount)) {
        //             this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips9'), '✖');  // 付费报名金额格式不对
        //             return true;
        //         }
        //     }
        // }
        if (incident.reception) {
            if (!this.IsNull(incident.receptionCount)) {
                this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips10'), '✖');  // 接待限制数量为必填项
                return true;
            } else {
                const reg = /^[0-9]*[1-9][0-9]*$/;
                if (!reg.test(incident.receptionCount)) {
                    this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips11'), '✖');  // 接待限制数量格式不正确
                    return true;
                }
            }
            if (!this.IsNull(incident.mallName)) {
                this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips12'), '✖');   // 关联商场为必选项
                return true;
            }
        }
        if (!this.IsNull(incident.sponsor)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips13'), '✖');   // 主办方为必填项
            return true;
        }
        if (!this.IsNull(incident.sitLocation)) {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips14'), '✖');  // 地点位置为必填项
            return true;
        }
        return false;
    }


    // 点击增减按钮 弹出选择会员的弹框
    openMemberCardList(MemberCardTe) {
        if (!this.dialog.getDialogById('MemberCardTeClass')) {
            this.dialog.open(MemberCardTe, {id: 'MemberCardTeClass', width: '80%'}).afterClosed()
                .subscribe(res => {
                    if (res) {
                        const card_str = JSON.stringify(this.memberCardInfo);
                        const card_newJson = JSON.parse(card_str);
                        this.memberCardNameShow = '';
                        card_newJson.forEach(m => {
                            if (this.memberCardNameShow === '') {
                                this.memberCardNameShow = m.levelName;
                            } else {
                                this.memberCardNameShow = this.memberCardNameShow + ',' + m.levelName;
                            }

                        });
                    }

                });
        }
    }

    // 选择会员卡事件
    memberCardSelect(e) {
        this.memberCardInfo = e;
    }

    // 点击＋号按钮 弹出选择商场的弹框
    openMallList(mallTe) {
        if (!this.dialog.getDialogById('mallTeClass')) {
            this.dialog.open(mallTe, {id: 'mallTeClass', width: '80%'}).afterClosed()
                .subscribe(res => {
                    if (res) {
                        const mall_str = JSON.stringify(this.mallInfo);
                        const mall_newJson = JSON.parse(mall_str);
                        this.mallNameShow = '';
                        this.mallIdShow = '';
                        this.mallNameShow = mall_newJson.mallName;
                        this.mallIdShow = mall_newJson.mallId;

                    }

                });
        }
    }

    // 选择商场事件
    mallSelect(e) {
        this.mallInfo = e;
    }


    // 上传图片 判断
    openUpLoadImg(UpLoadImg , p){
        this.upImg_ = new UpImg();
        this.UpLoadImgType = p;
        if (p === 'detail') {
            // '图片格式为jpg，png，gif，文件大小不大于1MB，尺寸670 x 320 px';
            this.upImg_.uploadDesc =  this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips22');
            this.upTitle =  this.translate.instant('appointment.CRUD.' + this.tlKey + '.upImgDetailsTitle_');
        } else {
            // cover
            this.upTitle =   this.translate.instant('appointment.CRUD.' + this.tlKey + '.upImgTitle');
            this.upImg_.uploadDesc = this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips21');
        }

        if (!this.dialog.getDialogById('UpLoadImgClassC')) {
            this.dialog.open(UpLoadImg, {id: 'UpLoadImgClassC',   width: '500px', height: '245px', position: {top: '200px'} , hasBackdrop: true });
        }
    }

    // 真正的上传图片
    realUpload(e){
        this.appointmentService.CouponFileUpload(e.CouponFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                // { reportProgress: true, observe: 'events'}  上传拿到进度的参数
                this.upImg_.notUploading = false; // 让进度条可以看见
                this.upImg_.UpLoadStatus = true;  // 设置上传按钮为不可点击
                if (res.type === 1) {
                    // 浏览器返回上传进度
                    this.upImg_.ProgressLoad = (res.loaded / res.total) * 100;  // 上传长度
                }
                if (res.status === 200) {
                    // 上传完成
                    this.upImg_.ProgressLoad = 100; // 将进度条的今天提到百分之百
                    this.upImg_.notUploading = true; // 让进度条影藏
                    this.upImg_.FinishStatus = false; // 将完成按钮设置为可点击
                    const imgID = res.body;   // 上传返回的数据
                    if ( this.UpLoadImgType === 'detail') {
                       // console.log(imgID , '----详情图片');
                    } else {
                        // 封面
                     //   console.log(imgID , '----封面图片');
                        this.FormOption.get('image').patchValue(imgID);
                    }

                }
            },
            error1 => {
                this.upImg_.notUploading = true;  // 上传失败将进度条影藏
                this.upImg_.UpLoadStatus = false; // 将上传按钮设置为可点击状态
            });
    }


    // 预览 封面图片
    upImgPreview(upImgPre){
        if (this.IsNull(this.FormOption.get('image').value)) {

            if (!this.dialog.getDialogById('upImgPreClass')) {
                this.dialog.open(upImgPre, {id: 'upImgPreClass',   width: '670px', height: '320px', position: {top: '200px'} , hasBackdrop: true });
            }
            this.showImgSpinner = true;
            this.appointmentService.ShowImg(this.FormOption.get('image').value).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(res);
                    fileReader.onloadend = (res1) => {
                        const result = res1.target['result'];
                        this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                        this.showImgSpinner = false;
                    };
                },
                error1 => {

                });

        } else {
            this.snackBar.open(this.translate.instant('appointment.CRUD.' + this.tlKey + '.tips20'), '✖'); // 目前没有可预览的图片
        }

    }


    toCancel() {
        history.back();
    }

    onSourceDate(e, endTime, startTime, p) {
        if (p === 'endTime') {
            // e.setHours(23);
            // e.setMinutes(59);
            // e.setSeconds(59);
        }
        'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
        // this.initTimeConfig();
    }

    // 预览事件
    openPreData(PreDetailTe, data) {
        this.previewData = '';
        this.previewData = data.replace(/,/g, '\n\n');
        if (!this.dialog.getDialogById('PreDetailTeClass')) {
            this.dialog.open(PreDetailTe, {id: 'PreDetailTeClass', width: '600px', height: '550px', hasBackdrop: true});
        }
    }

    // 接待限制
    ReceptionLimChange(e, p) {
        if (p === 'no') {
            this.eventCheckbox.receptionNo = e.checked;
            if (e.checked) {
                this.eventCheckbox.receptionYes = false;
                this.FormOption.get('receptionCount').patchValue('');
                this.FormOption.get('receptionCount').disable();
                this.mallInfo = [];
                this.mallNameShow = '';
                this.mallEnabled = true;
            } else {
                this.eventCheckbox.receptionYes = true;
                this.FormOption.get('receptionCount').enable();
                this.mallEnabled = false;
            }
        } else {
            this.eventCheckbox.receptionYes = e.checked;
            if (e.checked) {
                this.eventCheckbox.receptionNo = false;
                this.FormOption.get('receptionCount').enable();
                this.mallEnabled = false;
            } else {
                this.eventCheckbox.receptionNo = true;
                this.FormOption.get('receptionCount').patchValue('');
                this.FormOption.get('receptionCount').disable();
                this.mallInfo = [];
                this.mallNameShow = '';
                this.mallEnabled = true;
            }
        }
    }

    // 短信通知 自动确认事件
    eventCheckboxChange(e, p , chFieldYes , chFieldNo){
        if (p === 'no') {
            this.eventCheckbox[chFieldNo] = e.checked;
            if (e.checked) {
                this.eventCheckbox[chFieldYes] = false;
            } else {
                this.eventCheckbox[chFieldYes] = true;
            }
        } else {
            this.eventCheckbox[chFieldYes] = e.checked;
            if (e.checked) {
                this.eventCheckbox[chFieldNo] = false;
            } else {
                this.eventCheckbox[chFieldNo] = true;
            }
        }
    }


    // 初始化时间、富文本框的配置信息
    initConfig() {
        this.quillConfig = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{'header': 1}, {'header': 2}],               // custom button values
                [{'list': 'ordered'}, {'list': 'bullet'}],
                [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
                [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
                [{'direction': 'rtl'}],                         // text direction

                [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
                [{'header': [1, 2, 3, 4, 5, 6, false]}],

                [{'color': []}, {'background': []}],          // dropdown with defaults from theme
                [{'font': []}],
                [{'align': []}],

                ['clean'],                                         // remove formatting button

                ['link', 'image']                         // link and image,
            ]
        };

        this.initTimeConfig();
    }

    initTimeConfig(){

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

    // 富文本编辑框 图片处理
    EditorCreated(event) {
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandler.bind(this));
        this.editor = event;
    }

    imageHandler() {
        const Imageinput = document.createElement('input');
        Imageinput.setAttribute('type', 'file');
        Imageinput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
        Imageinput.classList.add('ql-image');
        Imageinput.addEventListener('change', () => {
            const file = Imageinput.files[0];
            const data: FormData = new FormData();
            data.append('files', file);
            if (Imageinput.files != null && Imageinput.files[0] != null) {
                this.appointmentService.FileUploadNotBar(data).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                    if (res !== undefined && res !== 'undefined') {
                        const range = this.editor.getSelection(true);
                        const index = range.index + range.length;
                        this.editor.setSelection(1 + range.index);
                        this.editor.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res);
                        const desc = this.FormOption.get('desc').value;
                        let changeValue = '';
                        if (this.IsNull(desc)) {
                            changeValue = desc + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        } else {
                            changeValue = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        }
                        this.FormOption.get('desc').patchValue(changeValue);
                        this.editor.focus();
                    }
                }, error1 => {
                    this.loading.hide();
                });
            }
        });
        Imageinput.click();
    }


    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

    IsNull(para) {
        if ('undefined' !== para && undefined !== para && '' !== para && null !== para) {
            return true;
        } else {
            return false;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // 报名付费  未使用
    registrationChange(e, p) {
        if (p === 'no') {
            this.eventCheckbox.paidRegistrationNo = e.checked;
            if (e.checked) {
                this.eventCheckbox.paidRegistrationYes = false;
                this.FormOption.get('paidAmount').disable();
                this.FormOption.get('paymentProvider').disable();
                this.FormOption.get('paidAmount').patchValue('');
            } else {
                this.eventCheckbox.paidRegistrationYes = true;
                this.FormOption.get('paidAmount').enable();
                this.FormOption.get('paymentProvider').enable();
            }
        } else {
            this.eventCheckbox.paidRegistrationYes = e.checked;
            if (e.checked) {
                this.eventCheckbox.paidRegistrationNo = false;
                this.FormOption.get('paidAmount').enable();
                this.FormOption.get('paymentProvider').enable();
            } else {
                this.eventCheckbox.paidRegistrationNo = true;
                this.FormOption.get('paidAmount').disable();
                this.FormOption.get('paymentProvider').disable();
                this.FormOption.get('paidAmount').patchValue('');
            }
        }
    }
}

export class EventCheckbox {
    paidRegistrationYes = true; // 报名付费 是
    paidRegistrationNo = false; // 报名付费 否
    automaticYes = false; // 自动确认 是
    automaticNo = true; // 自动确认 否
    smsYes = true; // 短信通知 是
    smsNo = false; // 短信通知 否
    receptionYes = true; // 接待限制 是
    receptionNo = false; // 接待限制 否
}

// 上传图片
export class UpImg {
    ProgressLoad: number;  // 上传长度
    notUploading: boolean; // 是否在上传
    UpLoadStatus = false;  // 上传按钮的状态，是否可 用
    FinishStatus = true;   // 完成按钮的状态  是否可用
    limitM: number;       // 上传文件的限制大小
    limitType: string;   // 上传类型限制
    uploadDesc: string; // 上传文件限制描述
}


export function paidAmountValidator(nameRe: RegExp, tips15, tips16): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            const er_ = {forbiddenCh: tips15, forbiddenChNo: true, required: true}; //  此项必填
            return er_;
        }
        const forbidden = nameRe.test(control.value);
        const err_ = forbidden === false ? {
            forbiddenCh: tips16, //  金额格式不对,小数点后只保留两位
            forbiddenChNo: true,
            required: true
        } : null;

        return err_;
    };
}


export function receptionCountValidator(nameRe: RegExp, tips15, tips17): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            const er_ = {forbiddenCh: tips15, forbiddenChNo: true, required: true}; //  此项必填
            return er_;
        }
        const forbidden = nameRe.test(control.value);
        const err_ = forbidden === false ? {forbiddenCh: tips17, forbiddenChNo: true, required: true} : null; // 请输入正整数
        return err_;
    };
}
