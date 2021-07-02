import {Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {TranslateService} from '@ngx-translate/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Utils} from '../../../../services/utils';
import {WriteIdeaServiceService} from '../../write-idea-list/writeIdeaService/write-idea-service.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {AppointmentService} from '../appointment-service/appointment.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {CommentParameter} from '../../write-idea-list/writeIdeaService/CommentParameter';

@Component({
  selector: 'app-payment-record',
  templateUrl: './payment-record.component.html',
  styleUrls: ['./payment-record.component.scss']
})
export class PaymentRecordComponent implements OnInit , OnDestroy{
    @ViewChild('paymentRecordTe', {static: true}) paymentRecordTe: TemplateRef<any>;
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
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
      private writeIdeaService: WriteIdeaServiceService,
      private appointmentService: AppointmentService
  ) { }

  ngOnInit() {
      this.getColumns();
      this.initSearch();
  }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'comment', translate: 'PuSentiment.list.comment', type: '', value: ''},
            {name: 'score', translate: 'PuSentiment.list.score', type: '', value: ''},
            {
                name: 'type', translate: 'PuSentiment.list.type', type: 'select', value: '',
                options: [
                    {translate: 'PuSentiment.list.store', value: CommentParameter.store},
                    {translate: 'PuSentiment.list.article', value: CommentParameter.article}
                ]
            },
            {name: 'mobile', translate: 'PuSentiment.list.mobile', type: 'input', value: ''},
            {name: 'overhead', translate: 'PuSentiment.list.overhead', type: '', value: ''},
            {name: 'time', translate: 'PuSentiment.list.time', type: 'date', value: ''},
            {name: 'exception', translate: 'PuSentiment.list.enabled', type: 'select', value: '' ,
                options: [
                    {translate: 'PuSentiment.list.unusual', value: false},
                    {translate: 'PuSentiment.list.usual', value: true}
                ]},
            {name: 'lastModifiedBy', translate: 'PuSentiment.list.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'PuSentiment.list.lastModifiedDate', type: '', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.writeIdeaService.getCommentList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const content = res.body.content;
                for (let i = 0; i < content.length; i++) {
                    if (content[i].type === CommentParameter.store) {
                        content[i].type = this.translate.instant('PuSentiment.list.store'); // 商户
                    } else if (content[i].type === CommentParameter.article) {
                        content[i].type = this.translate.instant('PuSentiment.list.article'); // 文章
                    }
                    if (content[i].exception === true || content[i].exception === 'true') {
                        content[i].exception = this.translate.instant('PuSentiment.list.usual'); // 正常
                    } else {
                        content[i].exception = this.translate.instant('PuSentiment.list.unusual'); // 异常
                    }
                }

                this.rows = content;
                this.page.count = res.body.totalElements;
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
            this.loading.hide();

        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });
    }

    // 搜索
    onSearch() {
        this.loading.show();
        const multiSearch = this.utils.transformColumns(this.columns);
        this.writeIdeaService.getCommentList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                const content = res.body.content;
                for (let i = 0; i < content.length; i++) {
                    if (content[i].type === CommentParameter.store) {
                        content[i].type = this.translate.instant('PuSentiment.list.store'); // 商户
                    } else if (content[i].type === CommentParameter.article) {
                        content[i].type = this.translate.instant('PuSentiment.list.article'); // 文章
                    }
                    if (content[i].exception === true || content[i].exception === 'true') {
                        content[i].exception = this.translate.instant('PuSentiment.list.usual'); // 正常
                    } else {
                        content[i].exception = this.translate.instant('PuSentiment.list.unusual'); // 异常
                    }
                }
                this.rows = content;
                this.page.count = res.body.totalElements;
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();

        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
        });
    }

    // 搜索清除
    clearSearch() {
        this.onSearch();
    }

    // 分页
    onPage(event) {
        this.page.page = event.page;
        this.onSearch();

    }

    // 排序
    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    // 详情跳转
    getDetail(event) {
        if (event) {
            // this.MemberID = event.id;
        }
        if (!this.dialog.getDialogById('paymentRecordTeClass')) {
            this.dialog.open(this.paymentRecordTe, {id: 'paymentRecordTeClass', width: '520px', height: '300px'}).afterClosed().subscribe(res => {
                this.onSearch();
            });
        }
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
