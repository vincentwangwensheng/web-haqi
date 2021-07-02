import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {WriteIdeaServiceService} from '../writeIdeaService/write-idea-service.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {takeUntil} from 'rxjs/operators';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {CommentParameter} from '../writeIdeaService/CommentParameter';
import {Utils} from '../../../../services/utils';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-write-idea-control',
    templateUrl: './write-idea-control.component.html',
    styleUrls: ['./write-idea-control.component.scss'],
    animations: fuseAnimations
})
export class WriteIdeaControlComponent implements OnInit, OnDestroy   {
    private _unsubscribeAll: Subject<any> = new Subject();
    sysPra: SysPra; // 系统参数
    FormOption: any;
    unusualData: any; // 异常评论 数据集
    hotTrack: any; // 热点追踪实体数据集
    commentDetail: any; // 评论详情
    type_store = CommentParameter.store;
    type_article = CommentParameter.article;
    type_store_CN = '';
    type_article_CN = '';
    DetailLoading = false ;

    /** 异常评论列表 **/
    commentColumns = [{name: 'comment'}  , {name: 'type'} , {name: 'mobile'} , {name: 'time'}, {name: 'operation'}];
    commentSource: any[] = [];
    commentHeaders: any;
    commentPage = {page: 0, size: 9, count: 0}; // 分页
    commentColumnWidth;


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
        private http: HttpClient,
        private writeIdeaService: WriteIdeaServiceService
    ) {
        this.FormOption = new FormBuilder().group({
            test: new FormControl({value: null, disabled: false}, [Validators.required]),
        });
    }

    ngOnInit() {
        this.initPara();
        this.getColumnWidth();
        this.initData();
    }


    initPara() {
        this.type_store_CN = this.translate.instant('PuSentiment.control.store');
        this.type_article_CN = this.translate.instant('PuSentiment.control.article');
        this.sysPra = new SysPra();
        this.sysPra.initStr = 'all';
        this.sysPra.source = [
            {id: 'all', value: this.translate.instant('PuSentiment.control.all')},
            {id: CommentParameter.store, value: this.translate.instant('PuSentiment.control.store')},
            {id: CommentParameter.article, value: this.translate.instant('PuSentiment.control.article')}
        ];
        this.commentDetail = null;
        this.unusualData = [];
        // 【热点追踪】 标题，阅读量，评论，评分，商户名称，地址，类型 . writeContent[昵称 ， 评论内容] 评论展示只取前两条
        this.hotTrack = [];
        this.commentHeaders = new Map([
            ['comment', '内容'] , ['type', '评论区'], ['mobile', '手机号'] , ['time', '评论时间'], ['operation', '操作']
        ]);

    }

    initData() {
       // this.getExceptionComm();
        this.getCommentListVM();
        this.onComList(); // 异常信息列表
    }

    //  拿到舆情监控的列表
    getCommentListVM() {
        this.writeIdeaService.getCommentListVM().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const content = res.body;
                if (content.length === 0) {
                    this.snackBar.open(this.translate.instant('PuSentiment.control.tips1'), '✖'); //  热点追踪列表没有数据！
                    return;
                }
                for (let i = 0; i < 5; i++) {
                    const r = content[i];
                    if (r !== undefined && r !== 'undefined') {
                        if (r.storeId !== '' && r.storeId !== null && r.storeId !== 'undefined' && r.storeId !== undefined) {
                            this.getStoreInfo(r.storeId, r, i);
                        }
                        if (r.articleId !== '' && r.articleId !== null && r.articleId !== 'undefined' && r.articleId !== undefined) {
                            this.getComArticleInfo(r.articleId, r, i);
                        }
                    }

                }
            }
        );
    }

    // 根据storeId拿到商户数据
    // 获取商户详情
    getStoreInfo(storeId, r, a) {
        this.writeIdeaService.getComStoreByStoreId(storeId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                // logoImg 暂时为null ，因为会员数据没有头像
                let res_logo = 'assets/images/cards/imgDe.png';
                if (res.logo !== undefined && res.logo !== 'undefined'
                    && res.logo !== 'string' && res.logo !== '' && res.logo !== 'null' && res.logo !== null) {
                    res_logo = res.logo;
                }
                const writeContent = [];
                r.list.forEach(
                    com => {
                        this.writeIdeaService.getNumberByMobile(com.mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                            res_n => {
                               let lo_Img = res_n[0].avatar;
                               if (!this.IsNull(lo_Img)){
                                   lo_Img = 'assets/images/cards/imgDe.png';
                               }

                                writeContent.push({
                                    logoImg: lo_Img, // 'assets/images/cards/imgDe.png',
                                    nickName: res_n[0].name,
                                    comment: com.comment,
                                    time: this.dateTransform.transform(com.time)
                                });
                            }
                        );
                    }
                );

                this.hotTrack[a] = {
                    storeId: r.storeId,
                    title: '',
                    lookNum: this.changNumUnit(''),
                    writeNum: this.changNumUnit(r.commentCount + ''),
                    lookNumUnit: this.showUnit(''),
                    writeNumUnit: this.showUnit(r.commentCount + ''),
                    grade: r.score,
                    meName: res.storeName,
                    address: res.terminalName + res.floor,
                    type: this.type_store,
                    logoImg: res_logo,
                    writeContent: writeContent
                };
            }
        );
    }


    // 获取文章详情
    getComArticleInfo(articleId, r, a) {
        this.writeIdeaService.getComArticleById(articleId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const writeContent = [];
                r.list.forEach(
                    com => {
                        this.writeIdeaService.getNumberByMobile(com.mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                            res_n => {
                                let lo_Img = res_n[0].avatar;
                                if (!this.IsNull(lo_Img)){
                                    lo_Img = 'assets/images/cards/imgDe.png';
                                }
                                writeContent.push({
                                    logoImg: lo_Img,
                                    nickName: res_n[0].name,
                                    comment: com.comment,
                                    time: this.dateTransform.transform(com.time)
                                });
                            }
                        );
                    }
                );
                // 【热点追踪】 标题，阅读量，评论，评分，商户名称，地址，类型 . writeContent[昵称 ， 评论内容] 评论展示只取前两条
                this.hotTrack[a] = {
                    articleId: r.articleId,
                    title: res[0].articleTitle,
                    lookNum: this.changNumUnit(res[0].articleReadTime),
                    writeNum: this.changNumUnit(r.commentCount + ''),
                    lookNumUnit: this.showUnit(res[0].articleReadTime),
                    writeNumUnit: this.showUnit(r.commentCount + ''),
                    grade: r.score,
                    meName: '',
                    address: '',
                    type: this.type_article,
                    logoImg: '',
                    writeContent: writeContent
                };
            }
        );
    }


    // 获取全部异常信息
    getExceptionComm() {
        this.writeIdeaService.getExceptionComm().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                const content = res.content;
                if (content.length === 0) {
                    this.snackBar.open(this.translate.instant('PuSentiment.control.tips2'), '✖'); //  暂时没有异常评论！
                    return true;
                }
                for (let i = 0; i < 5; i++) {
                    const r = content[i];
                    this.writeIdeaService.getNumberByMobile(r.mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        res_ => {
                            let lo_Img = res_[0].avatar;
                            if (!this.IsNull(lo_Img)){
                                lo_Img = 'assets/images/cards/imgDe.png';
                            }
                            this.unusualData[i] = {
                                id: r.id,
                                logoImg: lo_Img, // 'assets/images/cards/imgDe.png',
                                nickName: res_[0].name,
                                content: r.comment,
                                date: this.dateTransform.transform(r.time)
                            };
                        }
                    );
                }
            }
        );
    }


    comSearch(e) {
        const filter = [];
        let value = '';
        if (e === 'other') {
            const controlInput = this.document.nativeElement.querySelector('#controlInput');
            value = controlInput.value;
        } else {
            const value_ = e.target.value;
            if (value_ === '') {
                value = value_;
            } else {
                return true;
            }
        }

        if (value !== '') {
            filter.push({name: 'comment', value: value , reg: 'contains'});
        }
        if (this.sysPra.initStr !== 'all') {
            filter.push({name: 'type', value: this.sysPra.initStr , reg: 'equals'});
        }
        filter.push({name: 'exception', value: false  , reg: 'equals'}) ;
        this.getComList(filter);
        // this.writeIdeaService.getExceptionCommSearch(value, this.sysPra.initStr).pipe(takeUntil(this._unsubscribeAll)).subscribe(
        //     res => {
        //         this.unusualData = [];
        //         const content = res.content;
        //         for (let i = 0; i < 5; i++) {
        //             const r = content[i];
        //             this.writeIdeaService.getNumberByMobile(r.mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
        //                 res_ => {
        //                     let lo_Img = res_[0].avatar;
        //                     if (!this.IsNull(lo_Img)){
        //                         lo_Img = 'assets/images/cards/imgDe.png';
        //                     }
        //
        //                     this.unusualData.push({
        //                         id: r.id,
        //                         logoImg: lo_Img, // 'assets/images/cards/imgDe.png',
        //                         nickName: res_[0].name,
        //                         content: r.comment,
        //                         date: this.dateTransform.transform(r.time)
        //                     });
        //                 }
        //             );
        //         }
        //     }
        // );

    }


    getRatingNumber(e) {
        console.log(e); // 拿到选中的评分级
    }

    // 打开异常评论的弹窗
    openCommentDetail(CommentDetailDialog, con) {
        if (con.type === this.type_store) {
            this.getExceptionCommByStoreID(CommentDetailDialog, con);
        } else {
            this.getExceptionCommByArticleId(CommentDetailDialog, con);
        }

    }

    // 根据商户ID拿到对应的商户的异常评论
    getExceptionCommByStoreID(CommentDetailDialog, con) {
        this.DetailLoading = true;
        if (!this.dialog.getDialogById('CommentDetailDialogClass')) {
            this.dialog.open(CommentDetailDialog, {
                id: 'CommentDetailDialogClass',
                width: '560px',
                height: '517px'
            }).afterClosed().subscribe(res => {

            });
        }
        this.writeIdeaService.getExceptionCommByStoreID(con.storeId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.commentDetail = [];
                const writeContent = [];
                const content = res.content;
                this.commentDetail = {
                    type: this.type_store,
                    meName: con.meName,
                    address: con.address,
                    writeContent: writeContent
                };
                for (let i = 0; i < content.length; i++) {
                    const r = content[i];
                    this.writeIdeaService.getNumberByMobile(r.mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        res_ => {
                            let lo_Img = res_[0].avatar;
                            if (!this.IsNull(lo_Img)){
                                lo_Img = 'assets/images/cards/imgDe.png';
                            }
                            writeContent[i] = {
                                logoImg: lo_Img, // 'assets/images/cards/imgDe.png',
                                nickName: res_[0].name,
                                comment: r.comment,
                                time: this.dateTransform.transform(r.time)
                            };
                        }
                    );
                    if (i === content.length - 1 ) {
                        this.DetailLoading = false;
                    }
                }
            });
    }

    // 根据文章ID拿到对应的文章的异常评论
    getExceptionCommByArticleId(CommentDetailDialog, con) {
        this.DetailLoading = true;
        if (!this.dialog.getDialogById('CommentDetailDialogClass')) {
            this.dialog.open(CommentDetailDialog, {
                id: 'CommentDetailDialogClass',
                width: '560px',
                height: '517px',
                hasBackdrop: true
            }).afterClosed().subscribe(res => {

            });
        }
        this.writeIdeaService.getExceptionCommByArticleId(con.articleId).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.commentDetail = [];
                const writeContent = [];
                const content = res.content;
                this.commentDetail = {type: this.type_article, title: con.title, writeContent: writeContent};
                for (let i = 0; i < content.length; i++) {
                    const r = content[i];

                    this.writeIdeaService.getNumberByMobile(r.mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                        res_ => {
                            let lo_Img = res_[0].avatar;
                            if (!this.IsNull(lo_Img)){
                                lo_Img = 'assets/images/cards/imgDe.png';
                            }
                            writeContent[i] = {
                                logoImg: lo_Img, //  'assets/images/cards/imgDe.png',
                                nickName: res_[0].name,
                                comment: r.comment,
                                time: this.dateTransform.transform(r.time)
                            };
                        }
                    );

                    if (i === (content.length - 1 )) {
                        this.DetailLoading = false;
                    }
                }
            });
    }




    /** 绑定评论列表 **/


    // 获取列宽
    getColumnWidth() {
        const columnWidth = (document.getElementById('rightContentList').offsetWidth);
        this.commentColumnWidth = columnWidth / (this.commentColumns.length + 1);
        window.addEventListener('resize' , () => {
            this.getColumnWidth();
        });
    }

    onPage(event) {
        this.commentPage.page = event.offset;
        this.commentSource = [];
        this.getComList();
    }

    // 全维护列表
    onComList() {
        this.commentPage.page = 0;
        this.commentSource =  [];
        this.getComList();
    }

    // 拿到所有的用户信息并过滤出当前所需要的
    getComList(filter?){
        this.loading.show();
        if (!filter){
            filter = [{name: 'exception', value: false}];
        }
        this.writeIdeaService.getCommentList(this.commentPage.page, this.commentPage.size, 'time,desc' , null, filter ).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.commentSource = res.body.content;
                this.commentPage.count = res.body.totalElements;
            }
            this.loading.hide();
        }, error => {

        }, () => {
            this.loading.hide();
        });
    }



    // 如果数字超多一万，就省略成以万为单位的数字
    changNumUnit(num) {
        if (num !== null && num !== 'null' && num !== 'undefined' && num !== undefined) {
            if (num.length >= 5) {
                const reg = Number(num) / 10000;
                const value = reg.toFixed(1);
                return value;
            } else {
                return num;
            }
        }

    }

    // 是否显示单位
    showUnit(num) {
        if (num !== null && num !== 'null' && num !== 'undefined' && num !== undefined) {
            if (num.length >= 5) {
                return true;
            } else {
                return false;
            }
        }

    }

    // 查看详情
    toWriteDetail(e) {
        this.loading.show();
        this.router.navigate(['/apps/WriteIdeaList/detail/' + e.id]).then(res => {
            this.loading.hide();
        });
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
    initStr: string;
    source: any; // 选择框
}