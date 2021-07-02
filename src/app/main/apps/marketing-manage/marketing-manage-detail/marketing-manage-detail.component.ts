import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {FileTransferService} from '../../../../services/file-transfer.service';
import {DomSanitizer} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Coupon} from '../marketing-manage-add/marketing-manage-add.component';
import {MallService} from '../../../../services/mallService/mall-service.service';
import {MarketingManageService} from '../marketing-manage.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';

@Component({
    selector: 'app-marketing-manage-detail',
    templateUrl: './marketing-manage-detail.component.html',
    styleUrls: ['./marketing-manage-detail.component.scss'],
    animations: fuseAnimations
})
export class MarketingManageDetailComponent implements OnInit {
    private _unsubscribeAll: Subject<any> = new Subject();
    // 富文本框中类容
    editorContent: any;
    @ViewChild('LableDialog', {static: true}) LableDialog: TemplateRef<any>;
    @ViewChild('AddTicketDialog', {static: true}) AddTicketDialog: TemplateRef<any>;
    @ViewChild('checkDialog', {static: true}) checkDialog: TemplateRef<any>;
    @ViewChild('preheatTime', {static: true}) preheatTime: ElementRef;
    @ViewChild('beginTime', {static: true}) beginTime: ElementRef;
    @ViewChild('endTime', {static: true}) endTime: ElementRef;
    profileForm = new FormGroup({
        name: new FormControl(),   // 标题
        id: new FormControl(),  // 页面ID
        preheatTime: new FormControl(), // 预热时间
        beginTime: new FormControl(), // 开始时间
        endTime: new FormControl(), // 结束时间
        ruleText: new FormControl(), // 活动规则
        activityType: new FormControl(), // 活动类型
        reviewStatus: new FormControl(), // 审核状态
        reviewResult: new FormControl(), // 审核结果
        rejectReason: new FormControl(), // 驳回原因
    });
    marketingDetailJson: any = null;
    // 电子券数组
    electronicCouponsArray: Coupon[];
    // 活动阶段数组
    activityStageArray: any;
    // 活动阶段优惠券数组
    activityStagesCouponsArray = [];
    // 活动类型
    currentActivityType: any;
    groupingACoupons = []; //  A组的优惠券
    groupingBCoupons = []; // B组的优惠券
    newAddGroupingCoupons = []; // 新增的组优惠券
    groupingCouponsOrders = ['C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    groupingAStatus: any; // 存储A组优惠券的单选/多选状态
    groupingBStatus: any; // 存储B组优惠券的单选/多选状态
    newAddGroupingStatus = []; // 存储新增优惠券的单选/多选状态
    imgSrc = null; // 预览图片路径
    marketingTags = []; // 标签
    userType = '';
    amount: number; // 商品券售价
    pageTitle = 'marketingManage.detailMarketing.detailTitle';
    mallList = [];
    integralCoupon: Coupon;
    exchangeIntegral;
    canRefund = true; // 是否允许退款
    totalPriceValue: number; // 所有团购券的总价值
    totalSellingPrice: number; //  总售价
    AcData: any; // 当前页面的数据
    AcPreData: any; // 预览传入的数据
    imgPreLoading = false; // 图片预览加载条
    btuDis = false ;

    toExamine = false ;

    TYPE_BCIA_TT_CRM = '';
    TYPE_DEFAULT = '';

    // AR 活动
    storeList = []; // 显示的商户标签
    selectedShops = []; // 弹框选择的商户数组

    constructor(
        private dialog: MatDialog,
        private marketingManageService: MarketingManageService,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private router: Router,
        private loading: FuseProgressBarService,
        private  fileTransferService: FileTransferService,
        private sanitizer: DomSanitizer,
        private translate: TranslateService,
        private mallService: MallService,
        private dateTransform: NewDateTransformPipe,
    ) {
    }

    ngOnInit() {
        this.TYPE_BCIA_TT_CRM = this.translate.instant('marketingManage.BCIA_TT_CRM_TYPE'); // 股份会员
        this.TYPE_DEFAULT = this.translate.instant('marketingManage.DEFAULT'); // 精准营销
        if (this.userType === 'super') {
            this.pageTitle = '审核详情';
        }
        this.searchActivityDetailById();
    }

    // 通过id获取活动详情
    searchActivityDetailById() {
        const id = +this.route.snapshot.paramMap.get('id');
        this.marketingManageService.searchActivityListById(id).subscribe(res => {
            if (res.status === 200) {
                if (res['body']) {
                    this.AcData = res['body'];
                    this.getTagsByBrand(res['body']['id']);
                    this.marketingDetailJson = res['body'];
                    const auth = sessionStorage.getItem('auth');
                    if (auth){
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


                    this.marketingDetailJson.preheatTime = this.dateTransform.transform(this.marketingDetailJson.preheatTime);
                    this.marketingDetailJson.beginTime = this.dateTransform.transform(this.marketingDetailJson.beginTime);
                    this.marketingDetailJson.endTime = this.dateTransform.transform(this.marketingDetailJson.endTime);


                    this.currentActivityType = res['body']['activityType'];
                    this.editorContent = this.marketingDetailJson['ruleText'];
                    this.electronicCouponsArray = res['body']['coupons'];
                    this.exchangeIntegral = res['body']['point'];
                    this.canRefund = res['body']['canRefund'];
                    const mallIds = res['body']['mall'];
                    for (let i = 0; i < mallIds.length; i++) {
                        this.mallService.getMallById(mallIds[i]).subscribe((rest => {
                            this.mallList.push(rest['body']);
                        }));
                    }
                    /*查询活动分组数据*/
                    if (this.currentActivityType === 'GROUP') {
                        const param = '?activityId.equals=' + id + '&sort=name';
                        this.marketingManageService.getCouponGroupsData(param).subscribe(result => {
                            if (result.status === 200) {
                                if (result['body']) {
                                    const allCouponsGroup = result['body'];
                                    if (allCouponsGroup['length'] >= 1) {
                                        this.groupingACoupons = allCouponsGroup[0]['coupons'];
                                        this.groupingAStatus = allCouponsGroup[0]['multiple'] + '';
                                    }
                                    if (allCouponsGroup['length'] >= 2) {
                                        this.groupingBCoupons = allCouponsGroup[1]['coupons'];
                                        this.groupingBStatus = allCouponsGroup[1]['multiple'] + '';
                                    }
                                    if (allCouponsGroup['length'] >= 3) {
                                        for (let i = 2; i < allCouponsGroup['length']; i++) {
                                            this.newAddGroupingCoupons.push(allCouponsGroup[i]['coupons']);
                                            this.newAddGroupingStatus.push(allCouponsGroup[i]['multiple'] + '');
                                        }
                                    }
                                } else {
                                    this.snackBar.open('分组活动接口数据为空', '✖');
                                }
                            }
                        }, () => {
                        });
                    }
                    // 团购券数据
                    if (this.currentActivityType === 'GROUPBUY') {
                        this.totalSellingPrice = res['body']['amount'];
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
                    // this.searchActivityStagesList(id);
                } else {
                    this.snackBar.open('营销详情接口数据为空', '✖');
                }
            }
        }, () => {
        });
    }

    // 获取活动阶段及优惠券(后续使用)
    searchActivityStagesList(id) {
        const param = '?activityId.equals=' + id;
        this.marketingManageService.searchActiveityStageData(param).subscribe((res) => {
            if (res.status === 200) {
                if (res['body']) {
                    const resultData = res['body'];
                    for (let i = 0; i < resultData['length']; i++) { // this.electronicCouponsArray
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
                } else {
                    this.snackBar.open('该活动阶段数据为空', '✖');
                }
            } else {
                this.snackBar.open('活动阶段接口错误', '✖');
            }
        });
    }


    // 跳转到编辑页面
    linkToEdit() {
        this.btuDis = true ;
        const id = this.route.snapshot.paramMap.get('id');
        this.router.navigateByUrl('apps/marketingManage/marketingManageEdit/' + id);
    }

    // 打开预览的文件框
    openPreviewDilog(previewImgDloag) {
        if (this.marketingDetailJson.image) {
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
            this.fileTransferService.previewFile(this.marketingDetailJson.image).pipe(takeUntil(this._unsubscribeAll)).subscribe(
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
        } else {
            this.snackBar.open(this.translate.instant('该活动未上传图片！'), '✖');
            return;
        }

    }




    getTagsByBrand(id) {
        this.marketingManageService.getTagsByActivity(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.marketingTags = res['activityTag'];
            }
        );
    }


    // 防止提交
    pseudoSubmit() {

    }

    // 下线
    onOffline() {
        this.snackBar.open('开发中', '✖');
    }

    // 驳回
    onReject() {
        this.dialog.open(this.checkDialog, {
            id: 'checkDialogId',
            width: '400px',
            height: '246px',
            position: {top: '124px'},
            hasBackdrop: true ,
        });
    }

    // 审核通过 驳回
    reviewed(p){
        const id = this.AcData.id;
     //   this.AcData.reviewStatus = true ;
        let ReviewVm;
        if ('no' === p){
            const rejectReason = document.getElementById('rejectReason');
            ReviewVm = {
                accept: false,
                rejectReason: rejectReason['value']
            };
           // this.AcData.reviewResult = false ;
        } else {
            ReviewVm = {
                accept: true,
                rejectReason: ''
            };
         //   this.AcData.reviewResult = true ;
        }
        this.btuDis = true ;
        this.loading.show();
        this.marketingManageService.activitiesReview(id , ReviewVm).subscribe(
            res => {
                this.snackBar.open('审核成功！！！', '✖');
                this.router.navigateByUrl('apps/marketingManage');
            }, error1 => { this.loading.hide();  this.btuDis = false ; }
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
                position: {right: '300px'},
                hasBackdrop: true ,
            });
        }
    }


   /* TransTime(time){
        const dateee = new Date(time).toJSON();
        const date = new Date(+new Date(dateee) + 8 * 3600 * 1000 ).toISOString().replace(/T/g , ' ').replace(/\.[\d]{3}Z/, '');
        return date.replace(/\//g, '-');
    }*/

    // 发布
  /*  toPublish() {
        this.AcData.enabled = true ;
        this.marketingManageService.updateActivityDetailData(this.AcData).subscribe(
            res => {
                this.snackBar.open('发布成功！！！', '✖');
            }
        );
    }*/

}

