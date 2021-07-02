import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {ECouponServiceService} from '../../../../services/EcouponService/ecoupon-service.service';
import {Coupon} from '../marketing-manage-add/marketing-manage-add.component';
import {takeUntil} from 'rxjs/operators';
import {forkJoin, Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {environment} from '../../../../../environments/environment.hmr';
import {MallService} from '../../../../services/mallService/mall-service.service';
import {MarketingManageService} from '../marketing-manage.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';

@Component({
    selector: 'app-marketing-manage-edit',
    templateUrl: './marketing-manage-edit.component.html',
    styleUrls: ['./marketing-manage-edit.component.scss'],
    animations: fuseAnimations
})
export class MarketingManageEditComponent implements OnInit {
    constructor(private dialog: MatDialog, private marketingManageService: MarketingManageService,
                private route: ActivatedRoute,
                private snackBar: MatSnackBar,
                private router: Router,
                private eCouponServiceService: ECouponServiceService,
                private translate: TranslateService,
                private loading: FuseProgressBarService,
                private dateTransform: NewDateTransformPipe,
                private  fileTransferService: FileTransferService,
                private couponService: ECouponServiceService,
                private sanitizer: DomSanitizer,
                private mallService: MallService,
    ) {
    }

    // 富文本框内容
    editorContent: any;
    private _unsubscribeAll: Subject<any> = new Subject();
    @ViewChild('LableDialog', {static: true}) LableDialog: TemplateRef<any>;
    @ViewChild('AddTicketDialog', {static: true}) AddTicketDialog: TemplateRef<any>;
    @ViewChild('groupBuyDialog', {static: true}) groupBuyDialog: TemplateRef<any>;
    @ViewChild('preheatTime', {static: true}) preheatTime: ElementRef;
    @ViewChild('beginTime', {static: true}) beginTime: ElementRef;
    @ViewChild('endTime', {static: true}) endTime: ElementRef;
    @ViewChild('nameInput', {static: true}) nameInput: ElementRef;
    @ViewChild('idInput', {static: true}) idInput: ElementRef;
    @ViewChild('ruleTextDom', {static: true}) ruleTextDom: ElementRef;
    @ViewChild('corresponding', {static: true}) corresponding: TemplateRef<any>;
    @ViewChild('integralDialog', {static: true}) integralDialog: TemplateRef<any>;
    @ViewChild('checkDialog', {static: true}) checkDialog: TemplateRef<any>;

    integralDef: MatDialogRef<any>;
    profileForm = new FormGroup({
        name: new FormControl(),   // 标题
        id: new FormControl(),  // 页面ID
        preheatTime: new FormControl(''), // 预热时间
        beginTime: new FormControl(), // 开始时间
        endTime: new FormControl(), // 结束时间
        ruleText: new FormControl(), // 活动规则
        activityType: new FormControl(), //  活动类型
        amount: new FormControl(), // 售价金额
        canRefund: new FormControl(), // 允许退款
        number: new FormControl(), // number
        enabled: new FormControl({value: false, disabled: false}), // 上线状态
        reviewStatus: new FormControl({value: false, disabled: false}), // 审核状态
        reviewResult: new FormControl({value: false, disabled: false}), // 审核结果
    });
    marketingDetailJson: any = null;
    // 电子券数组
    electronicCouponsArray = [];
    // 活动阶段数组
    activityStageArray: any;
    // 删除从数据库中获取的活动阶段
    primitiveActivityStages = [];
    // 活动阶段优惠券数组
    activityStagesCouponsArray = [];

    selectStore: Coupon = null; // 选择对应的店铺
    selectStores = [];
    storeColumns = [{name: 'number'}, {name: 'outId'}, {name: 'name'}, {name: 'rule'},
        {name: 'lastModifiedBy'}, {name: 'lastModifiedDate'},
    ]; // 行头
    groupBuyCouponColumns = [{name: 'name'}, {name: 'lastModifiedBy'}, {name: 'lastModifiedDate'}
    ]; // 表头
    integralCouponColumns = [{name: 'number'}, {name: 'name'}, {name: 'source'},
    ]; // 表头
    page = {page: 0, size: 5, count: 0}; // 分页
    inputValue = ''; // 搜索框值绑定
    coupons: Coupon[];
    groupBuyCoupon: Coupon; // 团购券
    currentActivityType: any; // 当前活动类型
    groupingACoupons = []; //  A组的优惠券
    groupingBCoupons = []; // B组的优惠券
    groupingActiviryCoupons = []; // 所有的优惠券
    newAddGroupingCoupons = []; // 新增的组优惠券
    groupingCouponsOrders = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    groupingAStatus: any; // 存储A组优惠券的单选/多选状态
    groupingBStatus: any; // 存储B组优惠券的单选/多选状态
    newAddGroupingStatus = []; // 存储新增优惠券的单选/多选状态
    groupingCouponsResult: any; // 从接口获取的所有数据
    primitiveroupingCouponsCount = 0; // 从接口获取的分组总数
    updateGroupsHttpCount = 0; //  用于存储所发生的http请求的次数
    activiyFormData: any;
    activityImgName: string;
    notUploading: boolean; // 是否在上传
    progressLoad: number;  // 上传长度
    uploadStatus = false; // 还未上传完成标识f
    finishStatus = true; // 上传完成标识
    currentActivityImgSaveId: string;
    imgSrc = null; // 预览图片路径
    previewImgStatus = true; // 图片预览的状态
    mCouponColumnWidth = 0; //  列宽初始化
    integralColumnWith = 0; // 积分活动添加券列宽
    selectedTags = []; // 选择的标签
    marketingTags = []; // 实际的标签
    selectedMalls = [];
    mallList = [];


    // 团购活动选择电子券时
    canRefund: boolean; // 是否允许可退
    groupBuyColumnWith = 0; // 团购活动添加券列宽
    quillConfigEdit: any; // 富文本框的配置变量
    editAdd: any; // 富文本框的配置变量
    otherExchangeIntegral = [{channel: null, integral: null , pointID: -1}];
    exchangeIntegral: number;
    pointSelect: any; // 积分供应商列表选择事件

    integralCoupon: Coupon;
    totalPriceValue: number; // 所有团购券的总价值
    totalSellingPrice: number; //  总售价

    // AR 活动
    storeList = []; // 显示的商户标签
    selectedShops = []; // 弹框选择的商户数组


    ACid: any;

    AcPreData: any; // 预览数据

    btuDis = false;

    imgPreLoading = false; // 图片上传加载进度条

    toExamine = false;

    TYPE_BCIA_TT_CRM = '';
    TYPE_DEFAULT = '';



    // 将yyyy/MM-/d HH:mm:ss 转为 字符串
    static formatToZoneDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString();
    }

    ngOnInit() {
        this.TYPE_BCIA_TT_CRM = this.translate.instant('marketingManage.BCIA_TT_CRM_TYPE'); // 股份会员
        this.TYPE_DEFAULT = this.translate.instant('marketingManage.DEFAULT'); // 精准营销
        this.quillConfigEdit = {
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
        this.getColumnWidth();
        this.searchActivityDetailById();
    }

    searchActivityDetailById() {
        const id = this.route.snapshot.paramMap.get('id');
        this.ACid = id ;
        this.marketingManageService.searchActivityListById(id).subscribe(res => {
            if (res.status === 200) {
                if (res['body']) {
                    // this.marketingTags = res['body']['tags'];
                    this.getTagsByBrand(res['body']['id']);
                    this.marketingDetailJson = res['body'];
                    const auth = sessionStorage.getItem('auth');
                    if (auth) {
                        if (auth.includes('ROLE_ACTIVITY_REVIEW')) {
                            this.toExamine = true;
                            if (res['body']['reviewStatus']) {
                                this.toExamine = false;
                            }
                        } else {
                            this.toExamine = false;
                        }
                    } else {
                        this.toExamine = true;
                    }


                    this.editorContent = this.marketingDetailJson['ruleText'];
                    this.currentActivityType = this.marketingDetailJson['activityType'];
                    this.electronicCouponsArray = res['body']['coupons'];
                    this.exchangeIntegral = res['body']['point'];
                    this.otherExchangeIntegral = res['body']['exchangePoints'];
                    // point: 1
                    // provider: "SHARE"
                    if (res['body']['exchangePoints']) {
                        this.otherExchangeIntegral = [] ;
                        res['body']['exchangePoints'].forEach( r => {
                            this.otherExchangeIntegral.push({channel: r.provider , integral: Number(r.point) , pointID: r.provider});
                        });
                    }

                    const mallIds = res['body']['mall'];
                    for (let i = 0; i < mallIds.length; i++) {
                        this.mallService.getMallById(mallIds[i]).subscribe((rest => {
                            this.mallList.push(rest['body']);
                        }));
                    }
                    if (this.marketingDetailJson.image) {
                        this.currentActivityImgSaveId = this.marketingDetailJson.image;
                        this.previewImgStatus = false;
                    }
                    //  调整标题formControl的值、
                    this.profileForm.get('name').patchValue(this.marketingDetailJson['name']);
                    // 调整时间formControl的值
                    this.profileForm.get('number').patchValue(this.marketingDetailJson['number']);
                    this.onStartSourceDate(new Date(this.dateTransform.transform(this.marketingDetailJson['preheatTime'])), this.beginTime);
                    this.onMiddleSourceDate(new Date(this.dateTransform.transform(this.marketingDetailJson['beginTime'])), this.endTime, this.preheatTime);
                    this.onEndSourceDate(new Date(this.dateTransform.transform(this.marketingDetailJson['endTime'])), this.beginTime);
                    this.profileForm.get('preheatTime').patchValue(this.dateTransform.transform(this.marketingDetailJson['preheatTime']));
                    this.profileForm.get('beginTime').patchValue(this.dateTransform.transform(this.marketingDetailJson['beginTime']));
                    this.profileForm.get('endTime').patchValue(this.dateTransform.transform(this.marketingDetailJson['endTime']));
                    /*查询活动分组数据*/
                    if (this.currentActivityType === 'GROUP') {
                        const param = '?activityId.equals=' + id + '&sort=name';
                        this.marketingManageService.getCouponGroupsData(param).subscribe(result => {
                            if (result.status === 200) {
                                if (result['body']) {
                                    this.primitiveroupingCouponsCount = result['body']['length'];
                                    this.groupingCouponsResult = result['body'];
                                    const allCouponsGroup = result['body'];
                                    if (allCouponsGroup['length'] >= 1) {
                                        this.groupingACoupons = allCouponsGroup[0]['coupons'];
                                        this.groupingAStatus = allCouponsGroup[0]['multiple'];
                                    }
                                    if (allCouponsGroup['length'] >= 2) {
                                        this.groupingBCoupons = allCouponsGroup[1]['coupons'];
                                        this.groupingBStatus = allCouponsGroup[1]['multiple'];
                                    }
                                    if (allCouponsGroup['length'] >= 3) {
                                        for (let i = 2; i < allCouponsGroup['length']; i++) {
                                            this.newAddGroupingCoupons.push(allCouponsGroup[i]['coupons']);
                                            this.newAddGroupingStatus.push((allCouponsGroup[i]['multiple']));
                                        }
                                    }
                                } else {
                                    this.snackBar.open('分组活动接口数据为空', '✖');
                                }
                            }
                        }, () => {
                        });
                    }
                    if (this.currentActivityType === 'GROUPBUY') {
                        // this.amount = res['body']['amount'];
                        this.totalSellingPrice = res['body']['amount'];
                        this.canRefund = res['body']['canRefund'];
                        for (let i = 0; i < this.electronicCouponsArray.length; i++) {
                            if (!this.totalPriceValue) {
                                this.totalPriceValue = this.electronicCouponsArray[i]['amount'];
                            } else {
                                this.totalPriceValue += this.electronicCouponsArray[i]['amount'];
                            }
                        }

                    }
                    if (this.currentActivityType === 'POINT') {
                        this.integralCoupon = this.electronicCouponsArray[0];
                    }
                    if (this.currentActivityType === 'AR') {
                        const stores = res['body']['arStore'];
                        for (let y = 0 ; y < stores.length ; y++ ) {
                            this.marketingManageService.getStoreByIdAC(stores[y].store).subscribe((rest => {
                                this.storeList.push(rest);
                            }));
                        }
                    }

                } else {
                    this.snackBar.open('营销详情接口数据为空', '✖');
                }
            }
        }, () => {

        });
        // this.searchActivityStagesList(id);
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


    // 团购添加券弹窗
    openGroupBuyDialog() {
 /*       this.priceAmount = null;
        this.canRefund = null;*/
        // this.otherExchangeIntegral = [{channel: null, integral: null}];
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

    // 获取活动阶段及优惠券(后期使用)
    searchActivityStagesList(id) {
        const param = '?activityId.equals=' + id;
        this.marketingManageService.searchActiveityStageData(param).subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    const resultData = res['body'];
                    for (let i = 0; i < resultData['length']; i++) {
                        this.activityStagesCouponsArray.push(JSON.parse(JSON.stringify(this.electronicCouponsArray)));
                    }
                    this.activityStageArray = res['body'];
                    for (let t = 0; t < this.activityStageArray.length; t++) {
                        // debugger;
                        if (this.activityStageArray[t]['coupons'] || this.activityStageArray[t]['coupons'].length > 0) {
                            for (let k = 0; k < this.activityStageArray[t]['coupons'].length; k++) {
                                for (let j = 0; j < this.activityStagesCouponsArray[t].length; j++) {
                                    if (this.activityStageArray[t]['coupons'][k]['id'] === this.activityStagesCouponsArray[t][j]['id']) {
                                        (this.activityStagesCouponsArray[t])[j]['remarks'] = 'test';
                                        break;
                                    }
                                }

                            }
                        }
                    }
                    /* for (let t = 0; t < this.activityStagesCouponsArray[0].length; t++){
                     }*/
                } else {
                    this.snackBar.open('该活动阶段数据为空', '✖');
                }
            }
        });
    }

    // 提交表单数据
    onSave() {

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
        if (this.currentActivityType === 'DEFAULT' || this.currentActivityType === 'GROUPBUY' || this.currentActivityType === 'POINT' || this.currentActivityType === 'AR') {
            this.profileForm.value['coupons'] = this.electronicCouponsArray;
            if (this.electronicCouponsArray.length <= 0 ) {
                this.snackBar.open('活动必须要关联一个券', '✖');
                return;
            }
            if (this.currentActivityType === 'POINT') {
                const exchangePoints = [];
                this.otherExchangeIntegral.forEach(
                    d => {
                        if (d.pointID !== -1 ) {
                            exchangePoints.push({ point: Number(d.integral), provider: (d.pointID).toString()  });
                        }
                    }
                );
                if (exchangePoints.length > 0) {
                    this.profileForm.value['exchangePoints'] = exchangePoints;
                }
            }
        }
        if (this.currentActivityType === 'GROUP'){
            if (this.groupingACoupons.length <= 0 && this.groupingBCoupons.length <= 0 && this.newAddGroupingCoupons.length <= 0){
                this.snackBar.open('活动必须要关联一个券', '✖');
                return;
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


        this.profileForm.value['preheatTime'] = MarketingManageEditComponent.formatToZoneDateTime(this.profileForm.value['preheatTime']);
        this.profileForm.value['beginTime'] = MarketingManageEditComponent.formatToZoneDateTime(this.profileForm.value['beginTime']);
        this.profileForm.value['endTime'] = MarketingManageEditComponent.formatToZoneDateTime(this.profileForm.value['endTime']);
        this.profileForm.value['name'] = this.nameInput.nativeElement.value.trim();
        this.profileForm.value['id'] = this.idInput.nativeElement.value;
        this.profileForm.value['ruleText'] = this.editorContent;
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

        /*if (this.activityStageArray.length > 0) {
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
        }*/


        this.btuDis = true ;
        // 更新整体活动信息
        this.marketingManageService.updateActivityDetailData(this.profileForm.value).subscribe((res) => {
            if (res.status === 200) {
                // this.router.navigateByUrl('apps/marketingManage');
                // 更新活动阶段相关信息
                // this.updateActivityStagesData();

                if (this.currentActivityType === 'DEFAULT' || this.currentActivityType === 'GROUPBUY' || this.currentActivityType === 'POINT'  || this.currentActivityType === 'AR') {
                    this.snackBar.open('修改营销成功', '✖');
                   // this.setActivityTags(res.body['id']);
                     this.router.navigateByUrl('apps/marketingManage');
                } else if (this.currentActivityType === 'GROUP') {
                    const activityId = this.route.snapshot.paramMap.get('id');
                    if (this.primitiveroupingCouponsCount === (2 + this.newAddGroupingCoupons.length)) {
                        /*如果相等将数据都更新*/

                        // 将其它组更新
                        if (this.newAddGroupingCoupons.length > 0) {
                            for (let i = 0; i < this.newAddGroupingCoupons.length; i++) {
                                const couponGroup = this.groupingCouponsResult[i + 2];
                                couponGroup['multiple'] = this.newAddGroupingStatus[i];
                                couponGroup['coupons'] = this.newAddGroupingCoupons[i];
                                this.marketingManageService.updateCouponGroupsData(couponGroup).subscribe(() => {
                                    this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                                    if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                        this.updateGroupsHttpCount = 0;
                                        this.snackBar.open('修改营销成功', '✖');
                                        // this.setActivityTags(res.body['id']);
                                        this.router.navigateByUrl('apps/marketingManage');
                                    }
                                }, () => {
                                });
                            }
                        }

                        // 将A组更新
                        const couponGroupA = this.groupingCouponsResult[0];
                        couponGroupA['multiple'] = this.groupingAStatus;
                        couponGroupA['coupons'] = this.groupingACoupons;
                        this.marketingManageService.updateCouponGroupsData(couponGroupA).subscribe(() => {
                            this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                            if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                this.updateGroupsHttpCount = 0;
                                this.snackBar.open('修改营销成功', '✖');
                                // this.setActivityTags(res.body['id']);
                                this.router.navigateByUrl('apps/marketingManage');
                            }

                        }, () => {
                        });
                        // 将B组更新
                        const couponGroupB = this.groupingCouponsResult[1];
                        couponGroupB['multiple'] = this.groupingBStatus;
                        couponGroupB['coupons'] = this.groupingBCoupons;
                        this.marketingManageService.updateCouponGroupsData(couponGroupB).subscribe(() => {
                            this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                            if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                this.updateGroupsHttpCount = 0;
                                this.snackBar.open('修改营销成功', '✖');
                                // this.setActivityTags(res.body['id']);
                                 this.router.navigateByUrl('apps/marketingManage');
                            }

                        }, () => {
                        });

                    } else if (this.primitiveroupingCouponsCount < (2 + this.newAddGroupingCoupons.length)) {
                        // 原始数组比修改后少，需新增更新内容。
                        // 将原始内容更新
                        // 将A组更新
                        const couponGroupA = this.groupingCouponsResult[0];
                        couponGroupA['multiple'] = this.groupingAStatus;
                        couponGroupA['coupons'] = this.groupingACoupons;
                        this.marketingManageService.updateCouponGroupsData(couponGroupA).subscribe(() => {
                            this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                            if (this.updateGroupsHttpCount === (2 + this.newAddGroupingCoupons.length)) {
                                this.updateGroupsHttpCount = 0;
                                this.snackBar.open('修改营销成功', '✖');
                               // this.setActivityTags(res.body['id']);
                                 this.router.navigateByUrl('apps/marketingManage');
                            }

                        }, () => {
                        });
                        // 将B组更新
                        const couponGroupB = this.groupingCouponsResult[1];
                        couponGroupB['multiple'] = this.groupingBStatus;
                        couponGroupB['coupons'] = this.groupingBCoupons;
                        this.marketingManageService.updateCouponGroupsData(couponGroupB).subscribe(() => {
                            this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                            if (this.updateGroupsHttpCount === (2 + this.newAddGroupingCoupons.length)) {
                                this.updateGroupsHttpCount = 0;
                                this.snackBar.open('修改营销成功', '✖');
                              //  this.setActivityTags(res.body['id']);
                                  this.router.navigateByUrl('apps/marketingManage');
                            }
                        }, () => {
                        });
                        // 将剩余更新
                        for (let i = 2; i < this.groupingCouponsResult.length; i++) {
                            const couponGroup = this.groupingCouponsResult[i];
                            couponGroup['multiple'] = this.newAddGroupingStatus[i - 2];
                            couponGroup['coupons'] = this.newAddGroupingCoupons[i - 2];
                            this.marketingManageService.updateCouponGroupsData(couponGroup).subscribe(() => {
                                this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                                if (this.updateGroupsHttpCount === (2 + this.newAddGroupingCoupons.length)) {
                                    this.updateGroupsHttpCount = 0;
                                    this.snackBar.open('修改营销成功', '✖');
                                   // this.setActivityTags(res.body['id']);
                                     this.router.navigateByUrl('apps/marketingManage');
                                }

                            }, () => {
                            });
                        }
                        // 将剩余新增到活动
                        for (let i = this.primitiveroupingCouponsCount; i < (this.newAddGroupingStatus.length + 2); i++) {
                            const newGroupJson = {};
                            const name = this.groupingCouponsOrders[i - 2];
                            const coupons = this.newAddGroupingCoupons[i - 2];
                            const multiple = this.newAddGroupingStatus[i - 2];
                            newGroupJson['name'] = name;
                            newGroupJson['coupons'] = coupons;
                            newGroupJson['multiple'] = multiple;
                            newGroupJson['activityId'] = activityId;
                            this.marketingManageService.createCouponGroupsData(newGroupJson).subscribe(() => {
                                this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                                if (this.updateGroupsHttpCount === (2 + this.newAddGroupingCoupons.length)) {
                                    this.updateGroupsHttpCount = 0;
                                    this.snackBar.open('修改营销成功', '✖');
                                   // this.setActivityTags(res.body['id']);
                                      this.router.navigateByUrl('apps/marketingManage');
                                }

                            }, () => {
                            });
                        }

                    } else {
                        // 将少于原始数据的券组更新，多余的删除
                        // 将A组更新
                        const couponGroupA = this.groupingCouponsResult[0];
                        couponGroupA['multiple'] = this.groupingAStatus;
                        couponGroupA['coupons'] = this.groupingACoupons;
                        this.marketingManageService.updateCouponGroupsData(couponGroupA).subscribe(() => {
                            this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                            if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                this.updateGroupsHttpCount = 0;
                                this.snackBar.open('修改营销成功', '✖');
                               // this.setActivityTags(res.body['id']);
                                  this.router.navigateByUrl('apps/marketingManage');
                            }
                        }, () => {
                        });
                        // 将B组更新
                        const couponGroupB = this.groupingCouponsResult[1];
                        couponGroupB['multiple'] = this.groupingBStatus;
                        couponGroupB['coupons'] = this.groupingBCoupons;
                        this.marketingManageService.updateCouponGroupsData(couponGroupB).subscribe(() => {
                            this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                            if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                this.updateGroupsHttpCount = 0;
                                this.snackBar.open('修改营销成功', '✖');
                                // this.setActivityTags(res.body['id']);
                                  this.router.navigateByUrl('apps/marketingManage');
                            }

                        }, () => {
                        });
                        // 将剩余更新
                        for (let i = 0; i < this.newAddGroupingCoupons.length; i++) {
                            const couponGroup = this.groupingCouponsResult[i + 2];
                            couponGroup['multiple'] = this.newAddGroupingStatus[i];
                            couponGroup['coupons'] = this.newAddGroupingCoupons[i];
                            this.marketingManageService.updateCouponGroupsData(couponGroup).subscribe(() => {
                                this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                                if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                    this.updateGroupsHttpCount = 0;
                                    this.snackBar.open('修改营销成功', '✖');
                                   // this.setActivityTags(res.body['id']);
                                    this.router.navigateByUrl('apps/marketingManage');
                                }

                            }, () => {
                            });
                        }
                        // 将剩余删除
                        for (let i = (2 + this.newAddGroupingCoupons.length); i < this.primitiveroupingCouponsCount; i++) {
                            const id = this.groupingCouponsResult[i]['id'];
                            this.marketingManageService.deleteCouponGroupsData(id).subscribe(() => {
                                this.updateGroupsHttpCount = this.updateGroupsHttpCount + 1;
                                if (this.updateGroupsHttpCount === this.primitiveroupingCouponsCount) {
                                    this.updateGroupsHttpCount = 0;
                                    this.snackBar.open('修改营销成功', '✖');
                                    // this.setActivityTags(res.body['id']);
                                     this.router.navigateByUrl('apps/marketingManage');
                                }
                            }, () => {
                            });
                        }

                    }
                }
            }
        }, () => {
            this.btuDis = false ;
        });
    }

    // 跳转到详情页面
    linkToDatail() {
        const id = this.route.snapshot.paramMap.get('id');
        this.router.navigateByUrl('apps/marketingManage/marketingManageDetail/' + id);
    }

    // 更新活动阶段数据(后期使用)
    updateActivityStagesData() {
        for (let i = 0; i < this.activityStageArray.length; i++) {
            const id = this.activityStageArray[i]['id'];
            // 有id的元素进行更新操作
            if (id) {
                this.marketingManageService.updateActivityStagesData(this.activityStageArray[i]).subscribe(() => {

                }, () => {

                });
            } else { //  无id元素进行新增操作
                this.activityStageArray[i]['activityId'] = this.route.snapshot.paramMap.get('id');
                this.marketingManageService.createCouponSatgeData(this.activityStageArray[i]).subscribe(() => {

                }, () => {

                });
            }
        }
        // 处理删除的数据
        if (this.primitiveActivityStages.length > 0) {
            for (let i = 0; i < this.primitiveActivityStages.length; i++) {
                const id = this.primitiveActivityStages[i]['id'];
                this.marketingManageService.deleteActivityStagesData(id).subscribe(() => {

                }, () => {

                });
            }
        }

        this.snackBar.open('修改营销成功', '✖');
        this.router.navigateByUrl('apps/marketingManage');
    }

    // 删去电子券列表中的某个电子券
    deleteCoupon(param) {
        this.electronicCouponsArray.splice(param, 1);
        this.otherExchangeIntegral = [{channel: null, integral: null , pointID: -1}];
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
                coupons: JSON.parse(JSON.stringify(this.electronicCouponsArray))
            });
            const newCouponArray = JSON.parse(JSON.stringify(this.electronicCouponsArray));
            for (let i = 0; i < newCouponArray.length; i++) {
                newCouponArray[i]['remarks'] = 'test';
            }
            this.activityStagesCouponsArray.push(newCouponArray);

        }
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

    // 删除活动
    delete_activity(index) {
        // alert(index);
        const deleteItem = this.activityStageArray[index];
        this.activityStageArray = this.activityStageArray.filter(item => item !== deleteItem);
        if (deleteItem.id) {
            this.primitiveActivityStages.push(deleteItem);
        }
    }


    changeActivityStatus(event, activityIndex, couponIndex, outId) {

        if (event.checked) {
            // 添加元素
            const addItemArray = this.electronicCouponsArray.filter(res => res.outId === outId);
            const addItem = addItemArray[0];
            this.activityStageArray[activityIndex]['coupons'].push(addItem);
        } else {
            // 删除元素
            const deleteItemArray = this.electronicCouponsArray.filter(res => res.outId === outId);
            const deleteItem = deleteItemArray[0];
            this.activityStageArray[activityIndex]['coupons'] = this.activityStageArray[activityIndex]['coupons'].filter(
                res => res.outId !== deleteItem.outId
            );
        }
    }

    // 选择时拿到选中商户
    onSelect() {
        if (this.currentActivityType === 'DEFAULT'  || this.currentActivityType === 'AR') {
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
        } else if (this.currentActivityType === 'GROUPBUY') {
            for (let i = 0; i < this.electronicCouponsArray.length; i++) {
                if (this.selectStores[0]['id'] === this.electronicCouponsArray[i]['id']) {
                    this.snackBar.open('该电子券已被选择', '✖');
                    this.selectStores = [];
                    return;
                }
            }
            this.groupBuyCoupon = this.selectStores[0];
        } else if (this.currentActivityType === 'POINT') {
            this.integralCoupon = this.selectStores[0];
        }

    }

    // 翻页
    onPage(event , p?) {
        this.page.page = event.offset;
        if (!this.inputValue) {
            if (p === 'COUPON_OF_GOODS'){
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
                    /* for (let i = 0; i < this.coupons.length; i++){
                         this.coupons[i]['canGift'] = this.translate.instant('no');
                         this.coupons[i]['canReturn'] = this.translate.instant('no');
                     }*/

                    this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                    this.dialog.open(this.corresponding, {
                        id: 'changeCorresponding',
                        width: '85%',
                    }).afterClosed().subscribe(r => {
                        if (r) {
                            if (this.selectStores.length > 0) {
                                if (param === false) {
                                    for (let i = 0; i < this.selectStores.length; i++) {
                                        this.electronicCouponsArray.push(this.selectStores[i]);
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
        }, () => {

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

    // 获取搜索字段可观测对象
    getSearchObservable(field): Observable<any> {
        return this.marketingManageService.searchCouponMaintainList('', 0, 0x3f3f3f3f, field + ',desc', field, this.inputValue);
    }

    // 获取团购搜索字段可观测对象
    getGroupBuySearchObservable(field, field1, defaultValue): Observable<any> {
        return this.marketingManageService.searchCouponMaintainList('', 0, 0x3f3f3f3f, field + ',desc', field, this.inputValue, field1, defaultValue);
    }



    // 商户搜索
    onStoreSearch() {
        if (this.inputValue) {
            const s1 = this.getSearchObservable('name');
            const s2 = this.getSearchObservable('outId');
            forkJoin([s1, s2]).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
            }, () => {

            });
        }
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

    // 改变新增券组的单选/多选状态
    changeNewGroupingStatus(event, index) {
        this.newAddGroupingStatus[index] = event.value === 'true';

    }

    // 删除组活动
    delete_grouping(index) {
        const deleteItem = this.newAddGroupingCoupons[index];
        this.newAddGroupingCoupons = this.newAddGroupingCoupons.filter(item => item !== deleteItem);
        this.newAddGroupingStatus.splice(index, 1);
    }

    // 添加组优惠券
    add_grouping_coupons() {
        this.newAddGroupingCoupons.push([]);
        this.newAddGroupingStatus.push(false);
        this.groupingActiviryCoupons.push(this.newAddGroupingCoupons);
    }

    // 开始时间选择后设定结束时间最小时间
    onStartSourceDate(event, beTime) {
        // const eventTime = new Date(event).getTime();
        // const beT = this.profileForm.get('preheatTime').value;
        // const veTim = new Date().getTime();
        beTime.picker.set('minDate', event);
    }

    // 反之
    onEndSourceDate(event, startTime) {
        startTime.picker.set('maxDate', event);
    }

    // 设置开始时间处于预热时间与结束时间中间
    onMiddleSourceDate(event, endTime, preheatTime) {
        endTime.picker.set('minDate', event);
        preheatTime.picker.set('maxDate', event);
    }

    // 打开预览的文件框
    openPreviewDilog(previewImgDloag) {
        if (this.currentActivityImgSaveId) {
            this.imgPreLoading = true;
            if (!this.dialog.getDialogById('previewImageDialog_')) {
                this.dialog.open(previewImgDloag, {
                    id: 'previewImageDialog_',
                    width: '600px',
                    height: '300px',
                    position: {top: '200px'} ,
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
                () => {

                });
        }
    }

    // 打开上传文件选项框
    openUploadImgDiloag(uploadImgDloag) {
        if (!this.dialog.getDialogById('uploadImageDialog_')) {
            this.uploadStatus = false;
            this.finishStatus = true;
            this.activiyFormData = null;
            this.activityImgName = '';
            this.dialog.open(uploadImgDloag, {
                id: 'uploadImageDialog_',
                width: '500px',
                height: '245px',
                position: {top: '200px'} ,
                hasBackdrop: true ,
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
        this.activiyFormData = new FormData();
        this.activityImgName = file.name;
        this.activiyFormData.append('files', file);
    }

    // 上传文件
    onUploadImg() {
        if (!this.activiyFormData) {
            this.snackBar.open('请选择一个文件', '✖');
            return;
        }
        this.notUploading = false;
        this.fileTransferService.uploadFile(this.activiyFormData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            // debugger;
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
            }
        }, () => {

        });
    }

    // 防止提交
    pseudoSubmit() {

    }

    // 获取列宽
    getColumnWidth() {
        const columnWidth = screen.width * 0.8;
        const integralColumnWidth = screen.width * 0.75 * 0.5;
        this.mCouponColumnWidth = columnWidth / (this.storeColumns.length + 1);
        this.integralColumnWith = integralColumnWidth / (this.integralCouponColumns.length + 1);
        this.groupBuyColumnWith = integralColumnWidth / (this.groupBuyCouponColumns.length + 1);

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

    // 下线
    onOffline() {
        this.snackBar.open('开发中', '✖');
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


    // checkbox选中营销标签
    onSelectTags(event) {
        this.selectedTags = event;
    }

    // 富文本编辑框 图片处理
    EditorCreatedEdit(event){
        const toolbar = event.getModule('toolbar');
        toolbar.addHandler('image', this.imageHandler.bind(this));
        this.editAdd = event;
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
                        const range = this.editAdd.getSelection(true);
                        const index = range.index + range.length;
                        this.editAdd.setSelection(1 + range.index);
                        this.editAdd.insertEmbed(range.index, 'image', sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res);
                        if (this.editorContent !== undefined && this.editorContent !== 'undefined' && this.editorContent !== '' && this.editorContent !== null && this.editorContent !== 'null'){
                            this.editorContent = this.editorContent + '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        } else {
                            this.editorContent = '<img src="' + sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + res + '">';
                        }
                        this.editAdd.focus();
                    }
                });
            }
        });
        Imageinput.click();
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

    onSelectMalls(event) {
        this.selectedMalls = event;
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

    deleteCouponAndAmount(param) {
        this.totalPriceValue -= this.electronicCouponsArray[param]['amount'];
        this.electronicCouponsArray.splice(param, 1);
    }

    getTagsByBrand(id){
        this.marketingManageService.getTagsByActivity(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.marketingTags = res['activityTag'];
            }
        );
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
                this.btuDis = false ;
                this.snackBar.open('标签绑定失败', '✖');
            },
            () => {}
        );
    }



    // 驳回
    onReject() {
        this.dialog.open(this.checkDialog, {
            id: 'checkDialogId',
            width: '400px',
            height: '246px',
            position: {top: '124px'} ,
            hasBackdrop: true ,
        });
    }

    // 审核通过 驳回
    reviewed(p){
        const id =  this.ACid;
        let ReviewVm;
        if ('no' === p){
            const rejectReason = document.getElementById('rejectReason');
            ReviewVm = {
                accept: false,
                rejectReason: rejectReason['value']
            };
        } else {
            ReviewVm = {
                accept: true,
                rejectReason: ''
            };
        }
        this.loading.show();
        this.btuDis = true;
        this.marketingManageService.activitiesReview(id , ReviewVm).subscribe(
            res => {
                this.loading.hide();
                this.snackBar.open('审核成功！！！', '✖');
                this.router.navigateByUrl('apps/marketingManage');
            }, error1 => { this.loading.hide();   this.btuDis = false; }
        );
    }


    // 打开预览窗口
    preAcCom(preAc){
        this.AcPreData = {
            name: this.marketingDetailJson.name,
            content: this.editorContent,
            cover:  this.marketingDetailJson.image,
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
                position: {right: '300px'} ,
                hasBackdrop: true ,
            });
        }
    }

    /*TransTime(time){
        const dateee = new Date(time).toJSON();
        const date = new Date(+new Date(dateee) + 8 * 3600 * 1000 ).toISOString().replace(/T/g , ' ').replace(/\.[\d]{3}Z/, '');
        return date.replace(/\//g, '-');
    }

*/

    setIntegralValue(e){
        const forbidden = /^[0-9]*[1-9][0-9]*$/.test(e.target.value);
        if (!forbidden) {
            e.target.value = null;
            this.exchangeIntegral = e.target.value;
            this.snackBar.open('请输入正确的兑换积分数量', '✖');
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

}
