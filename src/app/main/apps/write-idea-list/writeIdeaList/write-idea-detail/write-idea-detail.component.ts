import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {CommentEntity, WriteIdeaServiceService} from '../../writeIdeaService/write-idea-service.service';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {DomSanitizer} from '@angular/platform-browser';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {HttpClient} from '@angular/common/http';
import {CommentParameter} from '../../writeIdeaService/CommentParameter';
import {fuseAnimations} from '../../../../../../@fuse/animations';
import {Utils} from '../../../../../services/utils';
import {CurrencyPipe} from '@angular/common';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-write-idea-detail',
    templateUrl: './write-idea-detail.component.html',
    styleUrls: ['./write-idea-detail.component.scss'],
    animations: fuseAnimations
})
export class WriteIdeaDetailComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    title = '评论详情';
    comId: number; // 当前条数据的ID
    sysPra: SysPra;
    store: any; // 商户类
    article: any; // 文章
    number: any; // 会员详情
    commentNum: any; // 获取当前评论量
    configTime: any; // 设置时间
    writeIdeaForm: any;  // form表单
    type_store = CommentParameter.store;
    type_article = CommentParameter.article;

    btuDis = false;  // 保存提交时按钮不可更改

    editButShow = false; // 切换编辑保存态

    Comment: any ; // 当前页面备份


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
        private writeIdeaService: WriteIdeaServiceService,
        private currency: CurrencyPipe
    ) {
        this.writeIdeaForm = new FormBuilder().group({
            id: new FormControl({value: null, disabled: false}, [Validators.required]),  // 评论编号
            commentId: new FormControl({value: null, disabled: false}, [Validators.required]),  // 评论编号
            comment: new FormControl({value: null, disabled: true}, [Validators.required]),  // 评论 内容
            score: new FormControl({value: null, disabled: true}, [Validators.required]),    // 评分
            type: new FormControl({value: null, disabled: false}, [Validators.required]),  // 评论区（类型）
            mobile: new FormControl({value: null, disabled: false}, [Validators.required]), // 手机
            overhead: new FormControl({value: null, disabled: true}, [Validators.required]),   // 顶置
            time: new FormControl({value: '', disabled: true}, [Validators.required]),       // 评论时间
            reply: new FormControl({value: null, disabled: true}, [Validators.required]),   // 回复
            enabled: new FormControl({value: null, disabled: true}, [Validators.required]),  // 评论是否异常
            storeId: new FormControl({value: null, disabled: false}, [Validators.required]),  // 商户编号（不是数据id）
            articleId: new FormControl({value: null, disabled: false}, [Validators.required]),  // 文章编号 不是数据id
            createdBy: new FormControl({value: null, disabled: false}, [Validators.required]), // 创建人
            createdDate: new FormControl({value: null, disabled: false}, [Validators.required]), // 创建时间
            lastModifiedBy: new FormControl({value: null, disabled: true}, [Validators.required]), // 修改人
            lastModifiedDate: new FormControl({value: null, disabled: true}, [Validators.required]), // 修改时间
            giveCounts: new FormControl({value: null , disabled: true}, [Validators.required] ), // 点赞
            exception: new FormControl({value: null , disabled: true}, [Validators.required] ), // 是否异常
        });
    }

    ngOnInit() {
        this.initPram();
        this.getCommentID();
    }

    initPram() {
        this.sysPra = new SysPra();
        this.sysPra.PlaceTopSource = [
            {id: false, value: this.translate.instant('PuSentiment.list.no')}, // 否
            {id: true,  value:  this.translate.instant('PuSentiment.list.yes')},  // 是
        ];
        this.sysPra.enabledSource = [
            {id: false, value: this.translate.instant('PuSentiment.list.unusual')}, // 异常
            {id: true,  value: this.translate.instant('PuSentiment.list.usual')},  // 正常
        ];
        this.sysPra.imgSrcSource = [];
        this.configTime = {
            enableTime: true,
            time_24hr: true,
            enableSeconds: true,
            defaultHour: '0',
            defaultMinute: '0',
            defaultSeconds: '0'
        };
    }

    // 获取评论ID
    getCommentID() {
        this.routeInfo.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(
            (param: Params) => {
                this.comId = param.id;
                this.getCommentInfo(param.id);
            }
        );
    }

    // 获取评论详情
    getCommentInfo(id) {
        this.writeIdeaService.getCommentById(id).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                res.time = this.dateTransform.transform(res.time);
                res.lastModifiedDate = this.dateTransform.transform(res.lastModifiedDate);
                this.sysPra.type = res.type;
                this.sysPra.starRating = Number(res.score);
                if (res.giveCounts !== 'undefined' && res.giveCounts !== undefined && res.giveCounts !== '' && res.giveCounts !== null && res.giveCounts !== 'string'){
                    res.giveCounts = this.currency.transform(this.utils.toNumber(res.giveCounts), '', '', '1.0-0');
                }
                this.writeIdeaForm.patchValue(res);
                this.Comment = res;
                if (res.images !== 'undefined' && res.images !== undefined && res.images !== '' && res.images !== null && res.images !== 'string') {
                    if (res.images.includes(',')) {
                        const imgs = res.images.split(',');
                         for (let r = 0 ; r < imgs.length ; r++) {
                             this.sysPra.imgSrcSource[r] = {srcUrl: sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=' + imgs[r]};
                         }
                    } else {
                        this.sysPra.imgSrcSource[0] = {srcUrl:  sessionStorage.getItem('baseUrl') +  'file/api/file/showImg?saveId=' + res.images};
                    }
                } else {
                    this.sysPra.imgSrcSource = [
                        {srcUrl: 'assets/images/cards/imgDe.png'},
                        {srcUrl: 'assets/images/cards/imgDe.png'},
                        {srcUrl: 'assets/images/cards/imgDe.png'},
                    ];
                }

                if (res.type === CommentParameter.store) {
                    this.getStoreInfo(res.storeId);
                }
                if (res.type === CommentParameter.article) {
                    this.getComArticleInfo(res.articleId);
                    this.getCommentCount(res.commentId);
                }
                this.getNumberInfo(res.mobile);
            }
        );
    }

    // 获取商户详情
    getStoreInfo(storeId) {

        this.writeIdeaService.getComStoreByStoreId(storeId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                if (res.logo === '' || res.logo === null || res.logo === 'null' ||
                    res.logo === 'string' || res.logo === 'undefined'  || res.logo === undefined) {
                    res.logo = 'assets/images/cards/imgDe.png';
                }
                this.store = res;
            }
        );
    }

    // 获取文章详情
    getComArticleInfo(articleId) {
        this.writeIdeaService.getComArticleById(articleId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.article = res[0];
            }
        );
    }

    // 获取当前评论量
    getCommentCount(commentId) {
        this.writeIdeaService.getCommentCount(commentId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.commentNum = this.changNumUnit(res);
            }
        );

    }


    // 获取会员详情
    getNumberInfo(mobile) {
        this.writeIdeaService.getNumberByMobile(mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                res[0].createdDate = this.dateTransform.transform(res[0].createdDate);
                const lo_Img = res[0].avatar;
                if (!this.IsNull(lo_Img)){
                    res[0].avatar = 'assets/images/cards/imgDe.png';
                }

                this.number = res[0];
            }
        );
    }


    // 点击编辑按钮使页面可编辑
    editForm(){
        this.writeIdeaForm.get('overhead').enable();
        this.writeIdeaForm.get('reply').enable();
        this.editButShow = true;
    }

    // 取消编辑状态，改成不可编辑态
    cancelEditForm(){
        const com_str = JSON.stringify(this.Comment);
        const com_json = JSON.parse(com_str);
        this.writeIdeaForm.get('overhead').patchValue(com_json.overhead);
        this.writeIdeaForm.get('reply').patchValue(com_json.reply);
        this.writeIdeaForm.disable();
        this.editButShow = false;
    }

    // 保存
    editSave() {
        this.btuDis = true ;
        const comValue = this.writeIdeaForm.getRawValue();
     /*   const ver = this.setVerification(comValue);
        if (ver) {
            return true;
        }*/
        comValue.lastModifiedDate = this.formatToZoneDateTime(comValue.lastModifiedDate);
        comValue.time = this.formatToZoneDateTime(comValue.time);
        comValue.score = Number(comValue.score);
        //  comValue.enabled === '正常' ? comValue.enabled = true :  comValue.enabled = false;
        this.writeIdeaService.updateComments(comValue).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {

                this.snackBar.open(this.translate.instant('PuSentiment.list.tips1'), '✖'); // 更新成功
                this.router.navigate(['/apps/WriteIdeaList']);
            }, error1 => {  this.btuDis = false ; }
        );
    }


 /*   // 创建几条数据
    creatCom(){
        const  com = new CommentEntity();
        com.id = null ;
        com.commentId = '';
        com.comment = 'R1测试文章异常1';
        com.score = 1.5 ;
        com.type = CommentParameter.article;
        com.mobile = '18800105315';
        com.overhead = false ;
        com.time = new Date().toISOString();
        com.reply = '111111';
        com.exception = false ;
        com.giveCounts = 1134;
        com.storeId = '';
        com.articleId = '20200117150340';
        com.enabled = true;
        com.createdBy = null;
        com.createdDate = null;
        com.lastModifiedBy = null;
        com.lastModifiedDate = null;
        this.writeIdeaService.createComment(com).pipe().subscribe(res => {
            this.snackBar.open('保存成功！', '✖');
        });
    }*/



   // 创建 商户数据
   /* creatSH(){
       const sh = {
           areaNo : 'L1-105',
           brandCN :  'string',
            brandEN :  'Marble',
            businessType :  '生活配套',
            businessTypeId :  0,
            createdBy:  'string',
            createdDate :  '2020-02-25T01:44:08.953Z',
            customerPrice :  0,
            desc :  'string',
            enabled :  true,
            floor :  'L1',
            id :  null,
            image1 :  'string',
            image2 :  'string',
            image3:  'string',
            image4:  'string',
            image5 : 'string',
            labels :   [],
            lastModifiedBy : 'string',
            lastModifiedDate:  '2020-02-25T01:44:08.953Z',
            logo : 'string',
            mallId : 'string',
            mallName:  'string',
            openTime : 'string',
           score :  'string',
            secondType :  'string',
            secondTypeId :   0,
           showName :  'string',
            source :  'STOCK_CRM',
            storeId :  '001500004',
            storeName :  '测试的6个',
            storeNo :  'HX_00044',
            terminalName :  'string',
            terminalNo :  'string'
       };
       this.writeIdeaService.creatSH(sh).pipe().subscribe( res => {
           this.snackBar.open('保存成功！', '✖');
       });
    }*/
    // 检测分值的变化
    scoreChange() {
        if (this.writeIdeaForm.controls.score.value > 5) {
            this.writeIdeaForm.controls.score.patchValue(5);
        }
        this.sysPra.starRating = this.writeIdeaForm.controls.score.value;
        this.sysPra.starRating = Number(this.sysPra.starRating);
    }


    setVerification(comValue) {
        if (!comValue.score) {
            this.snackBar.open(this.translate.instant('PuSentiment.list.tips2'), '✖'); // 商户必须打分
            return true;
        }
        return false;
    }


    getRatingNumber(e) {
        this.sysPra.starRating = e;
    }

    // 去会员详情页
    goToNumberDetail(e, id) {
        this.loading.show();
        this.router.navigate(['/apps/passengersManage/passengersManageDetail/' + id]).then(res => {
            this.loading.hide();
        });
    }

    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

    // 如果数字超多一万，就省略成以万为单位的数字
    changNumUnit(num) {
        if (num.length >= 5) {
            const reg = Number(num) / 10000;
            const value = reg.toFixed(1);
            return value + this.translate.instant('PuSentiment.list.tenThousand');  // 万
        } else {
            return num;
        }
    }


    goBack() {
        history.back();
    }



    IsNull(para) {
        if (para !== undefined && para !== 'undefined'
            && para !== 'string' && para !== '' && para !== 'null' && para !== null) {
            return true;
        } else {
            return false;
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}


export class SysPra {
    PlaceTopSource: any; // 置顶选择框
    starRating: number;  // 星星值
    imgSrcSource: any; // 显示的店铺图片信息变量
    enabledSource: any; // 是否正常
    type: string; // 当前评论类型
}