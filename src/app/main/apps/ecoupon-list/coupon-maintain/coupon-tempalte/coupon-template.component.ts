import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {
    AfterAdd,
    CheckBoxSelectStruts,
    CouponMaintainEntity,
    ECouponServiceService, NumberLimitSource,
    SystemParameter, TagSource,
    UpImg
} from '../../../../../services/EcouponService/ecoupon-service.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {CouponParameter} from '../../../../../services/EcouponService/CouponParameter';
import {takeUntil} from 'rxjs/operators';
import {environment} from '../../../../../../environments/environment.hmr';
import {fuseAnimations} from '../../../../../../@fuse/animations';

@Component({
    selector: 'app-coupon-tempalte',
    templateUrl: './coupon-template.component.html',
    styleUrls: ['./coupon-template.component.scss'],
    animations: fuseAnimations
})
export class CouponTemplateComponent implements OnInit, OnDestroy, OnChanges {
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('expireRuleTimeBegin', {static: true}) expireRuleTimeBegin: ElementRef;
    @ViewChild('expireRuleTimeEnd', {static: true}) expireRuleTimeEnd: ElementRef;
    @ViewChild('StartTime', {static: true}) StartTime: ElementRef;
    @ViewChild('endTime', {static: true}) endTime: ElementRef;
    @ViewChild('quillEdit', {static: true}) quillEdit;
    @Input()
    CouponID: string;
    @Input()  // 获取当前详情页的ID
    CouponMaintainID: string;
    @Input()
    CouponEditOK: string; // 捕捉点击编辑和取消按钮和保存的动作
    @Input()
    IDChanges: string;
    @Output()
    navigateUrl: EventEmitter<any> = new EventEmitter();
    editor;
    numberLimitSource: NumberLimitSource;    // 会员限制
    BackupData: CouponMaintainEntity; // 当前页面数据备份
    CheckBoxStruts: CheckBoxSelectStruts;       // 当前页面checkbox选中框的状态集合
    AfterAddSource: AfterAdd;                 // 关于添加发放后数量的变量集合
    upImgSource: UpImg;                          // 关于上传文件的变量集合
    CouponSource: Array<{ id: string, name: string }> = []; // 来源下拉选择框
    CouponType: Array<{ id: string, name: string }> = []; // 券类型
    CouponTermOfValiditySource: Array<{ id: string, name: string }> = []; // 选择券有效期
    CouponMaintainDataSource: CouponMaintainEntity;  /// 接收一个详情数据
    systemParameter: SystemParameter;            // 一些当前页控制参数
    tagSource: TagSource; // 弹出框
    options: FormGroup;
    // 后期可能不需要的
    CouponDays: Array<{ id: string, name: string }> = [];  // 前台页面展示标签集合 后面可能不需要
    quillConfig: any; // 富文本编辑框的配置项
    configEnd: any;
    configStart: any;
    configEndTwo: any;
    configStartTwo: any;
    tlKey = '';

    constructor(
        public dialog: MatDialog,
        private document: ElementRef,
        private couponService: ECouponServiceService,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private routeInfo: ActivatedRoute,
        private sanitizer: DomSanitizer,
        private dateTransform: NewDateTransformPipe,
        private translate: TranslateService,
    ) {
        this.options = new FormBuilder().group({
            id: new FormControl({value: null, disabled: true}, [Validators.required]),
            number: new FormControl({value: null, disabled: true}, [Validators.required]), // 内部编码
            batchNo: new FormControl({value: null, disabled: true}, [Validators.required]),  // 券批次编号
            name: new FormControl({value: null, disabled: true}, [Validators.required]), // 券名称
            expireRuleMinute: new FormControl({value: '1', disabled: true}, [Validators.required]), // 领取后xxx expireRuleMinute
            expireRuleDays: new FormControl({
                value: CouponParameter.expireRule_MANYDAYS,
                disabled: true
            }, [Validators.required]), // 当日生效，参数为1 || 暂时作为单位使.提交的时候需要把这个改成空
            expireRuleTimeBegin: new FormControl({value: null, disabled: true}, [Validators.required]), // 核销开始时间
            expireRuleTimeEnd: new FormControl({value: null, disabled: true}, [Validators.required]), // 核销结束时间
            expireRule: new FormControl({value: CouponParameter.PERIOD, disabled: true}, [Validators.required]), // 核销规则
            pickupRule: new FormControl({value: 'DEFAULT', disabled: true}, [Validators.required]), // 领取规则  过期规则 expireRule // PERIOD 是【固定周期】，MANYDAYS 是【领取后xxx日内有效】，MANYMINUTE :【领取后xxx分钟内有效】
            clearRule: new FormControl({value: '', disabled: true}, [Validators.required]), // 核销规则
            rule: new FormControl({value: CouponParameter.FULL_BREAK_DISCOUNT, disabled: true}, [Validators.required]), // -- 券规则类型
            source: new FormControl({value: CouponParameter.BCIA_TT_CRM, disabled: true}, [Validators.required]), // -- 来源
            timeBegin: new FormControl({value: null, disabled: true}, [Validators.required]), // 领取开始时间
            timeEnd: new FormControl({value: null, disabled: true}, [Validators.required]), // 领取结束时间
            status: new FormControl({value: null, disabled: true}, [Validators.required]), // 状态
            image: new FormControl({value: null, disabled: false}, [Validators.required]), // 卡面
            canReturn: new FormControl({value: false, disabled: true}, [Validators.required]), // 支持回收
            canGift: new FormControl({value: false, disabled: true}, [Validators.required]), // 支持转送
            returnAfterRefund: new FormControl({value: false, disabled: true}, [Validators.required]), // 退款退券
            bizType: new FormControl({value: null, disabled: true}, [Validators.required]), // 业态
            store: new FormControl({value: null, disabled: true}, [Validators.required]), //  // 店铺    格式是 商场编号+店铺编号 类似BCIA123445,CY98484
            capacity: new FormControl({value: 100, disabled: true}, [Validators.required]), // // 券数量 -1代表不限量
            alertThreshold: new FormControl({value: 0, disabled: true}, [Validators.required]), // 预警阈值
            description: new FormControl({value: null, disabled: false}, [Validators.required]), // 券说明
            outId: new FormControl({value: null, disabled: true}, [Validators.required]),
            threshold: new FormControl({value: null, disabled: true}, [Validators.required]),     // 最低消费金额  // 满额
            amount: new FormControl({value: null, disabled: true}, [Validators.required]),   // 券面额     amount         // 减额
            remarks: new FormControl({value: '0', disabled: true}, [Validators.required]),
            showValidity: new FormControl({value: 0, disabled: true}, [Validators.required]),
            maxPickupDaily: new FormControl({value: null, disabled: true}, [Validators.required]), // 每日最大领取数 单日领取
            limitPerOrder: new FormControl({value: null, disabled: true}, [Validators.required]),  //  每单限用数量
            maxPickup: new FormControl({value: null, disabled: true}, [Validators.required]),  //  领取总量、
            level: new FormControl({value: null, disabled: true}, [Validators.required]),  //
            createdBy: new FormControl({value: null, disabled: true}, [Validators.required]),  //  会员限制
            createdDate: new FormControl({value: null, disabled: true}, [Validators.required]),  //
            lastModifiedBy: new FormControl({value: null, disabled: true}, [Validators.required]),  //
            lastModifiedDate: new FormControl({value: null, disabled: true}, [Validators.required]),  //
            canRefund: new FormControl({value: false, disabled: true}, [Validators.required]),  // 是否可退款退券【目前】 直接false即可  暂时没用到
            enabled: new FormControl({value: true, disabled: true}, [Validators.required]),  //
            maxGift: new FormControl({value: 0, disabled: true} , [Validators.required]), // 领取转送次数，暂时没有这个字段，这个是自己添加的。如果支持转送就让填不支持就不给填

        });
        this.tlKey = localStorage.getItem('currentProject');
    }

    ngOnInit() {
        this.initSelectTagData(); // 初始化选择框
        this.initConfig(); // 初始化时间选择框 和 上传选择择
        this.initPara(); // 初始化参数
        setTimeout(() => {
            this.getCouponMaintainData(); // 获取当前页面数据
        }, 200);
    }


    // 获取当前页面的值
    getCouponMaintainData() {
        this.loading.show();
        if (this.CouponMaintainID !== CouponParameter.COUPONLOTADD_ID && this.CouponMaintainID !== CouponParameter.COUPONRULE_ADDTU) {
            this.systemParameter.CouponAdd = false;
            if (this.CouponID === CouponParameter.COUPONLOTID) {
                // 以前券批次的内定ID。现在可不用了，这段现在可以不用考虑
            }
            if (this.CouponMaintainID !== undefined && this.CouponMaintainID !== 'undefined') {
                // 详情
                this.getCouponCouponMaintainById();
            }
        } else if (this.CouponMaintainID === CouponParameter.COUPONRULE_ADDTU) {
            this.loading.hide();
            // 新增
            this.systemParameter.CouponAdd = true;
            // 设置添加页面的可用与不可用
            this.CouponMaintainDataSource.rule = CouponParameter.FULL_BREAK_DISCOUNT;
            this.options.get('name').enable();
            this.options.get('outId').enable();
            this.options.get('source').enable();
            this.options.get('description').enable();
            this.systemParameter.CouponMaintainUPIMGisabled = false;
            if (this.tlKey === 'hx') {
                this.options.get('source').patchValue(CouponParameter.DEFAULT);
                this.ChangeSourceType();
            }

        }
    }

    // 获取详情
    getCouponCouponMaintainById() {
        this.couponService.getCouponCouponMaintainById(this.CouponMaintainID).pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                data_ => {
                    const d_str = JSON.stringify(data_);
                    this.BackupData = JSON.parse(d_str);
                    this.systemParameter.divDisabled = true;
                    this.setSourceValue(data_, CouponParameter.C_Frist);
                    this.loading.hide();
                },
                error1 => {
                    this.loading.hide();
                }, () => {
                    this.loading.hide();
                }
            );
    }


    setSourceValue(data_, p) {
        if (!data_) {
            return;
        }
        data_['createdDate'] = this.dateTransform.transform(data_['createdDate']);
        data_['lastModifiedDate'] = this.dateTransform.transform(data_['lastModifiedDate']);
        this.setTimeValue(data_);


        if (data_.source === CouponParameter.BCIA_TT_CRM) {
            data_.source = this.translate.instant('ElectronicVoucherManagement.SelectBCIA_TT_CRM_30');
        } else {
            data_.source = this.translate.instant('ElectronicVoucherManagement.SelectDEFAULT');
        }

        this.options.patchValue(data_);
        if (data_['expireRule'] === CouponParameter.expireRule_MANYDAYS || data_['expireRule'] === CouponParameter.expireRule_MANYMINUTE) {
            this.systemParameter.timeOrDay = false;
            this.AfterAddSource.inputCouponNumber = data_['expireRuleMinute'];
            this.options.controls.expireRuleDays.patchValue(data_['expireRule']);
            this.options.controls.expireRule.patchValue(CouponParameter.expireRule_MANYDAYS);
        }
        if (data_['showValidity'] !== 0 && data_['showValidity'] !== '0') {
            this.systemParameter.slideOnOff = true;
            this.systemParameter.slideDisabled = true;
        } else {
            this.systemParameter.slideOnOff = false;
            this.systemParameter.slideDisabled = true;
        }

        this.initEditShow(data_, p);
        this.setDetailCheck(data_, 'canReturn', 'CouponCanReturnYes', 'CouponCanReturnNo');
        this.setDetailCheck(data_, 'canGift', 'CouponCanGifYes', 'CouponCanGifNO');
        this.setDetailCheck(data_, 'returnAfterRefund', 'returnAfterRefundTrue', 'returnAfterRefundFalse');
        this.CouponMaintainDataSource = data_;
        this.upImgSource.imgID = data_.image;
    }

    // 点击取消
    toCancel() {
        setTimeout(() => {
            this.setSourceValue(this.BackupData, 'cancel');
            this.reductionInit();
        });
    }

    // 还原不可编辑状态
    reductionInit() {
        this.systemParameter.CouponMaintainOutIdDisabled = true;
        this.systemParameter.StoreDis = true;
        this.systemParameter.CouponMaintainUPIMGisabled = true;
        this.options.disable();
    }

    // 改变开关状态
    changeSlide(e) {
        this.systemParameter.slideOnOff = e.checked;
        if (this.systemParameter.slideOnOff) {
            if (this.CouponMaintainID === CouponParameter.COUPONRULE_ADDTU) {
                this.options.get('showValidity').reset({value: '500', disabled: false}, [Validators.required]);
            } else {
                if (this.options.get('showValidity').value === '0') {
                    this.options.get('showValidity').reset({value: '500', disabled: false}, [Validators.required]);
                } else {
                    this.options.get('showValidity').enable();
                }
            }
        } else {
            this.options.get('showValidity').reset({value: '0', disabled: true}, [Validators.required]);
        }
    }

    setTimeValue(data_) {
        if (this.IsNull(this.dateTransform.transform(data_['timeBegin'])) && this.IsNull(this.dateTransform.transform(data_['timeEnd']))) {
            if (this.dateTransform.transform(data_['timeBegin']).indexOf('Invalid') === -1 && this.dateTransform.transform(data_['timeEnd']) === -1) {
                data_['timeBegin'] = this.dateTransform.transform(data_['timeBegin']);
                data_['timeEnd'] = this.dateTransform.transform(data_['timeEnd']);
            }
        }

        if (this.IsNull(this.dateTransform.transform(data_['expireRuleTimeBegin'])) && this.IsNull(this.dateTransform.transform(data_['expireRuleTimeEnd']))) {
            if (this.dateTransform.transform(data_['expireRuleTimeBegin']).indexOf('Invalid') === -1 && this.dateTransform.transform(data_['expireRuleTimeEnd']) === -1) {
                data_['expireRuleTimeBegin'] = this.dateTransform.transform(data_['expireRuleTimeBegin']);
                data_['expireRuleTimeEnd'] = this.dateTransform.transform(data_['expireRuleTimeEnd']);
            }
        }
    }

    // 详情时设置 退款退券、支持转送、支持回收的check框
    setDetailCheck(data_, p, pYes, pNo) {
        if (data_[p] === true) {
            this.CheckBoxStruts[pYes] = true;
            this.CheckBoxStruts[pNo] = false;
        } else {
            this.CheckBoxStruts[pYes] = false;
            this.CheckBoxStruts[pNo] = true;
        }
    }

    // 设置一些店铺业态选择限制
    initEditShow(data_, p) {
        this.tagSource.CouponNumberTag = [];
        this.tagSource.BusinessNumberTag = [];
        this.tagSource.StoreNumberTag = [];
        const level = data_['level'];
        const bizType = data_['bizType'];
        const store = data_['store'];
        if (level) {
            this.setTagEdit(level, 'CouponNumberTag', 'NumberLabel', 'NumberString'
                , 'NumberLabelPre', p, 'levelName');
        } else {
            if (p === 'cancel') {
                this.clearTagsData('CouponNumberTag', 'NumberLabel', 'NumberString', 'NumberLabelPre');
            }
        }
        if (bizType) {
            this.setTagEdit(bizType, 'BusinessNumberTag', 'BusinessLabel', 'BusinessString',
                'BusinessLabelPre', p, 'name');
        } else {
            if (p === 'cancel') {
                this.clearTagsData('BusinessNumberTag', 'BusinessLabel', 'BusinessString', 'BusinessLabelPre');
            }
        }
        if (store) {
            if (this.tagSource.StoreNumberTag = []) {
                this.sarchStoreByStoreNo(store);
            }
        } else {
            if (p === 'cancel') {
                this.clearTagsData('StoreNumberTag', 'StoreLabel', 'StoreString', 'StoreLabelPre');
            }
        }
    }

    sarchStoreByStoreNo(store) {

        this.couponService.getStoresNameNO(store).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.tagSource.StoreNumberTag = res['storeVMS'];
                const store_ = JSON.stringify(this.tagSource.StoreNumberTag);
                this.tagSource.StoreLabel = JSON.parse(store_);
                for (let i = 0; i < this.tagSource.StoreLabel.length; i++) {
                    if (i === this.tagSource.StoreLabel.length - 1) {
                        this.tagSource.StoreString = this.tagSource.StoreString + this.tagSource.StoreLabel[i].storeName;
                    } else {
                        this.tagSource.StoreString = this.tagSource.StoreString + this.tagSource.StoreLabel[i].storeName + ',';
                    }
                }
                if (this.tagSource.StoreLabel.length === 0) {
                    this.tagSource.StoreLabelPre = false;
                } else {
                    this.tagSource.StoreLabelPre = true;
                }
                this.setSBDis('bizTypeDis', this.tagSource.StoreLabel.length);
            }
        );

    }

    clearTagsData(tagName, labelName, strName, butShow) {
        this.tagSource[tagName] = [];
        this.tagSource[labelName] = [];
        this.tagSource[strName] = '';
        this.tagSource[butShow] = false;
    }

    // 大致参数与弹框部分一致
    setTagEdit(data, tagName, labelName, strName, butShow, p, filedName) {
        if (this.tagSource[tagName] = []) {

            const arr_ = [];
            if (data.includes(',')) {
                const len_d = data.split(',');
                for (let i = 0; i < len_d.length; i++) {
                    const arr = {};
                    arr[filedName] = len_d[i];
                    arr['selected'] = true;
                    arr_[i] = arr;
                }
            } else {
                const arr = {};
                arr[filedName] = data;
                arr['selected'] = true;
                arr_.push(arr);
            }

            this.tagSource[labelName] = arr_;
            const tag = JSON.stringify(this.tagSource[labelName]);
            const tag_json = JSON.parse(tag);
            this.tagSource[strName] = '';
            for (let i = 0; i < tag_json.length; i++) {
                if (i === tag_json.length - 1) {
                    this.tagSource[strName] = this.tagSource[strName] + tag_json[i][filedName];
                } else {
                    this.tagSource[strName] = this.tagSource[strName] + tag_json[i][filedName] + ',';
                }
            }

            const len = this.tagSource[labelName].length;
            len === 0 ? this.tagSource[butShow] = false : this.tagSource[butShow] = true; // 显示预览按钮
            this.tagSource[tagName] = tag_json;
        }
    }


    // 详情页修改可编辑状态
    ChangeEditStruts() {
        if (this.CouponMaintainDataSource.source === this.translate.instant('ElectronicVoucherManagement.SelectBCIA_TT_CRM_30')) {
            this.systemParameter.CouponMaintainOutIdDisabled = true;
            this.systemParameter.CouponMaintainUPIMGisabled = false;
            this.systemParameter.bizTypeDis = true;
            this.systemParameter.StoreDis = true;
            this.systemParameter.slideOnOff = false;
            this.systemParameter.slideDisabled = true;
            this.options.disable();
            this.options.get('name').enable();
            this.options.get('description').enable();
        } else {
            this.systemParameter.CouponMaintainOutIdDisabled = false;
            this.systemParameter.CouponMaintainUPIMGisabled = false;
            this.setStoreBizDis();
            if (this.options.get('showValidity').value !== 0 && this.options.get('showValidity').value !== '0') {
                this.options.get('showValidity').enable();
                this.systemParameter.slideOnOff = true;
                this.systemParameter.slideDisabled = false;
            } else {
                this.systemParameter.slideOnOff = false;
                this.systemParameter.slideDisabled = false;
            }
            this.options.get('description').enable();
            this.options.get('outId').disable();
            this.options.get('name').enable();
            this.options.get('maxPickupDaily').enable();
            this.options.get('limitPerOrder').enable();
            this.options.get('maxPickup').enable();
            const re_ = this.options.get('canGift').value ;
            (re_ === true) ?  this.options.get('maxGift').enable() : this.options.get('maxGift').disable() ;
        }
    }

    setStoreBizDis() {
        if (this.tagSource.StoreLabel.length !== 0 && this.tagSource.BusinessLabel.length === 0) {
            this.systemParameter.bizTypeDis = true;
            this.systemParameter.StoreDis = false;
        } else if (this.tagSource.StoreLabel.length === 0 && this.tagSource.BusinessLabel.length !== 0) {
            this.systemParameter.StoreDis = true;
            this.systemParameter.bizTypeDis = false;
        } else if (this.tagSource.StoreLabel.length === 0 && this.tagSource.BusinessLabel.length === 0) {
            this.systemParameter.StoreDis = false;
            this.systemParameter.bizTypeDis = false;
        }
    }

    // 新增页面 改变券类型
    ChangeSourceType() {
        const source = this.options.get('source').value;
        if (source === CouponParameter.DEFAULT) {
            this.systemParameter.CouponMaintainOutIdDisabled = false;
            this.setStoreBizDis();
            this.options.enable();
            if (this.options.get('showValidity').value !== 0 && this.options.get('showValidity').value !== '0') {
                this.options.get('showValidity').enable();
                this.systemParameter.slideOnOff = true;
                this.systemParameter.slideDisabled = false;
            } else {
                this.options.get('showValidity').disable();
                this.systemParameter.slideOnOff = false;
                this.systemParameter.slideDisabled = false;
            }
            this.options.controls.outId.disable();
            const re_ = this.options.get('canGift').value ;
            (re_ === true) ?  this.options.get('maxGift').enable() : this.options.get('maxGift').disable() ;
        } else if (source === CouponParameter.BCIA_TT_CRM) {
            this.systemParameter.CouponMaintainOutIdDisabled = true;
            this.systemParameter.bizTypeDis = true;
            this.systemParameter.StoreDis = true;
            this.systemParameter.slideOnOff = false;
            this.systemParameter.slideDisabled = true;
            this.options.disable();
            this.options.get('description').enable();
            this.options.get('outId').enable();
            this.options.get('name').enable();
            this.options.get('source').enable();
        }
    }

    // 点击保存
    toSave() {
        // console.log(this.options.getRawValue() , '----row');
        this.navigateUrl.emit(this.options.getRawValue());
    }


    // 券类型的设置显示隐藏
    changeRuleTypeDesc() {
        this.CouponMaintainDataSource.rule = this.options.value['rule'];
    }

    // 选择电子券有效期
    changeCouponTermOfValidity() {
        // 固定周期
        CouponParameter.PERIOD
        === this.options.value['expireRule'] ? this.systemParameter.timeOrDay = true : this.systemParameter.timeOrDay = false;
    }

    onSourceDate(event, endTime, StartTime, p) {
        if (p === 'timeBegin') {
            // event.setHours(23);
            // event.setMinutes(59);
            // event.setSeconds(59);
        }
        'timeBegin' === p ? endTime.picker.set('minDate', event) : StartTime.picker.set('maxDate', event);
    }

    // 发放后数字增加
    AddCouponNumber(param) {
        const inputCouponNumber_value = this.document.nativeElement.querySelector('#inputCouponNumber').value;
        if ('' === inputCouponNumber_value) {
            this.AfterAddSource.inputCouponNumber = 1;
            this.options.controls.expireRuleMinute.patchValue(1);
        } else {
            this.options.controls.expireRuleMinute.patchValue(inputCouponNumber_value);
            this.AfterAddSource.inputCouponNumber = inputCouponNumber_value;
        }
        if ('removeDown' === param) {
            this.AfterAddSource.removeDown_UP_STRUTS = true;
            setTimeout(() => {
                if (this.AfterAddSource.removeDown_UP_STRUTS) {
                    const setRemoveID = setInterval(() => {
                        if (this.AfterAddSource.inputCouponNumber !== 1 && this.AfterAddSource.inputCouponNumber !== 0) {
                            this.AfterAddSource.inputCouponNumber--;
                        }
                    }, 10);
                    this.AfterAddSource.RemoveSetIntervalID.push({value: setRemoveID});
                }
            }, 1000);
        }
        if ('removeUp' === param) {
            this.AfterAddSource.removeDown_UP_STRUTS = false;
            this.AfterAddSource.RemoveSetIntervalID.forEach(res => {
                clearInterval(res.value);
            });

        }
        if ('AddDown' === param) {
            this.AfterAddSource.AddDown_UP_STRUTS = true;
            setTimeout(() => {
                if (this.AfterAddSource.AddDown_UP_STRUTS) {
                    const addDown = setInterval(() => {
                        this.AfterAddSource.inputCouponNumber++;
                    }, 10);
                    this.AfterAddSource.AddSetIntervalID.push({value: addDown});
                }
            }, 1000);
        }
        if ('AddUp' === param) {
            this.AfterAddSource.AddDown_UP_STRUTS = false;
            this.AfterAddSource.AddSetIntervalID.forEach(res => {
                clearInterval(res.value);
            });
        }

        if ('remove' === param) {
            if (this.AfterAddSource.inputCouponNumber !== 1 && this.AfterAddSource.inputCouponNumber !== 0) {
                this.AfterAddSource.inputCouponNumber--;
            }
        } else if ('add' === param) {
            this.AfterAddSource.inputCouponNumber++;
        }
    }

    // 打开上传文件选项框
    openUploadImgDialog(uploadImgDialog) {
        this.upImgSource.uploadDesc = this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_uploadDesc');
        if (!this.dialog.getDialogById('uploadImgDialog_')) {
            this.dialog.open(uploadImgDialog, {
                id: 'uploadImgDialog_',
                width: '500px',
                height: '245px',
                position: {top: '200px'},
                hasBackdrop: true,
            });
        }

    }

    // 打开预览的文件框
    openPreviewDialog(previewImgDialog) {
        // imgID  this.CouponMaintainDataSource.image
        if (this.upImgSource.imgID) {
            if (!this.dialog.getDialogById('previewImgDialog_')) {
                this.dialog.open(previewImgDialog, {
                    id: 'previewImgDialog_',
                    width: '690px',
                    height: '150px',
                    position: {top: '230px'},
                    hasBackdrop: true,
                });
            }
            this.upImgSource.imgLoding = true;
            this.couponService.CouponShowImg(this.upImgSource.imgID).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(res);
                    fileReader.onloadend = (res1) => {
                        const result = res1.target['result'];
                        this.upImgSource.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                        this.upImgSource.imgLoding = false;
                    };

                },
                error1 => {
                    this.upImgSource.imgLoding = false;
                });
        } else {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_CouponImage'), '✖');
            return;
        }

    }


    // 打开弹出框框
    /****
     *
     * @param Dialog   弹出框的 对象
     * @param styleClass 弹出框的class
     * @param tagName  列表选择的数据
     * @param labelName 页面显示的数据
     * @param strName  // matTooltip 显示的数据
     * @param butShow  // 是否显示 对应的预览按钮
     * @param p        // 参数  ---》 直接是options的字段。可直接利用此赋值
     * @param filedName  // 选中数据需要的字段名【每个数据获取的字段名是不同的】
     */
    openDialog(Dialog, styleClass, tagName, labelName, strName, butShow, p, filedName) {
        if (!this.dialog.getDialogById(styleClass)) {
            this.dialog.open(Dialog, {id: styleClass, width: '80%'}).afterClosed().subscribe(
                res => {
                    if (res) {

                        const tag = JSON.stringify(this.tagSource[tagName]);
                        this.tagSource[labelName] = JSON.parse(tag);
                        this.tagSource[strName] = '';
                        if (this.tagSource[labelName].length === undefined) {
                            this.tagSource[labelName] = [];
                        }

                        let store = '';

                        for (let i = 0; i < this.tagSource[labelName].length; i++) {
                            if (i === this.tagSource[labelName].length - 1) {
                                this.tagSource[strName] = this.tagSource[strName] + this.tagSource[labelName][i][filedName];
                                if (p === 'store') {
                                    store = store + this.tagSource[labelName][i].storeNo;
                                }
                            } else {
                                this.tagSource[strName] = this.tagSource[strName] + this.tagSource[labelName][i][filedName] + ',';
                                if (p === 'store') {
                                    store = store + this.tagSource[labelName][i].storeNo + ',';
                                }
                            }
                        }

                        const tagLen = this.tagSource[labelName].length;
                        tagLen === 0 ? this.tagSource[butShow] = false : this.tagSource[butShow] = true; // 显示预览按钮
                        // 这里是特殊情况，如果选择的业态就不能选择商铺，选择商铺就不能选择业态
                        if (p === 'bizType') {
                            this.setSBDis('StoreDis', tagLen);
                        }
                        if (p === 'store') {
                            this.setSBDis('bizTypeDis', tagLen);
                        }
                        this.options.get(p).patchValue(p === 'store' ? store : this.tagSource[strName]);

                    }
                }
            );
        }
    }

    setSBDis(disP, len) {
        len === 0 ? this.systemParameter[disP] = false : this.systemParameter[disP] = true;
    }

    // 业态选择事件
    businessTagSelect(event) {
        this.tagSource.BusinessNumberTag = event;
    }

    // 商户选择事件
    StoreSelect(event) {
        this.tagSource.StoreNumberTag = event;
    }

    // 会员限制选择事件
    MTagSelect(event) {
        this.tagSource.CouponNumberTag = event;
    }

    // 真正的上传
    realUpload(e) {
        if (!e.CouponFormData) {
            this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.Tips_changeFiles'), '✖');
            return;
        }
        this.couponService.CouponFileUpload(e.CouponFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                this.upImgSource.notUploading = false;
                this.upImgSource.UpLoadStatus = true;
                if (res.type === 1) {
                    this.upImgSource.ProgressLoad = (res.loaded / res.total) * 100;  // 上传长度
                }
                if (res.status === 200) {
                    this.upImgSource.ProgressLoad = 100;
                    this.upImgSource.notUploading = true;
                    this.upImgSource.FinishStatus = false;
                    this.upImgSource.imgID = res.body;
                    this.options.get('image').patchValue(res.body);
                }

            }
            , error1 => {
                this.upImgSource.UpLoadStatus = false;
                this.upImgSource.FinishStatus = true;
                this.loading.hide();
            });
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
                this.couponService.CouponFileUpload(data).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {

                    if (res.status === 200 && res.body !== undefined) {
                        const range = this.editor.getSelection(true);
                        const index = range.index + range.length;
                        this.editor.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '\n');
                        this.editor.setSelection(1 + range.index);
                        const des = this.options.get('description').value;
                        let des_copy = '';
                        if (this.IsNull(des)) {
                            des_copy = des + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        } else {
                            des_copy = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res.body + '">';
                        }
                        this.options.get('description').patchValue(des_copy);
                        this.editor.focus();
                    }
                }, error1 => {
                    this.loading.hide();
                });
            }
        });
        Imageinput.click();
    }


    // 支持转送 支持回收  退款退券  事件
    changeCheckBox(param, e, pYes, pNo, filed) {
        if ('yes' === param) {
            this.CheckBoxStruts[pYes] = e.checked;
            if (e.checked) {
                this.CheckBoxStruts[pNo] = false;
            } else {
                this.CheckBoxStruts[pNo] = true;
            }
            // this.setOptionReValue(filed , true);
        } else {
            this.CheckBoxStruts[pNo] = e.checked;
            if (e.checked) {
                this.CheckBoxStruts[pYes] = false;
            } else {
                this.CheckBoxStruts[pYes] = true;
            }
        }
        this.setOptionReValue(filed , this.CheckBoxStruts[pYes]);
    }

    setOptionReValue(filed , value){
        if (filed === 'CanReturn') {
            this.options.get('canReturn').patchValue(value);
        } else if (filed === 'CanGif') {
            if (value){
                this.options.get('maxGift').enable();
            } else {
                this.options.get('maxGift').patchValue(0);
                this.options.get('maxGift').disable();
            }
            this.options.get('canGift').patchValue(value);
        } else if (filed === 'canRefund') {
            this.options.get('returnAfterRefund').patchValue(value);
        }
    }


    // 打开详情
    openPreDetailMatDialog(PreDetailMatDialog, label) {
        this.systemParameter.ChooseLabelPre = label.replace(/,/g, '\n\n');
        if (!this.dialog.getDialogById('PreDetailMatDialog_')) {
            this.dialog.open(PreDetailMatDialog, {
                id: 'PreDetailMatDialog_',
                width: '60%',
                height: '70%',
                hasBackdrop: true
            });
        }
    }


    // 初始化时间、上传配置
    initConfig() {
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
        this.configStartTwo = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
        this.configEndTwo = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '23',
            defaultMinute: '59',
            defaultSeconds: '59'
        };
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
    }

    // 初始化选择框数据
    initSelectTagData() {
        this.CouponType = [ //
            {
                id: 'FULL_BREAK_DISCOUNT',
                name: this.translate.instant('ElectronicVoucherManagement.PageFirst.FULL_BREAK_DISCOUNT')
            }, // 满减券 //
            {id: 'CASH', name: this.translate.instant('ElectronicVoucherManagement.PageFirst.CASH')}, // 现金券
            {
                id: 'COUPON_OF_GOODS',
                name: this.translate.instant('ElectronicVoucherManagement.PageFirst.COUPON_OF_GOODS')
            }, // 商品券
        ];
        if (this.tlKey === 'hx') {
            this.CouponSource = [
                {
                    id: CouponParameter.DEFAULT,
                    name: this.translate.instant('ElectronicVoucherManagement.SelectDEFAULT')
                },
            ];
        } else {
            this.CouponSource = [
                {
                    id: CouponParameter.BCIA_TT_CRM,
                    name: this.translate.instant('ElectronicVoucherManagement.SelectBCIA_TT_CRM_30')
                },
                {
                    id: CouponParameter.DEFAULT,
                    name: this.translate.instant('ElectronicVoucherManagement.SelectDEFAULT')
                },
            ];
        }

        this.CouponTermOfValiditySource = [
            {
                id: CouponParameter.PERIOD,
                name: this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.FixedCycle')
            }, // 固定周期
            {
                id: CouponParameter.expireRule_MANYDAYS,
                name: this.translate.instant('ElectronicVoucherManagement.AddSecuritiesRules.EffectiveAfterIssuance')
            }, // 发放后生效
        ];
        this.CouponDays = [
            {
                id: CouponParameter.expireRule_MANYDAYS,
                name: this.translate.instant('ElectronicVoucherManagement.DayUnit')
            },
            {
                id: CouponParameter.expireRule_MANYMINUTE,
                name: this.translate.instant('ElectronicVoucherManagement.HourUnit')
            },
        ];
    }

    // 初始化参数
    initPara() {
        this.CheckBoxStruts = new CheckBoxSelectStruts();
        this.CouponMaintainDataSource = new CouponMaintainEntity();
        this.AfterAddSource = new AfterAdd();
        this.upImgSource = new UpImg();
        this.systemParameter = new SystemParameter();
        this.numberLimitSource = new NumberLimitSource();
        this.tagSource = new TagSource();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    IsNull(para) {
        if ('undefined' !== para && undefined !== para && '' !== para && null !== para) {
            return true;
        } else {
            return false;
        }
    }


    ngOnChanges(changes: SimpleChanges): void {
        for (const propName of Object.keys(changes)) {
            const chng = changes[propName];
            //  console.log(chng , '-----chng');
            //   console.log(propName , '-----propName');
            if (chng.currentValue !== undefined && chng.currentValue !== 'undefined') {
                const cur = JSON.stringify(chng.currentValue).replace('"', '').replace('"', '');
                if (propName === 'CouponEditOK' && cur === CouponParameter.COUPONRULE_SAVETU) {
                    this.ChangeEditStruts();
                } else if (propName === 'CouponEditOK' && cur === CouponParameter.COUPONRULE_EDITBTU) {
                    this.toCancel();
                } else if (propName === 'CouponEditOK' && cur === CouponParameter.COUPONRULE_REALSAVE) {
                    this.toSave();
                } else if (propName === 'CouponEditOK' && cur === CouponParameter.COUPONRULE_ADDTOSAVE) {
                    this.toSave();
                } else {
                    // 这里是之前讲券规则详情页面直接嵌入券批次页面的逻辑，暂时应该没有用到了
                    if (cur.indexOf('&&') !== -1) {
                        const cur_id = cur.split('&&');
                        let cur_change = '';
                        for (let y = 0; y < cur_id.length; y++) {
                            if (cur_id[y] === CouponParameter.CouponMaintainID_Change) {
                                cur_change = CouponParameter.CouponMaintainID_Change;
                            }
                            if (y === cur_id.length - 1) {
                                if (cur_change === CouponParameter.CouponMaintainID_Change) {
                                    this.CouponMaintainID = cur_id[y];
                                    this.getCouponMaintainData();
                                }
                            }

                        }
                    }

                }
            }

        }
    }


}
