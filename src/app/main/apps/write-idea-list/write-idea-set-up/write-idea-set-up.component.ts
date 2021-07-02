import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {Coupon} from '../../marketing-manage/marketing-manage-add/marketing-manage-add.component';
import {takeUntil} from 'rxjs/operators';
import {WriteIdeaServiceService} from '../writeIdeaService/write-idea-service.service';
import {HttpClient} from '@angular/common/http';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MatDialogRef} from '@angular/material/dialog/typings/dialog-ref';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Utils} from '../../../../services/utils';

@Component({
    selector: 'app-write-idea-set-up',
    templateUrl: './write-idea-set-up.component.html',
    styleUrls: ['./write-idea-set-up.component.scss'],
    animations: fuseAnimations
})
export class WriteIdeaSetUpComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    wordDialogRef: MatDialogRef<any>;
    NumberLim: any;
    limitCheckbox: LimitCheckbox;
    FormOption: any;
    formWord: any; // 敏感词表单
    selectStore: Coupon = null; // 选择对应的店铺
    selectWords = [];
    wordsColumns = [{name: 'word'}, {name: 'lastModifiedBy'}, {name: 'lastModifiedDate'}];
    page = {page: 0, size: 8, count: 0}; // 分页
    words: any[] = []; // 敏感词汇
    mCouponColumnWidth;
    wordCOrD: any; // 敏感词添加还是保存

    btuDis = false;

    static formatToZoneDateTime(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString();
    }

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private routeInfo: ActivatedRoute,
        private router: Router,
        private utils: Utils,
        public  dialog: MatDialog,
        private dateTransform: NewDateTransformPipe,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private document: ElementRef,
        private writeIdeaService: WriteIdeaServiceService
    ) {
        this.FormOption = new FormBuilder().group({
            id: new FormControl({value: null, disabled: false}, [Validators.required]), // id
            memberLimit: new FormControl({value: null, disabled: false}, [Validators.required]), // 会员限制
            classLimit: new FormControl({value: null, disabled: false}, [Validators.required]),  // 等级限制
            picture: new FormControl({value: null, disabled: false}, [Validators.required]),       // 图片评论
            commentGive: new FormControl({value: null, disabled: false}, [Validators.required]),   // 评论点赞
            exceptionGive: new FormControl({value: null, disabled: false}, [Validators.required]),    // 异常点赞次数
            exceptionComment: new FormControl({value: null, disabled: false}, [Validators.required]), // 评分低于为异常
            violation: new FormControl({value: null, disabled: false}, [Validators.required]),        // 暂定违规
            enabled: new FormControl({value: null, disabled: false}, [Validators.required]),    // 是否有效
            createdBy: new FormControl({value: null, disabled: false}, [Validators.required]),
            createdDate: new FormControl({value: null, disabled: false}, [Validators.required]),
            lastModifiedBy: new FormControl({value: null, disabled: true}, [Validators.required]),
            lastModifiedDate: new FormControl({value: null, disabled: true}, [Validators.required]),
        });
        this.formWord = new FormBuilder().group({
            id: new FormControl({value: null, disabled: false}, [Validators.required]), // id
            word: new FormControl({value: null, disabled: false}, [Validators.required]), // id
            enabled: new FormControl({value: null, disabled: false}, [Validators.required]), // 是否有效
            createdBy: new FormControl({value: null, disabled: false}, [Validators.required]),
            createdDate: new FormControl({value: null, disabled: false}, [Validators.required]),
            lastModifiedBy: new FormControl({value: null, disabled: true}, [Validators.required]),
            lastModifiedDate: new FormControl({value: null, disabled: true}, [Validators.required]),
        });
    }

    ngOnInit() {
        this.initPram();
        this.initNumberCardData();
        this.initSetting();
        this.getColumnWidth();
        this.onWord();
    }

    // 初始化一些参数
    initPram() {
        this.limitCheckbox = new LimitCheckbox();
        this.NumberLim = [];
        this.limitCheckbox.NumLimitYes = true;
        this.limitCheckbox.NumLimitNo = false;
        this.limitCheckbox.pictureYes = true;
        this.limitCheckbox.pictureNo = false;
        this.limitCheckbox.commentGiveYes = true;
        this.limitCheckbox.commentGiveNo = false;
    }

    // 拿到设置的值
    initSetting() {
        this.writeIdeaService.getSetting().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.setCheckStruts(res);
                res.lastModifiedDate = this.dateTransform.transform(res.lastModifiedDate);
                this.FormOption.patchValue(res);
            }
        );
    }

    // 拿到数据时设置Checkbox的选中状态
    setCheckStruts(res) {
        // 会员限制
        if (res.memberLimit) {
            this.limitCheckbox.NumLimitYes = true;
            this.limitCheckbox.NumLimitNo = false;
        } else {
            this.limitCheckbox.NumLimitYes = false;
            this.limitCheckbox.NumLimitNo = true;
        }
        // 图片评论
        if (res.picture) {
            this.limitCheckbox.pictureYes = true;
            this.limitCheckbox.pictureNo = false;
        } else {
            this.limitCheckbox.pictureYes = false;
            this.limitCheckbox.pictureNo = true;
        }
        //  评论点赞
        if (res.commentGive) {
            this.limitCheckbox.commentGiveYes = true;
            this.limitCheckbox.commentGiveNo = false;
        } else {
            this.limitCheckbox.commentGiveYes = false;
            this.limitCheckbox.commentGiveNo = true;
        }
    }

    // 拿到会员卡信息
    initNumberCardData() {
        this.writeIdeaService.searchMemberCardList().pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                res.body.forEach(r => {
                    this.NumberLim.push({id: (r.id + ''), levelName: r.levelName});
                });
            }
        );
    }

    // 保存
    toSaveSet() {
        this.btuDis = true;
        this.setCheckStrutsSave();
        const set = this.FormOption.getRawValue();
        set.lastModifiedDate = this.formatToZoneDateTime(set.lastModifiedDate);
        this.writeIdeaService.updateSetting(set).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.snackBar.open(this.translate.instant('PuSentiment.setUp.tips1'), '✖'); // 更新成功！
                this.initSetting();
                this.btuDis = false;
            }, error1 => {
                this.btuDis = false;
            }
            , () => {
                this.btuDis = false;
            }
        );
    }


    /* creatCom(){
           const  com = new CommentEntity();
           com.id = null ;
           com.commentId = '';
           com.comment = 'R4测试商户异常1';
           com.score = 1.5 ;
           com.type = CommentParameter.store;
           com.mobile = '18800105315';
           com.overhead = false ;
           com.time = new Date().toISOString();
           com.reply = '111111';
           com.exception = false ;
           com.giveCounts = 1134;
           com.storeId = 'string00042';
           com.articleId = '';
           com.enabled = true;
           com.createdBy = null;
           com.createdDate = null;
           com.lastModifiedBy = null;
           com.lastModifiedDate = null;
           this.writeIdeaService.createComment(com).pipe().subscribe(res => {
               this.snackBar.open('保存成功！', '✖');
           });
       }*/


    // 保存时设置Checkbox的选中状态
    setCheckStrutsSave() {
        // 会员限制
        this.limitCheckbox.NumLimitYes === true ? this.FormOption.controls.memberLimit.patchValue(true) : this.FormOption.controls.memberLimit.patchValue(false);
        // 图片评论
        this.limitCheckbox.pictureYes === true ? this.FormOption.controls.picture.patchValue(true) : this.FormOption.controls.picture.patchValue(false);
        //  评论点赞
        this.limitCheckbox.commentGiveYes === true ? this.FormOption.controls.commentGive.patchValue(true) : this.FormOption.controls.commentGive.patchValue(false);
    }


    LimitCheckChange(e, p) {
        if (p === 'no') {
            this.limitCheckbox.NumLimitNo = e.checked;
            if (e.checked) {
                this.limitCheckbox.NumLimitYes = false;
            } else {
                this.limitCheckbox.NumLimitYes = true;
            }
        } else {
            this.limitCheckbox.NumLimitYes = e.checked;
            if (e.checked) {
                this.limitCheckbox.NumLimitNo = false;
            } else {
                this.limitCheckbox.NumLimitNo = true;
            }
        }
    }

    ImgWriteCheckChange(e, p) {
        if (p === 'no') {
            this.limitCheckbox.pictureNo = e.checked;
            if (e.checked) {
                this.limitCheckbox.pictureYes = false;
            } else {
                this.limitCheckbox.pictureYes = true;
            }
        } else {
            this.limitCheckbox.pictureYes = e.checked;
            if (e.checked) {
                this.limitCheckbox.pictureNo = false;
            } else {
                this.limitCheckbox.pictureNo = true;
            }
        }
    }

    ImgThumbsCheckChange(e, p) {
        if (p === 'no') {
            this.limitCheckbox.commentGiveNo = e.checked;
            if (e.checked) {
                this.limitCheckbox.commentGiveYes = false;
            } else {
                this.limitCheckbox.commentGiveYes = true;
            }
        } else {
            this.limitCheckbox.commentGiveYes = e.checked;
            if (e.checked) {
                this.limitCheckbox.commentGiveNo = false;
            } else {
                this.limitCheckbox.commentGiveNo = true;
            }
        }
    }


    // 检测分值的变化
    scoreChangeSet() {
        if (this.FormOption.controls.exceptionComment.value > 5) {
            this.FormOption.controls.exceptionComment.patchValue(5);
        }
    }

    //  敏感词部分------------------------------

    // 打开弹窗
    openAddDialog(e, wordDialog) {
        if (e === 'add') {
            this.wordCOrD = this.translate.instant('PuSentiment.setUp.add'); // '添加';
            this.formWord.reset('');
        } else {
            this.wordCOrD = this.translate.instant('PuSentiment.setUp.edit'); // '编辑';
            this.formWord.patchValue(e);
        }
        if (!this.dialog.getDialogById('wordDialogClass')) {
            this.wordDialogRef = this.dialog.open(wordDialog, {id: 'wordDialogClass', width: '520px', height: '163px' , hasBackdrop: true});


            this.wordDialogRef.afterClosed().subscribe(
                res => {
                    if (res === 'yes') {
                        if (this.wordCOrD === this.translate.instant('PuSentiment.setUp.add')) { // 添加
                            this.createWord();
                        } else {
                            this.updateWord();
                        }
                    }

                }
            );
        }
    }


    // 获取列宽
    getColumnWidth() {
        const columnWidth = 574;
        const integralColumnWidth = screen.width * 0.75 * 0.5;
        this.mCouponColumnWidth = columnWidth / (this.wordsColumns.length + 2);
    }

    // 翻页
    onPage(event) {
        this.loading.show();
        this.page.page = event.offset;
        this.words = [];
        setTimeout(() => {
            this.writeIdeaService.getWordList(event.offset, event.pageSize, 'lastModifiedDate,desc').pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
                if (res.status === 200) {
                    this.page.count = res.body.totalElements;
                    const allCon = res.body.content;
                    allCon.forEach(r => {
                        this.words.push({
                            id: r.id,
                            enabled: r.enabled,
                            word: r.word,
                            lastModifiedBy: r.lastModifiedBy,
                            lastModifiedDate: r.lastModifiedDate
                        });
                    });
                    this.loading.hide();
                }
            });
        }, 20);

    }


    // 全维护列表
    onWord() {
        this.selectStore = null;
        this.page.page = 0;
        this.page.size = 8;
        this.loading.show();
        this.words = [];
        this.writeIdeaService.getWordList(this.page.page, this.page.size, 'lastModifiedDate,desc', this.selectWords).pipe(takeUntil(this._unsubscribeAll))
            .subscribe((res) => {
                    if (res.status === 200) {
                        this.page.count = res.body.totalElements;
                        const allCon = res.body.content;
                        allCon.forEach(r => {
                            this.words.push({
                                id: r.id,
                                enabled: r.enabled,
                                word: r.word,
                                lastModifiedBy: r.lastModifiedBy,
                                lastModifiedDate: r.lastModifiedDate
                            });
                        });
                    }
                    this.loading.hide();
                }
                , error1 => {
                    this.loading.hide();
                });

    }

    // 查询
    wordChangeSet(e) {
        this.loading.show();
        let value = '';
        if (e === 'iconSearch') {
            const wordInput = this.document.nativeElement.querySelector('#wordInput');
            value = wordInput.value;
        } else {
            value = e.target.value;
        }
        if (value === '') {
            this.selectWords = [];
        } else {
            this.selectWords[0] = {name: 'word', value: value, type: 'input'};
        }
        this.onWord();
    }

    // 查询清空
    wordChangeSetClear(e) {
        const value = e.target.value;
        if (value === '') {
            this.selectWords = [];
            this.onWord();
        }
    }


    // 敏感词新建
    createWord() {
        const word = this.formWord.getRawValue();
        word.enabled = true;
        word.createdBy = sessionStorage.getItem('username');
        word.lastModifiedBy = sessionStorage.getItem('username');
        word.createdDate = this.formatToZoneDateTime(word.createdDate);
        word.lastModifiedDate = this.formatToZoneDateTime(word.lastModifiedDate);
        this.loading.show();
        this.writeIdeaService.createWord(word).pipe().subscribe(res => {
            this.snackBar.open(this.translate.instant('PuSentiment.setUp.tips2'), '✖'); //   新增敏感词成功！
            const wordInput = this.document.nativeElement.querySelector('#wordInput');
            wordInput.value = '';
            this.wordChangeSet('iconSearch');
        });  //   新增敏感词失败！
    }

    // 敏感词编辑
    updateWord() {
        const word = this.formWord.getRawValue();
        word.createdDate = this.formatToZoneDateTime(word.createdDate);
        word.lastModifiedDate = this.formatToZoneDateTime(word.lastModifiedDate);
        this.loading.show();
        this.writeIdeaService.updateWord(word).pipe().subscribe(res => {
            this.snackBar.open(this.translate.instant('PuSentiment.setUp.tips3'), '✖');  //   编辑敏感词成功！
            const wordInput = this.document.nativeElement.querySelector('#wordInput');
            wordInput.value = '';
            this.wordChangeSet('iconSearch');
        });  //   编辑敏感词失败！
    }

    // 敏感词汇保存 弹框关闭
    wordSave() {
        if (this.wordDialogRef) {
            this.wordDialogRef.close('yes');
        }
    }

    // 敏感词汇取消 弹框关闭
    wordCancel() {
        if (this.wordDialogRef) {
            this.wordDialogRef.close('cancel');
        }
    }

    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

export class LimitCheckbox {
    NumLimitYes: boolean; // 会员限制 是 选中状态
    NumLimitNo: boolean;  // 会员限制  否 选中状态

    pictureYes: boolean;  // 图片评论 是 选中状态
    pictureNo: boolean;  // 图片评论 否 选中状态

    commentGiveYes: boolean;  // 图片评论点赞 是 选中状态
    commentGiveNo: boolean;  // 图片评论点赞 否 选中状态
}