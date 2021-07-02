import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {ECouponServiceService} from '../../../../services/EcouponService/ecoupon-service.service';
import {takeUntil} from 'rxjs/operators';
import {forkJoin, Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {environment} from '../../../../../environments/environment.hmr';
import {MarketingManageService} from '../marketing-manage.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';

@Component({
    selector: 'app-marketing-manage-add',
    templateUrl: './marketing-manage-add.component.html',
    styleUrls: ['./marketing-manage-add.component.scss'] ,
    animations: fuseAnimations
})
export class MarketingManageAddComponent implements OnInit, OnDestroy {
    constructor(private dialog: MatDialog, private marketingManageService: MarketingManageService,
                private router: Router, private snackBar: MatSnackBar,
                private eCouponServiceService: ECouponServiceService,
                private translate: TranslateService,
                private document: ElementRef,
                private fileTransferService: FileTransferService,
                private sanitizer: DomSanitizer,
                private loading: FuseProgressBarService,
                private couponService: ECouponServiceService,
    ) {
    }

    editorContent: any;
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('LableDialog', {static: true}) LableDialog: TemplateRef<any>;
    @ViewChild('AddTicketDialog', {static: true}) AddTicketDialog: TemplateRef<any>;
    @ViewChild('preheatTime', {static: true}) preheatTime: ElementRef;
    @ViewChild('beginTime', {static: true}) beginTime: ElementRef;
    @ViewChild('endTime', {static: true}) endTime: ElementRef;
    @ViewChild('test', {static: true}) test: ElementRef;
    @ViewChild('corresponding', {static: true}) corresponding: TemplateRef<any>;
    @ViewChild('integralDialog', {static: true}) integralDialog: TemplateRef<any>;
    @ViewChild('groupBuyDialog', {static: true}) groupBuyDialog: TemplateRef<any>;

    integralDef: MatDialogRef<any>;

    profileForm = new FormGroup({
        name: new FormControl('', Validators.required),   // 标题
        number: new FormControl(),  // 页面ID
        preheatTime: new FormControl('', Validators.required), // 预热时间
        beginTime: new FormControl('', Validators.required), // 开始时间
        endTime: new FormControl('', Validators.required), // 结束时间
        ruleText: new FormControl('', Validators.required), // 活动规则
        activityType: new FormControl('', Validators.required), // 活动类型
        amount: new FormControl(), // 售价金额
        canRefund: new FormControl(), // 允许退款
        enabled: new FormControl(false, Validators.required), // 上线状态
        reviewStatus: new FormControl(false, Validators.required), // 审核状态
        reviewResult: new FormControl('', Validators.required), // 审核结果
    });

    // 电子券数组
    electronicCouponsArray: Coupon[] = [];
    // 关联券维护列表
    hearSource: CouponMaintainModel[];
    activityStageArray = [];
    selectStore: Coupon = null; // 选择对应的店铺
    selectStores = [];
    storeColumns = [{name: 'number'}, {name: 'outId'}, {name: 'name'}, {name: 'rule'},
        {name: 'lastModifiedBy'}, {name: 'lastModifiedDate'},
    ]; // 行头
    integralCouponColumns = [{name: 'number'}, {name: 'name'}, {name: 'source'},
    ]; // 表头
    groupBuyCouponColumns = [{name: 'name'}, {name: 'lastModifiedBy'}, {name: 'lastModifiedDate'}
    ]; // 表头
    page = {page: 0, size: 5, count: 0}; // 分页
    inputValue = ''; // 搜索框值绑定
    coupons: Coupon[];
    mCouponColumnWidth = 0; // 添加券列宽
    integralColumnWith = 0; // 积分活动添加券列宽
    groupBuyColumnWith = 0; // 团购活动添加券列宽
    currentActivityType = 'DEFAULT'; // 活动类型
    groupingACoupons = []; //  A组的优惠券
    groupingBCoupons = []; // B组的优惠券
    groupingActivityCoupons = []; // 所有的优惠券
    newAddGroupingCoupons = []; // 新增的组优惠券
    groupingCouponsOrders = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    groupingAStatus = false; // 存储A组优惠券的单选/多选状态
    groupingBStatus = false; // 存储B组优惠券的单选/多选状态
    newAddGroupingStatus = []; // 存储新增优惠券的单选/多选状态
    activityFormData: any;
    activityImgName: string;
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识
    finishStatus = true; // 上传完成标识
    currentActivityImgSaveId: string;
    imgSrc = null; // 预览图片路径
    imgPreLoading = false; // 加载条
    previewImgStatus = true; // 图片预览的状态
    integralCoupon: Coupon;
    groupBuyCoupon: Coupon; // 团购券
    otherExchangeIntegral = [{channel: null, integral: null , pointID: -1}]; // 其他额外积分
    exchangeIntegral: number;
    pointSelect: any; // 积分供应商列表选择事件


    configPre = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: '0',
        defaultMinute: '0',
        defaultSeconds: '0'
    };
    configStart = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: '0',
        defaultMinute: '0',
        defaultSeconds: '0'
    };
    configEnd = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true,
        defaultHour: '23',
        defaultMinute: '59',
        defaultSeconds: '59'
    };

    // 营销标签选择
    selectedTags = [];

    // 商场的选择
    selectedMalls = [];
    // 页面包含的营销标签
    marketingTags = [];

    // 商场页面
    mallList = [];

    // 团购活动选择电子券时
    canRefund = true; // 是否允许退款
    totalPriceValue: number; // 所有团购券的总价值
    totalSellingPrice: number; //  总售价
    quillConfigAdd: any; // 富文本编辑框的配置
    addEdit: any; // 富文本编辑框的配置

    AcPreData: any;


    // AR 活动
    storeList = []; // 显示的商户标签
    selectedShops = []; // 弹框选择的商户数组

    butDis = false;

    TYPE_BCIA_TT_CRM = '';
    TYPE_DEFAULT = '';

    ngOnInit() {
        this.TYPE_BCIA_TT_CRM = this.translate.instant('marketingManage.BCIA_TT_CRM_TYPE'); // 股份会员
        this.TYPE_DEFAULT = this.translate.instant('marketingManage.DEFAULT'); // 精准营销

        this.getColumnWidth();
        this.hearSource = [
            {source: '券来源', outId: '券编码', name: '券名称', operate: '操作'}
        ];
        this.quillConfigAdd = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

                ['clean'],                                         // remove formatting button

                ['link', 'image']                         // link and image,
            ]
        };
        // 将AB组优惠券加入到总优惠券数组中
        this.groupingActivityCoupons.push(this.groupingACoupons);
        this.groupingActivityCoupons.push(this.groupingBCoupons);
        this.activityFormData = new FormData();
    }



    // 提交表单数据
    onSave(p) {

        if (!this.IsNull(this.profileForm.get('name').value)) {
            this.snackBar.open('活动标题不可为空', '✖');
            return;
        }
        if (!this.profileForm.value['preheatTime']) {
            this.snackBar.open('活动预热时间不可为空', '✖');
            return;
        }
        if (!this.profileForm.value['beginTime']) {
            this.snackBar.open('活动开始时间不可为空', '✖');
            return;
        }
        if (!this.profileForm.value['endTime']) {
            this.snackBar.open('活动结束时间不可为空', '✖');
            return;
        }
        if (!this.IsNull(this.currentActivityImgSaveId)) {
            this.snackBar.open('活动图片不可为空', '✖');
            return;
        }
        if (!this.IsNull(this.editorContent)) {
            this.snackBar.open('活动规则不可为空', '✖');
            return;
        }

        // 当活动类型为一般活动时，将电子券都存入到活动中
        if (this.currentActivityType === 'DEFAULT' || this.currentActivityType === 'GROUPBUY'
            || this.currentActivityType === 'POINT' || this.currentActivityType === 'AR') {
            if (this.electronicCouponsArray.length <= 0 ) {
                this.snackBar.open('活动必须要关联一个券', '✖');
                return;
            }
            this.profileForm.value['coupons'] = this.electronicCouponsArray;
            if (this.currentActivityType === 'POINT') {
                const exchangePoints = [];
                this.otherExchangeIntegral.forEach(
                    d => {
                        if (d.pointID !== 0 ) {
                            exchangePoints.push({ point: Number(d.integral), provider: (d.pointID).toString()  });
                        }
                    }
                );
                if (exchangePoints.length > 0) {
                    this.profileForm.value['exchangePoints'] = exchangePoints;
                }
            }
            if (this.currentActivityType === 'GROUPBUY') {
                const num = /^\d+(\.\d{1,2})?$/;
                if (!this.totalSellingPrice) {
                    this.snackBar.open('团购券总售价不能为空', '✖');
                    return;
                } else {
                    if (!num.test(this.totalSellingPrice.toString())) {
                        this.snackBar.open('团购券总售价不对,小数点后只保留两位', '✖');
                        return;
                    }
                }
            }
        }

        if (this.currentActivityType === 'GROUP'){
            if (this.groupingACoupons.length <= 0 && this.groupingBCoupons.length <= 0 && this.newAddGroupingCoupons.length <= 0){
                this.snackBar.open('活动必须要关联一个券', '✖');
                return;
            }
        }

        if (this.currentActivityType === 'AR') {
            if (this.storeList.length < 0) {
                this.snackBar.open('关联投放店铺必选', '✖');
                return;
            }
        } else {
            if (this.mallList.length < 0) {
                this.snackBar.open('需选择关联商场', '✖');
                return;
            }
        }

        if (this.activityStageArray.length > 0) {
            for (let i = 0; i < this.activityStageArray.length; i++) {
                if (!this.activityStageArray[i]['name']) {
                    const num = i + 1;
                    this.snackBar.open('活动阶段' + num + '标题不可为空!', '✖');
                    return;
                }
                if (!this.activityStageArray[i]['beginTime']) {
                    const num = i + 1;
                    this.snackBar.open('活动阶段' + num + '开始时间不可为空!', '✖');
                    return;
                }
                if (!this.activityStageArray[i]['endTime']) {
                    const num = i + 1;
                    this.snackBar.open('活动阶段' + num + '结束时间不可为空!', '✖');
                    return;
                }
            }
        }
        this.profileForm.value['name'] = (this.profileForm.value['name'] + '').trim();
        this.profileForm.value['preheatTime'] = this.formatToZoneDateTime(this.profileForm.value['preheatTime']);
        this.profileForm.value['beginTime'] = this.formatToZoneDateTime(this.profileForm.value['beginTime']);
        this.profileForm.value['endTime'] = this.formatToZoneDateTime(this.profileForm.value['endTime']);
        this.profileForm.value['image'] = this.currentActivityImgSaveId;
        this.profileForm.value['tags'] = this.marketingTags;
        this.profileForm.value['amount'] = this.totalSellingPrice;
        this.profileForm.value['canRefund'] = this.canRefund;
        this.profileForm.value['point'] = +this.exchangeIntegral;
        if (this.mallList.length > 0) {
            const mall = [];
            for (let i = 0; i < this.mallList.length; i++) {
                mall.push(this.mallList[i]['mallId']);
            }
            this.profileForm.value['mall'] = mall;
        }
        if (this.currentActivityType === 'AR') {
            if (this.storeList.length > 0) {
                const store = [];
                for (let i = 0; i < this.storeList.length; i++) {
                    store.push({mall: this.storeList[i]['mallId'], store: this.storeList[i]['id']});
                }
                this.profileForm.value['arStore'] = store;
            }
        } else  {
            this.profileForm.value['arStore'] = [];
        }


        this.loading.show();

       // console.log(this.profileForm.value , '----v');
        this.butDis = true;
        this.marketingManageService.creatMarketingManageList(this.profileForm.value).subscribe((res) => {
            if (res.status === 201) {
                const activityId = +res['body']['id'];
                if (this.currentActivityType === 'DEFAULT' ||  this.currentActivityType === 'GROUPBUY' || this.currentActivityType === 'POINT'  || this.currentActivityType === 'AR') {
                    /*当活动为一般活动时*/
                    this.snackBar.open('新建营销成功', '✖');
                   // this.setActivityTags(res.body['id']);
                     this.router.navigateByUrl('apps/marketingManage');
                } else if (this.currentActivityType === 'GROUP') {
                    /*将A组数据存入到coupon-groups中*/
                    const groupAJson = {};
                    groupAJson['activityId'] = activityId;
                    groupAJson['name'] = 'A';
                    groupAJson['coupons'] = this.groupingACoupons;
                    groupAJson['multiple'] = this.groupingAStatus;
                    this.marketingManageService.createCouponGroupsData(groupAJson).subscribe(() => {

                    }, () => {
                    }, () => {
                        this.loading.hide();
                    });

                    /*将B组数据存入到coupon-groups中*/
                    const groupBJson = {};
                    groupBJson['activityId'] = activityId;
                    groupBJson['name'] = 'B';
                    groupBJson['coupons'] = this.groupingBCoupons;
                    groupBJson['multiple'] = this.groupingBStatus;
                    this.marketingManageService.createCouponGroupsData(groupBJson).subscribe(r => {
                        if (r.status === 201) {
                            if (!(this.newAddGroupingCoupons.length > 0)) {
                                this.snackBar.open('新建营销成功', '✖');
                              //  this.setActivityTags(r.body['id']);
                                 this.router.navigateByUrl('apps/marketingManage');
                            }
                        }
                    }, () => {

                    }, () => {
                        this.loading.hide();
                    });
                    /*将新添加的数据存入到coupon-groups中*/
                    if (this.newAddGroupingCoupons.length <= 0) {
                    } else {
                        for (let i = 0; i < this.newAddGroupingCoupons.length; i++) {
                            const newGroupJson = {};
                            const name = this.groupingCouponsOrders[i];
                            const coupons = this.newAddGroupingCoupons[i];
                            const multiple = this.newAddGroupingStatus[i];
                            newGroupJson['name'] = name;
                            newGroupJson['coupons'] = coupons;
                            newGroupJson['multiple'] = multiple;
                            newGroupJson['activityId'] = activityId;
                            this.marketingManageService.createCouponGroupsData(newGroupJson).subscribe(rt => {
                                if (rt.status === 201) {
                                    this.snackBar.open('新建营销成功', '✖');
                                   // this.setActivityTags(rt.body['id']);
                                     this.router.navigateByUrl('apps/marketingManage');
                                }
                            }, () => {
                            }, () => {
                                this.loading.hide();
                            });

                        }
                    }
                }
                for (let i = 0; i < this.activityStageArray.length; i++) {
                    this.activityStageArray[i]['activityId'] = activityId;
                }
                if (!(this.activityStageArray.length > 0)) {
                    /*this.snackBar.open('新建营销成功', '✖');
                    this.router.navigateByUrl('apps/marketingManage');*/
                } else {
                    for (let i = 0; i < this.activityStageArray.length; i++) {
                        this.marketingManageService.createCouponSatgeData(this.activityStageArray[i]).subscribe((result) => {
                            if (result.status === 201) {
                                this.snackBar.open('新建营销成功', '✖');
                                this.router.navigateByUrl('apps/marketingManage');
                                // this.setActivityTags(result.body['id']);
                            }
                        }, () => {
                        }, () => {
                            this.loading.hide();
                        });
                    }
                }
            } else {
            }
        }, error1 => {
            this.butDis = false;
        }, () => {
            this.loading.hide();
        });
    }

    // 删去电子券列表中的某个电子券
    deleteCoupon(param) {
        this.electronicCouponsArray.splice(param, 1);
    }
    deleteCouponAndAmount(param) {
        this.totalPriceValue -= this.electronicCouponsArray[param]['amount'];
        this.electronicCouponsArray.splice(param, 1);
    }


    // 添加活动
    add_activity() {
        if (!(this.electronicCouponsArray.length > 0)) {
            this.snackBar.open('请添加电子券！', '✖');
        } else {
            this.activityStageArray.push({
                name: null,
                beginTime: null,
                endTime: null,
                coupons: this.electronicCouponsArray
            });
        }

    }

    // 删除活动
    deleteActivity(index) {
        // alert(index);
        const deleteItem = this.activityStageArray[index];
        this.activityStageArray = this.activityStageArray.filter(item => item !== deleteItem);
    }

    // 获取活动阶段的标题数据
    getTitleValue(event, index) {
        this.activityStageArray[index]['name'] = event.target.value;
    }

    // 获取活动阶段的开始时间数据
    getBeginTimeValue(event, index) {
        event = JSON.stringify(event);
        event = JSON.parse(event);
        this.activityStageArray[index]['beginTime'] = event.startDate;

    }

    // 获取活动阶段的结束时间
    getEndTimeValue(event, index) {
        event = JSON.stringify(event);
        event = JSON.parse(event);
        this.activityStageArray[index]['endTime'] = event.startDate;
    }

    // 选择时拿到选中商户
    onSelect() {
        if (this.currentActivityType === 'DEFAULT' || this.currentActivityType === 'AR') {
            if (this.selectStores.length > 0) {
                if (this.electronicCouponsArray.length > 0) {
                    for (let j = 0; j < this.electronicCouponsArray.length; j++) {
                        for (let i = 0; i < this.selectStores.length; i++) {
                            if (this.electronicCouponsArray[j].number === this.selectStores[i].number) {
                                this.snackBar.open(this.selectStores[i].name + '电子券已被添加', '✖');
                                this.selectStores = this.selectStores.filter(t => t.number !== this.selectStores[i].number);
                            }
                        }
                    }
                }
            }
        } else if (this.currentActivityType === 'GROUP') {
            if (this.selectStores.length > 0) {
                // 与A组比较
                for (let i = 0; i < this.groupingACoupons.length; i++) {
                    for (let j = 0; j < this.selectStores.length; j++) {
                        if (this.selectStores[j].number === this.groupingACoupons[i].number) {
                            this.snackBar.open(this.selectStores[j].name + '电子券已被电子券A组添加', '✖');
                            this.selectStores = this.selectStores.filter(t => t.number !== this.selectStores[j].number);
                        }
                    }
                }
                // 与B组比较
                for (let i = 0; i < this.groupingBCoupons.length; i++) {
                    for (let j = 0; j < this.selectStores.length; j++) {
                        if (this.selectStores[j].number === this.groupingBCoupons[i].number) {
                            this.snackBar.open(this.selectStores[j].name + '电子券已被电子券B组添加', '✖');
                            this.selectStores = this.selectStores.filter(t => t.number !== this.selectStores[j].number);
                        }
                    }
                }
                // 与其它组比较
                for (let i = 0; i < this.newAddGroupingCoupons.length; i++) {
                    for (let j = 0; j < this.newAddGroupingCoupons[i].length; j++) {
                        for (let k = 0; k < this.selectStores.length; k++) {
                            if (this.selectStores[k].number === this.newAddGroupingCoupons[i][j].number) {
                                this.snackBar.open(this.selectStores[k].name + '电子券已被电子券' + this.groupingCouponsOrders[i] + '组添加', '✖');
                                this.selectStores = this.selectStores.filter(t => t.number !== this.selectStores[k].number);
                            }
                        }
                    }
                }
            }
        } else if (this.currentActivityType === 'POINT') {
            this.integralCoupon = this.selectStores[0];
        } else if (this.currentActivityType === 'GROUPBUY') {
            for (let i = 0; i < this.electronicCouponsArray.length; i++) {
                if (this.selectStores[0]['id'] === this.electronicCouponsArray[i]['id']) {
                    this.snackBar.open('该电子券已被选择', '✖');
                    this.selectStores = [];
                    return;
                }
            }
            this.groupBuyCoupon = this.selectStores[0];
        }

    }

    // 翻页
    onPage(event , p?) {
        this.page.page = event.offset;
        if (!this.inputValue) {
            if (p === 'COUPON_OF_GOODS') {
                this.marketingManageService.searchCouponMaintainList('', this.page.page, this.page.size, 'lastModifiedDate,desc', '', '', 'rule', 'COUPON_OF_GOODS').subscribe( res => {
                    if (res.status === 200) {
                        if (res['body']) {
                            this.coupons = res['body'];
                        } else {
                            this.snackBar.open('券维护列表接口数据为空', '✖');
                        }
                    }
                });
            } else {
                this.marketingManageService.searchCouponMaintainList('', event.offset, event.pageSize, 'lastModifiedDate,desc').subscribe((res) => {
                    if (res.status === 200) {
                        if (res['body']) {
                            this.coupons = res['body'];
                        } else {
                            this.snackBar.open('券维护列表接口数据为空', '✖');
                        }
                    }
                });
            }

        }
    }

    // 全维护列表
    openStore(param) {
        this.inputValue = '';
        this.selectStore = null;
        this.selectStores = [];
        this.page.page = 0;
        this.page.size = 5;
        this.marketingManageService.searchCouponMaintainList('', this.page.page, this.page.size, 'lastModifiedDate,desc').subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    this.coupons = res['body'];
                    this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                    this.dialog.open(this.corresponding, {
                        id: 'changeCorresponding',
                        width: '85%'
                    }).afterClosed().subscribe(r => {
                        if (r) {
                            if (this.selectStores.length > 0) {
                                if (param === false) {
                                    for (let i = 0; i < this.selectStores.length; i++) {
                                        this.electronicCouponsArray.push( this.selectStores[i]);
                                    }
                                } else if ('A' === param) {
                                    for (let i = 0; i < this.selectStores.length; i++) {
                                        this.groupingACoupons.push(this.selectStores[i]);
                                    }
                                } else if ('B' === param) {
                                    for (let i = 0; i < this.selectStores.length; i++) {
                                        this.groupingBCoupons.push(this.selectStores[i]);
                                    }
                                } else {
                                    for (let i = 0; i < this.selectStores.length; i++) {
                                        this.newAddGroupingCoupons[param].push(this.selectStores[i]);
                                    }
                                }

                            }
                            // this.electronicCouponsArray.push(this.selectStore);
                        } else {
                            this.selectStores = [];
                            this.selectStore = null;
                            this.inputValue = '';
                        }
                    });
                } else {
                    this.snackBar.open('券维护列表接口数据为空', '✖');
                }
            }
        });

    }

    // 重置列表
    resetStores(event) {
        if (event.target.value === '') {
            this.page.page = 0;
            if (this.currentActivityType === 'GROUPBUY') {
                this.marketingManageService.searchCouponMaintainList('', this.page.page, this.page.size, 'lastModifiedDate,desc', '', '', 'rule', 'COUPON_OF_GOODS')
                    .pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    if (res) {
                        this.coupons = res['body'];
                        this.page.count = res['headers'].get('X-Total-Count');
                    }
                }, error => {

                });
            } else {
                this.marketingManageService.searchCouponMaintainList('', this.page.page, this.page.size, 'lastModifiedDate,desc')
                    .pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                    if (res) {
                        this.coupons = res['body'];
                        this.page.count = res['headers'].get('X-Total-Count');
                    }
                }, error => {

                });
            }

        }
    }

    // 电子券规则搜索
    onStoreSearch() {
        if (this.inputValue) {
            const s1 = this.getSearchObservable('name');
            const s2 = this.getSearchObservable('outId');
            forkJoin([s1, s2]).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                // debugger;
                if (res && res.length > 0) {
                    this.coupons = [];
                    res.forEach(r => {
                        if (r && r['body']) {
                            r['body'].forEach(coupon => {
                                if (!this.coupons.find(item => item.number === coupon.number)) {
                                    this.coupons.push(coupon);
                                }
                            });
                        }
                    });
                    this.page.count = this.coupons.length;
                }
            }, error => {

            });
        }
    }

    onGroupBuyStoreSearch() {
        if (this.inputValue) {
            const s1 = this.getSearchObservable('name');
            const s2 = this.getGroupBuySearchObservable('name', 'rule', 'COUPON_OF_GOODS');
            forkJoin([s1, s2]).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                // debugger;
                if (res && res.length > 0) {
                    this.coupons = [];
                    res.forEach(r => {
                        if (r && r['body']) {
                            r['body'].forEach(coupon => {
                                if (!this.coupons.find(item => item.number === coupon.number)) {
                                    this.coupons.push(coupon);
                                }
                            });
                        }
                    });
                    this.page.count = this.coupons.length;
                }
            }, error => {

            });
        }
    }

    // 获取列宽
    getColumnWidth() {
        const columnWidth = screen.width * 0.8;
        const integralColumnWidth = screen.width * 0.75 * 0.5;
        this.mCouponColumnWidth = columnWidth / (this.storeColumns.length + 1);
        this.integralColumnWith = integralColumnWidth / (this.integralCouponColumns.length + 1);
        this.groupBuyColumnWith = integralColumnWidth / (this.groupBuyCouponColumns.length + 1);
    }

    // 获取搜索字段可观测对象
    getSearchObservable(field): Observable<any> {
        return this.marketingManageService.searchCouponMaintainList('', 0, 0x3f3f3f3f, field + ',desc', field, this.inputValue);
    }

    // 获取团购搜索字段可观测对象
    getGroupBuySearchObservable(field, field1, defaultValue): Observable<any> {
        return this.marketingManageService.searchCouponMaintainList('', 0, 0x3f3f3f3f, field + ',desc', field, this.inputValue, field1, defaultValue);
    }


    // 改变活动类型
    changeActivityType() {
        if (this.currentActivityType === 'DEFAULT') {
            this.groupingACoupons = [];
            this.groupingBCoupons = [];
            this.electronicCouponsArray = [];
            this.newAddGroupingCoupons = [];
        } else if (this.currentActivityType === 'GROUP') {
            this.electronicCouponsArray = [];
        } else if (this.currentActivityType === 'POINT') {
            this.electronicCouponsArray = [];
        }
        else if (this.currentActivityType === 'GROUPBUY') {
            this.electronicCouponsArray = [];
        } else if (this.currentActivityType === 'AR') {
            this.electronicCouponsArray = [];
        }
    }

    // 添加组优惠券
    add_grouping_coupons() {
        this.newAddGroupingCoupons.push([]);
        this.newAddGroupingStatus.push(false);
        this.groupingActivityCoupons.push(this.newAddGroupingCoupons);
    }

    // 删除组中的优惠券
    deleteGroupingCoupon(outId, index) {
        // let deleteItem = {};
        if ('A' === index) {
            this.groupingACoupons.splice(outId, 1);
        } else if ('B' === index) {
            this.groupingBCoupons.splice(outId, 1);
        } else {
            this.newAddGroupingCoupons[index].splice(outId, 1);
        }
    }

    // 删除组活动
    delete_grouping(index) {
        const deleteItem = this.newAddGroupingCoupons[index];
        this.newAddGroupingCoupons = this.newAddGroupingCoupons.filter(item => item !== deleteItem);
        this.newAddGroupingStatus.splice(index, 1);
    }

    // 改变A/B的单选/多选状态
    changeAOrBStatus(event, param) {
        if ('A' === param) {
            if (event.value === 'true') {
                this.groupingAStatus = true;
            } else if (event.value === 'false') {
                this.groupingAStatus = false;
            }
        } else if ('B' === param) {
            if (event.value === 'true') {
                this.groupingBStatus = true;
            } else if (event.value === 'false') {
                this.groupingBStatus = false;
            }
        }
    }

    // 改变新增券组的单选/多选状态
    changeNewGroupingStatus(event: any, index: number) {
        this.newAddGroupingStatus[index] = 'true' === event.value;
    }

    // 开始时间选择后设定结束时间最小时间
    onStartSourceDate(event, endTime) {
        endTime.picker.set('minDate', event);
    }

    // 反之
    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
    }

    // 设置开始时间处于预热时间与结束时间中间
    onMiddleSourceDate(event, endTime, preheatTime) {
        // event.setHours(23);
        // event.setMinutes(59);
        // event.setSeconds(59);
        endTime.picker.set('minDate', event);
        preheatTime.picker.set('maxDate', event);
    }

    // 将yyyy-MM-d HH:mm:ss 转为 字符串
     formatToZoneDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString();
    }


    // 打开上传文件选项框
    openUploadImgDiloag(uploadImgDloag) {
        if (!this.dialog.getDialogById('uploadImageDialog_')) {
            this.uploadStatus = false;
            this.finishStatus = true;
            this.activityFormData = null;
            this.activityImgName = '';
            this.dialog.open(uploadImgDloag, {
                id: 'uploadImageDialog_',
                width: '500px',
                height: '245px',
                position: {top: '200px'},
                hasBackdrop: true ,
            });
        }
    }

    // 打开预览的文件框
    openPreviewDilog(previewImgDloag) {
        if (this.currentActivityImgSaveId) {
            this.imgPreLoading = true;
            if (!this.dialog.getDialogById('previewImageDialog_')) {
                this.dialog.open(previewImgDloag, {
                    id: 'previewImageDialog_',
                    width: '690px',
                    height: '300px',
                    position: {top: '200px'},
                    hasBackdrop: true ,
                });
            }
            this.fileTransferService.previewFile(this.currentActivityImgSaveId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    const fileReader = new FileReader();
                    fileReader.readAsDataURL(res);
                    fileReader.onloadend = (res1) => {
                        const result = res1.target['result'];
                        //   this.imgSrc = 'data:image/jpeg;base64,' + result;
                        this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
                        this.imgPreLoading = false;
                    };
                    //  fileReader.readAsArrayBuffer(res);
                },
                error1 => {

                });
        }

    }

    // 上传券文件 选择并展示路径
    CouponImgUpload(e) {
        const oneM = 1024 * 1024;
        const file = e.target.files[0];
        if (file.size > oneM) {
            this.snackBar.open('上传文件大小不能超过1M', '✖');
            return;
        }
        this.activityFormData = new FormData();
        this.activityImgName = file.name;
        this.activityFormData.append('files', file);
    }

    // 上传文件
    onUploadImg() {
        if (!this.activityFormData) {
            this.snackBar.open('请选择一个文件', '✖');
            return;
        }
        this.notUploading = false;
        this.fileTransferService.uploadFile(this.activityFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.type === 1) {
                this.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
            }
            if (res.status === 200) {
                this.previewImgStatus = false;
                this.progressLoad = 100;
                this.notUploading = true;
                this.uploadStatus = true;
                this.finishStatus = false;
                this.currentActivityImgSaveId = res['body'];

            } else {
            }
        }, error1 => {

        });
    }

    // 防止提交
    pseudoSubmit() {

    }


    // 积分活动添加券弹窗
    openIntegralDialog() {
        this.exchangeIntegral = null;
        this.otherExchangeIntegral = [{channel: null, integral: null , pointID: -1}];
        this.inputValue = '';
        this.selectStore = null;
        this.selectStores = [];
        this.page.page = 0;
        this.page.size = 5;
        this.integralCoupon = null;
        this.marketingManageService.searchCouponMaintainList('', this.page.page, this.page.size, 'lastModifiedDate,desc').subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    this.coupons = res['body'];
                    this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                    this.integralDef = this.dialog.open(this.integralDialog, {
                        id: 'integralDialogId',
                        width: '75%',
                        height: '70%',
                        position: {top: '100px'}
                    });
                    this.integralDef.afterClosed().subscribe(r => {
                        if (r) {
                            if (this.selectStores.length > 0) {
                                // this.integralCoupon = this.selectStores[0];
                                this.electronicCouponsArray.push(this.selectStores[0]);
                            }

                        } else {
                            this.selectStores = [];
                            this.selectStore = null;
                            this.inputValue = '';
                            this.integralCoupon = null;
                            this.exchangeIntegral = null;
                        }
                    });
                } else {
                    this.snackBar.open('券维护列表接口数据为空', '✖');
                }
            }
        });
    }


    closeIntegralDef(){
        let  f = false ;
        this.otherExchangeIntegral.forEach(
            r => {
                if (this.IsNull(r.channel) && this.IsNull(r.integral) && r.pointID !== -1) {

                } else {
                    f = true ;
                }
            }
        );
        if (f) {
            this.snackBar.open('请填写完整的其他渠道积分供应数据！！！', '✖');
        } else {
            this.integralDef.close(true);
        }

    }


    IsNull(para) {
        if (para !== undefined && para !== 'undefined'
             && para !== '' && para !== 'null' && para !== null) {
            return true;
        } else {
            return false;
        }
    }

    // 团购添加券弹窗
    openGroupBuyDialog() {
        // this.canRefund = null;
        this.otherExchangeIntegral = [{channel: null, integral: null , pointID: -1}];
        this.inputValue = '';
        this.selectStore = null;
        this.selectStores = [];
        this.page.page = 0;
        this.page.size = 5;
        this.groupBuyCoupon = null;
        this.marketingManageService.searchCouponMaintainList('', this.page.page, this.page.size, 'lastModifiedDate,desc', '', '', 'rule', 'COUPON_OF_GOODS').subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    this.coupons = res['body'];
                    this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                    this.dialog.open(this.groupBuyDialog, {
                        id: 'groupBuyDialogId',
                        width: '75%',
                        height: '70%',
                        position: {top: '100px'}
                    }).afterClosed().subscribe(r => {
                        if (r) {
                            if (this.selectStores.length > 0) {
                                for (let i = 0; i < this.selectStores.length; i++) {
                                    this.electronicCouponsArray.push(this.selectStores[i]);
                                    if (!this.totalPriceValue) {
                                        this.totalPriceValue = this.selectStores[i]['amount'];
                                    } else {
                                        this.totalPriceValue += this.selectStores[i]['amount'];
                                    }
                                }
                            }
                        } else {
                            this.selectStores = [];
                            this.selectStore = null;
                            this.inputValue = '';
                            this.groupBuyCoupon = null;
                        }
                    });
                } else {
                    this.snackBar.open('券维护列表接口数据为空', '✖');
                }
            }
        });
    }

    // 兑换其它积分
    addOtherIntegral(index) {
        this.otherExchangeIntegral.push({channel: null, integral: null , pointID: -1});
    }

    // 删除其它兑换积分
    deleteOtherIntegral(index) {
        if (this.otherExchangeIntegral.length <= 1) {
            return;
        }
        this.otherExchangeIntegral.splice(index, 1);
    }

    // 选择渠道类型
    selectChannelType(index, event) {
        this.otherExchangeIntegral[index]['channel'] = event.value;
    }


    // 打开积分供应商列表
    openPointList(PointSupplier , i){
        if (!this.dialog.getDialogById('PointSupplierClass')) {
            this.dialog.open(PointSupplier, {
                id: 'PointSupplierClass',
                width: '80%',
                hasBackdrop: false ,
            }).afterClosed().subscribe(
                res => {
                    if (res) {
                        const p_arr = JSON.stringify(this.pointSelect);
                        const p_str = JSON.parse(p_arr);
                        let flag = false ;
                        for (let y = 0 ; y < this.otherExchangeIntegral.length ; y ++ ) {
                            if (this.otherExchangeIntegral[y].pointID === this.pointSelect['memberId'] ) {
                                flag = true;
                            }
                        }
                        if (!flag) {
                            this.otherExchangeIntegral[i]['channel'] = p_str['memberName'];
                            this.otherExchangeIntegral[i]['pointID'] = p_str['memberId'];
                        } else {
                            this.snackBar.open('此供应商已经被选择过', '✖');
                        }
                    }
                }
            );
        }
    }


    // 积分供应商选择事件
    selectPoint(e){
        this.pointSelect = e;
    }


    inputIntegral(index, event) {
        if (/^[0-9]+$/.test(event.target.value)) {
            this.otherExchangeIntegral[index]['integral'] = event.target.value;
        } else {
            this.otherExchangeIntegral[index]['integral'] = null;
            this.snackBar.open('请输入正确的兑换积分数量', '✖');
        }
    }

    setIntegralValue(e){
        const forbidden = /^[0-9]*[1-9][0-9]*$/.test(e.target.value);
        if (!forbidden) {
            e.target.value = null;
            this.exchangeIntegral =  e.target.value;
        } else {
            this.exchangeIntegral =  e.target.value;
        }
    }


    SellingPriceChange(e){
        const num = /^\d+(\.\d{1,2})?$/;
        if (!num.test(this.totalSellingPrice.toString())) {
            document.getElementById('sellingInputC').style.borderColor = '#F44336';
        } else {
            document.getElementById('sellingInputC').style.borderColor = '#A9A9A9';
        }
    }


    // checkbox选中营销标签
    onSelectTags(event) {
        this.selectedTags = event;
    }

    onSelectMalls(event) {
        this.selectedMalls = event;
    }

    // 打开选择标签列表
    editMarketingTags(tagTemplate: TemplateRef<any>) {
        this.selectedTags = [];
        Object.assign(this.selectedTags, this.marketingTags);
        this.dialog.open(tagTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.marketingTags = [];
                Object.assign(this.marketingTags, this.selectedTags);
            } else {
                this.selectedTags = [];
            }
        });

    }


    // 删除标签
    deleteLabel(index) {
        this.marketingTags.splice(index, 1);
    }


    // 打开商场列表
    editMall(mallTemplate: TemplateRef<any>) {
        this.selectedMalls = [];
        Object.assign(this.selectedMalls, this.mallList);
        this.dialog.open(mallTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.mallList = [];
                Object.assign(this.mallList, this.selectedMalls);
            } else {
                this.selectedMalls = [];
            }
        });
    }

    // 删除商场
    deleteMalls(index){
        this.mallList.splice(index, 1);
    }

    // 富文本编辑框 图片处理
    EditorCreatedAdd(event){
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandler.bind(this));
        this.addEdit = event;
    }

    imageHandler(){
        const Imageinput = document.createElement('input');
        Imageinput.setAttribute('type', 'file');
        Imageinput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
        Imageinput.classList.add('ql-image');
        Imageinput.addEventListener('change', () => {
            const file = Imageinput.files[0];
            const data: FormData = new FormData();
            data.append('files', file);
            if (Imageinput.files != null && Imageinput.files[0] != null) {
                this.couponService.CouponFileUploadNotBar(data).pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                    if ( res !== undefined && res !== 'undefined'  ) {
                        const range = this.addEdit.getSelection(true);
                        const index = range.index + range.length;
                        this.addEdit.setSelection(1 + range.index);
                        this.addEdit.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res);
                        if (this.editorContent !== undefined && this.editorContent !== 'undefined' && this.editorContent !== '' && this.editorContent !== null && this.editorContent !== 'null'){
                            this.editorContent = this.editorContent + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        } else {
                            this.editorContent = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        }
                        this.addEdit.focus();
                    }
                }, error1 => { this.loading.hide();  });
            }
        });
        Imageinput.click();
    }


    // 拿到绑定的标签
    getTagsByActivity(id){
        this.marketingManageService.getTagsByActivity(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            r => {

            }
        );
    }

    // 打开商户弹窗
    editShop(storeTemplate: TemplateRef<any>) {
        this.selectedShops = [];
        Object.assign(this.selectedShops, this.storeList);
        this.dialog.open(storeTemplate, {id: 'shopTemplate', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                this.storeList = [];
                Object.assign(this.storeList, this.selectedShops);
            } else {
                this.selectedShops = [];
            }
        });
    }

    // 删除商户
    deleteShop(index){
        this.storeList.splice(index, 1);
    }

    // 拿到选择的商户
    onSelectShop(e){
        this.selectedShops = e ;
    }


    // 绑定标签
    setActivityTags(id){
        const  acT: any = [];
        this.marketingTags.forEach( r => {
            acT.push({id: r.id});
        });
        const brand_vm = {
            activityId: id ,
            tagList: acT
        };
        this.marketingManageService.setActivityTags(brand_vm).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            r => {
                this.snackBar.open('标签绑定成功', '✖');
                this.router.navigateByUrl('apps/marketingManage');
            },
            error1 => {
                this.snackBar.open('标签绑定失败', '✖');
                this.butDis = false;
            },
            () => {}
        );
    }


    // 打开预览窗口
    preAcCom(preAc){
            const value1 = this.profileForm.value;
            this.AcPreData = {
                name: value1.name,
                content: this.editorContent,
                cover:  this.currentActivityImgSaveId,
                couType: this.currentActivityType,
                couDe: this.electronicCouponsArray,
                couA:   this.groupingACoupons,
                couB:   this.groupingBCoupons,
                couOth: this.newAddGroupingCoupons,
            };
        if (!this.dialog.getDialogById('preAcDialog')) {
            this.dialog.open(preAc, {
                id: 'preAcDialog',
                width: '369px',
                height: '703px',
                position: {right: '300px'},
                hasBackdrop: true ,
            });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}

export class CouponMaintainModel {
    source: string;
    outId: string;
    name: string;
    operate: string;
}

export class Coupon {
    id: number; // 券ID
    number: number; // 券编码
    name: string;    // 券名称
    rule: string;    //  券类型
    canGift: boolean;    //   支持转送
    canReturn: boolean;    // 支持回收
    limitStore: boolean;    // 限制店铺
    limitCommercial: boolean; // 限制业态
    ReceivingFrequency: string; // 领取频次
    FullAmount: string; // 满额
    Reduction: string; // 减额
    lastModifiedBy: string; // 修改人
    lastModifiedDate: string; // 修改时间
    source: string; // 来源
    outId: string; // 外部券好
    description: string; // 券说明
    createdBy: string; // 创建人
    createdDate: string; // 创建时间
    timeBegin: string; // 开始时间
    timeEnd: string; // 结束时间
    amount: number; // 减额
    canRefund: boolean; // 是否允许退款
    constructor() {
    }
}

