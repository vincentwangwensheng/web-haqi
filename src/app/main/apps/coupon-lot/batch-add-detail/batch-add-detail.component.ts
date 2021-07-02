import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
    BatchEntity,
    CouponMaintainEntity,
    ECouponServiceService
} from '../../../../services/EcouponService/ecoupon-service.service';
import {Subject} from 'rxjs';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';
import {takeUntil} from 'rxjs/operators';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DomSanitizer} from '@angular/platform-browser';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-batch-add-detail',
    templateUrl: './batch-add-detail.component.html',
    styleUrls: ['./batch-add-detail.component.scss'],
    animations: fuseAnimations
})

// 详情
export class BatchAddDetailComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('StartTime', {static: true}) StartTime: ElementRef;
    @ViewChild('endTime', {static: true}) endTime: ElementRef;
    sysPara: SysPara;
    options: FormGroup;         // form表单组
    options2: FormGroup;         // form表单组
    con_main: CouponMaintainEntity;
    batch: BatchEntity;
    selectedTag: any;
    distributionChannels: any;
    configEnd: any;
    configStart: any;
    btuDis: boolean;
    quillConfig: any; // 富文本编辑框的配置项
    // quillDes: any;
    upImg_: UpImg; // 声明变量
    importCRMCode = ''; // 导入外部券码
    tips15 = this.translate.instant('appointment.CRUD.tips15');
    tips17 = this.translate.instant('appointment.CRUD.tips17');
    previewData = '';
    constructor(
        private routeInfo: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private translate: TranslateService,
        private dateTransform: NewDateTransformPipe,
        private snackBar: MatSnackBar,
        private sanitizer: DomSanitizer,
        private loading: FuseProgressBarService,
        private couponService: ECouponServiceService,
    ) {
        this.options = new FormBuilder().group({
            couponId: new FormControl({value: null, disabled: false}, [Validators.required]),
            quantity: new FormControl({value: '100', disabled: true}, [Validators.required]),
            number: new FormControl({value: null, disabled: false}, [Validators.required]),
            timeBegin: new FormControl({value: '', disabled: false}, [Validators.required]),
            timeEnd: new FormControl({value: '', disabled: false}, [Validators.required]),
            createdBy: new FormControl({
                value: sessionStorage.getItem('username'),
                disabled: false
            }, [Validators.required]),
            createdDate: new FormControl({value: '', disabled: false}, [Validators.required]),
        });
        this.options2 = new FormBuilder().group({
            couponId: new FormControl({value: null, disabled: false}, [Validators.required]),
            quantity: new FormControl({value: '', disabled: false}, [batchNoValidator(/^[0-9]*[1-9][0-9]*$/, this.tips15, this.tips17)]), // 批次数量
            balance: new FormControl({value: '', disabled: true}, [Validators.required]), // 剩余数量
            number: new FormControl({value: null, disabled: false}, [Validators.required]), // 编号
            timeBegin: new FormControl({value: '', disabled: false}, [Validators.required]),
            timeEnd: new FormControl({value: '', disabled: false}, [Validators.required]),
            distributionChannels: new FormControl({
                value: this.translate.instant('ElectronicVoucherManagement.CouponLot.MarketingApplet'),
                disabled: true
            }, [Validators.required]), // 发放渠道
            des: new FormControl({value: '', disabled: false}, [Validators.required]),
            createdBy: new FormControl({
                value: sessionStorage.getItem('username'),
                disabled: false
            }, [Validators.required]),
            createdDate: new FormControl({value: '', disabled: false}, [Validators.required]),
        });
    }

    ngOnInit() {
        this.importCRMCode = this.translate.instant('ElectronicVoucherManagement.CouponLot.importCRMCode');
        this.quillConfig = {
            toolbar: [
                // ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                // ['blockquote', 'code-block'],
                //
                //  [{'header': 1}, {'header': 2}],               // custom button values
                //  [{'list': 'ordered'}, {'list': 'bullet'}],
                //  [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
                //  [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
                //  [{'direction': 'rtl'}],                         // text direction
                //
                //  [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
                //  [{'header': [1, 2, 3, 4, 5, 6, false]}],
                //
                //  [{'color': []}, {'background': []}],          // dropdown with defaults from theme
                //  [{'font': []}],
                //  [{'align': []}],
                //
                //  ['clean'],                                         // remove formatting button
                //
                //   ['link', 'image']                         // link and image,
            ]
        };

        this.sysPara = new SysPara();
        this.con_main = new CouponMaintainEntity();
        this.batch = new BatchEntity();
        this.btuDis = false;
        // 拿到ID，根据ID判断当前是什么页面
        this.getCouponMaintain();
        this.distributionChannels = [
            {
                id: this.translate.instant('ElectronicVoucherManagement.CouponLot.MarketingApplet'),
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.MarketingApplet')
            } //  营销小程序
        ];

        this.initTimeConfig();
    }

    // 拿到ID和当前的优惠券信息
    getCouponMaintain() {
        this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (param: Params) => {
                    if (param.id !== CouponParameter.COUPONLOTADD_ID) {
                        // 不是添加是详情
                        this.sysPara.DetailShow = true;
                        this.sysPara.batchTitle = this.translate.instant('ElectronicVoucherManagement.CouponLot.couBatchDetail'); //  券批次详情
                        const p_id = (param.id).split('&&');
                        let batch_id = '0';
                        for (let a = 0; a < p_id.length; a++) {
                            if (a === 0) {
                                batch_id = p_id[a];
                            } else {

                            }
                        }
                        this.couponService.getBatch(batch_id).pipe(takeUntil(this._unsubscribeAll))
                            .subscribe(res => {
                                this.options.controls.number.patchValue(res.number);
                                this.options.controls.createdBy.patchValue(res.createdBy);
                                this.options.controls.createdDate.patchValue(res.createdDate);
                                this.options2.controls.number.patchValue(res.number);
                                this.options2.controls.number.disable();
                                this.options2.controls.quantity.patchValue(res.quantity);
                                this.options2.controls.quantity.disable();
                                this.options2.controls.timeBegin.patchValue(this.dateTransform.transform(res.timeBegin));
                                this.options2.controls.timeBegin.disable();
                                this.options2.controls.timeEnd.patchValue(this.dateTransform.transform(res.timeEnd));
                                this.options2.controls.timeEnd.disable();
                                this.options2.controls.des.patchValue(res.description);
                                this.options2.controls.des.disable();
                                this.options2.controls.balance.patchValue(res.balance);
                                this.options2.controls.balance.disable();
                                this.sysPara.con_main_ID = res.couponId;
                                this.getCoupon();
                            }, error1 => {
                                this.loading.hide();
                            }, () => {
                                this.loading.hide();
                            });
                    } else {

                        if (this.options2.controls.number.value !== null && this.options2.controls.number.value !== undefined) {
                            location.reload();
                        }

                        // 添加 初始没有选择券规则的时候addHasChoose为false
                        this.sysPara.addHasChoose = false;
                        this.sysPara.DetailShow = false;
                        this.sysPara.batchTitle = this.translate.instant('ElectronicVoucherManagement.CouponLot.couBatchAdd'); // 券批次新增
                        this.options2.controls.number.disable();
                        this.initCouponSource('start');
                        this.options.controls.quantity.reset({value: '100', disabled: false}, [Validators.required]);
                        this.options.controls.timeBegin.reset({value: '', disabled: true}, [Validators.required]);
                        this.options.controls.timeEnd.reset({value: '', disabled: true}, [Validators.required]);  // this.sysPara.DetailShow
                    }

                },
                error1 => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                });
    }

    // 保存
    toSave() {
        if (this.sysPara.con_main_ID === undefined || this.sysPara.con_main_ID === 'undefined') {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_1'), '✖'); // 请选择一个券规则
            return;
        }
        if (!this.options2.controls.quantity.value) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_2'), '✖'); //  券批次数量必填
            return;
        } else {
            const forbidden = /^[0-9]*[1-9][0-9]*$/.test(this.options2.controls.quantity.value);
            if (!forbidden) {
                this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_8'), '✖'); // 券批次填写格式不正确
                return;
            }
        }
        if (!this.options2.controls.des.value) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_3'), '✖'); //  券批次描述必填
            return;
        }
        if (!this.options2.controls.timeBegin.value) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_4'), '✖'); //  券批次开始时间必选
            return;
        }
        if (!this.options2.controls.timeEnd.value) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_5'), '✖'); //  券批次结束时间必选
            return;
        }
        this.btuDis = true;
        this.batch.quantity = this.options2.controls.quantity.value;
        this.batch.balance = this.options2.controls.quantity.value;
        this.batch.couponId = this.sysPara.con_main_ID;
        this.batch.number = null;
        this.batch.createdBy = sessionStorage.getItem('username');
        this.batch.createdDate = null;
        this.batch.id = null;
        this.batch.lastModifiedBy = null;
        this.batch.lastModifiedDate = null;
        this.batch.timeBegin = this.couponService.formatToZoneDateTime(this.options2.controls.timeBegin.value);
        this.batch.timeEnd = this.couponService.formatToZoneDateTime(this.options2.controls.timeEnd.value);
        this.batch.description = this.couponService.formatToZoneDateTime(this.options2.controls.des.value);
        this.couponService.createBatch(this.batch).pipe().subscribe(
            res => {
                if (res.status === 200 || res.status === 201) {
                    // this.btuDis = false;
                    this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_6'), '✖');  // 保存成功！！！
                    this.router.navigateByUrl('apps/CouponLotComponent');
                }
            },
            error1 => {
                this.btuDis = false;
            }
        );
    }

    // 获取优惠券的信息
    getCoupon() {
        if (this.sysPara.con_main_ID !== undefined && this.sysPara.con_main_ID !== 'undefined') {
            this.couponService.getCouponCouponMaintainById(this.sysPara.con_main_ID).pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    data_ => {
                        this.con_main = data_;
                        this.previewImg();
                        this.couponService.getStoresNameNO(this.con_main.store).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                            const st_ = res['storeVMS'];
                            this.con_main.store = '';
                            for (let i = 0; i < st_.length; i++) {
                                if (i === st_.length - 1) {
                                    this.con_main.store = this.con_main.store + st_[i]['storeName'];
                                } else {
                                    this.con_main.store = this.con_main.store + st_[i]['storeName'] + ',';
                                }
                            }
                            this.initCouponSource('detail');
                        });
                        this.loading.hide();
                    }
                );
        }

    }

    // 打开选择券规则的弹框
    openChooseCouponLot(CouponMaintainDialog) {
        if (!this.dialog.getDialogById('CouponMaintainDialogClass')) {
            this.dialog.open(CouponMaintainDialog, {
                id: 'MerchantsSelectTagClass',
                width: '80%'
            }).afterClosed().subscribe(res => {
                if (res) {
                    this.sysPara.addHasChoose = true;
                    this.sysPara.con_main_ID = this.selectedTag['id'];
                    this.con_main = this.selectedTag;
                    this.sysPara.hasChoose = false;
                    this.previewImg();
                    this.couponService.getStoresNameNO(this.con_main.store).pipe(takeUntil(this._unsubscribeAll)).subscribe(res1 => {
                        const st_ = res1['storeVMS'];
                        this.con_main.store = '';
                        for (let i = 0; i < st_.length; i++) {
                            if (i === st_.length - 1) {
                                this.con_main.store = this.con_main.store + st_[i]['storeName'];
                            } else {
                                this.con_main.store = this.con_main.store + st_[i]['storeName'] + ',';
                            }
                        }
                        this.initCouponSource('hasChoose');
                    });

                    this.sysPara.CouponEditOK = CouponParameter.CouponMaintainID_Change + '&&' + this.selectedTag['id'];
                } else {
                    this.selectedTag = null;
                    this.selectedTag = this.con_main;
                }
            });
        }
    }

    // 拿到值
    MTagSelect(event) {
        this.selectedTag = event;
    }

    // 初始化券规则的信息
    initCouponSource(p) {
        let hx_time = null;
        let use_time = null;
        let rule_type = null;
        let pickupRule = null;
        let canGif = null;
        let canReturn = null;
        let canRefund = null;
        if (p === 'start') {
            hx_time = null;
            this.sysPara.hasChoose = true;
        } else {
            if (this.con_main.expireRule === CouponParameter.PERIOD) {
                hx_time = this.dateTransform.transform(this.con_main.expireRuleTimeBegin) + ' - ' + this.dateTransform.transform(this.con_main.expireRuleTimeEnd); // 核销周期
            } else if (this.con_main.expireRule === CouponParameter.expireRule_MANYMINUTE) {
                hx_time = this.translate.instant('ElectronicVoucherManagement.CouponLot.receive') + this.con_main.expireRuleMinute + this.translate.instant('ElectronicVoucherManagement.CouponLot.hourEffective'); // 领取  小时内有效
            } else if (this.con_main.expireRule === CouponParameter.expireRule_MANYDAYS) {
                hx_time = this.translate.instant('ElectronicVoucherManagement.CouponLot.receive') + this.con_main.expireRuleMinute + this.translate.instant('ElectronicVoucherManagement.CouponLot.dayEffective'); // 领取  天内有效
            } else {
                hx_time = this.translate.instant('ElectronicVoucherManagement.CouponLot.receive') + this.translate.instant('ElectronicVoucherManagement.CouponLot.toDayEffective'); // 领取  领取当日有效
            }

            use_time = this.dateTransform.transform(this.con_main.timeBegin) + ' - ' + this.dateTransform.transform(this.con_main.timeEnd); // 领取周期

            if (this.con_main.rule === CouponParameter.FULL_BREAK_DISCOUNT) {
                rule_type = this.translate.instant('ElectronicVoucherManagement.CouponLot.FULL_BREAK_DISCOUNT'); // 满减券
            } else if (this.con_main.rule === CouponParameter.CASH) {
                rule_type = this.translate.instant('ElectronicVoucherManagement.CouponLot.CASH');  // 现金券
            } else if (this.con_main.rule === CouponParameter.COUPON_OF_GOODS) {
                rule_type = this.translate.instant('ElectronicVoucherManagement.CouponLot.COUPON_OF_GOODS');  // 商品券
            } else {
                if (this.con_main.rule === this.translate.instant('ElectronicVoucherManagement.CouponLot.FULL_BREAK_DISCOUNT')) { // 满减券
                    rule_type = this.translate.instant('ElectronicVoucherManagement.CouponLot.FULL_BREAK_DISCOUNT'); // 满减券
                } else if (this.con_main.rule === '现金券') { // 现金券
                    rule_type = this.translate.instant('ElectronicVoucherManagement.CouponLot.CASH'); // 现金券
                } else {
                    rule_type = this.translate.instant('ElectronicVoucherManagement.CouponLot.COUPON_OF_GOODS');  // 商品券
                }
            }



            /* if (this.con_main.pickupRule === CouponParameter.PICKUPRULEONCEEVERYDAY){
                 pickupRule = '每日限领一次';
             } else if (this.con_main.pickupRule === CouponParameter.PICKUPRULEONLYONCE){
                 pickupRule = '仅领一次';
             } else if (this.con_main.pickupRule === CouponParameter.PICKUPRULEREPICKUPAFTERCLEAR){
                 pickupRule = '核销再领';
             } else {
                 pickupRule = '第三方限制';
             }*/
            pickupRule = this.translate.instant('ElectronicVoucherManagement.CouponLot.pickupRuleDe');  // 第三方限制
            if (this.con_main.canGift) {
                canGif = this.translate.instant('ElectronicVoucherManagement.CouponLot.yes'); // 是
            } else {
                canGif = this.translate.instant('ElectronicVoucherManagement.CouponLot.no');  // 否
            }
            if (this.con_main.canReturn) {
                canReturn = this.translate.instant('ElectronicVoucherManagement.CouponLot.yes');  // 是
            } else {
                canReturn = this.translate.instant('ElectronicVoucherManagement.CouponLot.no');  // 否
            }
            // 退款退券
            if (this.con_main.returnAfterRefund) {
                canRefund = this.translate.instant('ElectronicVoucherManagement.CouponLot.yes');  // 是
            } else {
                canRefund = this.translate.instant('ElectronicVoucherManagement.CouponLot.no');  // 否
            }

        }

        if (p === 'detail') {
            if (this.con_main.source === CouponParameter.DEFAULT) {
                this.con_main.source = this.translate.instant('ElectronicVoucherManagement.CouponLot.sourceDEFAULT'); //  精准营销
            } else {
                this.con_main.source = this.translate.instant('ElectronicVoucherManagement.CouponLot.sourceCRM');  //  股份会员
            }
        }
        /* if (this.con_main.description !== null && this.con_main.description !== undefined) {
             const des = this.con_main.description.replace(/<[^>]+>/g, ' ');
             this.con_main.description = des;
         }*/
        this.options.controls.quantity.patchValue(this.con_main.capacity);
        this.options.controls.quantity.disable();

        this.sysPara.divSource = [
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.name'),
                value: this.con_main.name,
                type: 'text'
            }, //   电子券名称
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.source'),
                value: this.con_main.source,
                type: 'text'
            }, // 电子券来源
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.id'),
                value: this.con_main.id,
                type: 'text'
            }, //  ID
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.type'),
                value: rule_type,
                type: 'text'
            }, // 电子券类型
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.receivingCycle'),
                value: use_time,
                type: 'text'
            }, // 电子券领取周期
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.WriteOffPeriod'),
                value: hx_time,
                type: 'text'
            }, // 电子券核销周期
            {name: this.translate.instant('ElectronicVoucherManagement.CouponLot.img'), value: null, type: 'img'}, // 券面图案
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.numberLim'),
                value: this.con_main.level,
                type: 'text'
            }, // 会员限制
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.maxPickup'),
                value: this.con_main.maxPickup,
                type: 'text'
            }, // 领取总量
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.maxPickupDaily'),
                value: this.con_main.maxPickupDaily,
                type: 'text'
            }, // 单日领取
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.limitPerOrder'),
                value: this.con_main.limitPerOrder,
                type: 'text'
            }, // 每单限用
            /*{name: '领取限制' ,     value: pickupRule , type: 'text' },*/
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.canRefund'),
                value: canRefund,
                type: 'text'
            }, // 退款退券
            {name: this.translate.instant('ElectronicVoucherManagement.CouponLot.canGif'), value: canGif, type: 'text'}, // 支持转送
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.canReturn'),
                value: canReturn,
                type: 'text'
            }, //  支持回收
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.bizType'),
                value: this.con_main.bizType,
                type: 'textBS'
            }, // 业态限制
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.store'),
                value: this.con_main.store,
                type: 'textBS'
            }, // 店铺限制
            {
                name: this.translate.instant('ElectronicVoucherManagement.CouponLot.description'),
                value: this.con_main.description,
                type: 'quillText'
            }, // 使用说明
        ];
        //  this.quillDes = this.con_main.description;
        if (p !== 'detail') {
            const end_e = new Date(this.con_main.timeEnd); // 券批次结束领取时间
            this.onSourceDate(end_e, this.endTime, this.StartTime, 'start');
            this.onSourceDate1(end_e, this.endTime, this.StartTime, 'start');
        }

    }


    previewImg() {
        this.couponService.CouponShowImg(this.con_main.image).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const fileReader = new FileReader();
                fileReader.readAsDataURL(res);
                fileReader.onloadend = (res1) => {
                    const result = res1.target['result'];
                    //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                    this.sysPara.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                };
            });
    }

    onSourceDate(event, endTime, StartTime, p) {

        const begin_e = new Date(this.con_main.timeBegin); // 券批次开始领取时间
        const end_e = new Date(this.con_main.timeEnd); // 券批次结束领取时间
        // endTime.picker.set('minDate', begin_e);
        StartTime.picker.set('minDate', begin_e);
        if (p === 'start') {
            StartTime.picker.set('maxDate', end_e);
        }

        if (p !== 'start') {
            end_e.setHours(23);
            end_e.setMinutes(59);
            end_e.setSeconds(59);
            endTime.picker.set('minDate', event);
            endTime.picker.set('maxDate', end_e);
        }
        //  'timeBegin' === p ? endTime.picker.set('minDate', end_e) : StartTime.picker.set('maxDate', begin_e);
    }

    onSourceDate1(event, endTime, StartTime, p) {
        /* event.setHours(23);
         event.setMinutes(59);
         event.setSeconds(59);*/
        const end_e = new Date(this.con_main.timeEnd); // 券批次结束领取时间
        /* end_e.setHours(23);
         end_e.setMinutes(59);
         end_e.setSeconds(59);*/
        const begin_e = new Date(this.con_main.timeBegin); // 券批次开始领取时间
        if (p === 'start') {
            endTime.picker.set('minDate', begin_e);
        }

        endTime.picker.set('maxDate', end_e);
        if (p !== 'start') {
            const begin_t = new Date(this.con_main.timeBegin); // 券批次开始领取时间
            StartTime.picker.set('minDate', begin_t);
            StartTime.picker.set('maxDate', event);
        }

        // StartTime.picker.set('maxDate', end_e);
        // 'timeBegin' === p ? endTime.picker.set('minDate', end_e) : StartTime.picker.set('maxDate', event);
    }


    // 点击按扭的时候 后台点击input框打开上传文件
    importCodeChange(UpLoadTxt) {
        // const intutDom  =  document.getElementById('BatchImportCodeInput');
        // intutDom.click();

        this.upImg_ = new UpImg();
        this.upImg_.limitM = 2097152;
        this.upImg_.limitType = 'text/plain';
        this.upImg_.uploadDesc = this.translate.instant('ElectronicVoucherManagement.CouponLot.tips_7'); // 只能上传txt格式的文件，且文件内容需换行
        if (!this.dialog.getDialogById('UpFileClass')) {
            this.dialog.open(UpLoadTxt, {id: 'UpFileClass', width: '500px', height: '245px', position: {top: '200px'}});
        }
    }

    realUpload(e) {
        const inputValue = document.getElementById('showInputValue');
        inputValue['value'] = e.fileName;
    }


    // 放大图片。先设置一个弹框类似的放大。后期可整改
    openBigImg(preBigImg){
        if (!this.dialog.getDialogById('preBigImgClass')) {
            this.dialog.open(preBigImg, {id: 'preBigImgClass',   width: '690px', height: '150px'});
        }
    }


    // 预览事件
    openPreData(PreDetailTe, data) {
        this.previewData = '';
        this.previewData = data.replace(/,/g, '\n\n');
        if (!this.dialog.getDialogById('PreDetailCouClass')) {
            this.dialog.open(PreDetailTe, {id: 'PreDetailCouClass', width: '600px', height: '550px', hasBackdrop: true});
        }
    }




    initTimeConfig() {
        this.configStart = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
        this.configEnd = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '23',
            defaultMinute: '59',
            defaultSeconds: '59'
        };
    }

    toCancel() {
        this.router.navigateByUrl('apps/CouponLotComponent');
    }


}

// 系统参数配置
export class SysPara {
    configEnd: any; // 时间配置参数
    configStart: any; // 时间配置参数
    DetailShow = true;  // html页面判断是详情还是添加页面
    addHasChoose = false; // 新增页面，是否已经选择了一条券规则
    con_main_ID: string;  // 传到组件的券规则的ID，用于查询对应的一条数据
    CouponID_Z = CouponParameter.COUPONLOTID; // 当前页面的标识。表示这个是从券批次页面过去的
    groupStruts: boolean;
    CouponEditOK: string;
    groupRadioBtu: boolean;
    batchTitle: string;
    divSource: Array<{ name: any, value: any, type: any }> = [];
    hasChoose: boolean;
    imgSrc: any;
}


// 上传文件
export class UpImg {
    ProgressLoad: number;  // 上传长度
    notUploading: boolean; // 是否在上传
    UpLoadStatus = false;  // 上传按钮的状态，是否可 用
    FinishStatus = true;   // 完成按钮的状态  是否可用
    limitM: number;       // 上传文件的限制大小
    limitType: string;   // 上传类型限制
    uploadDesc: string; // 上传文件限制描述
}

export function batchNoValidator(nameRe: RegExp, tips15, tips17): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) {
            const er_ = {forbiddenCh: tips15, forbiddenChNo: true, required: true}; //  此项必填
            return er_;
        }
        const forbidden = nameRe.test(control.value);
        const err_ = forbidden === true ? {forbiddenCh: tips17, forbiddenChNo: true, required: true} : null; // 请输入正整数
        return err_;
    };
}
