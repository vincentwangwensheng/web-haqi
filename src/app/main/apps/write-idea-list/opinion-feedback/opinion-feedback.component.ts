import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Utils} from '../../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {WriteIdeaServiceService} from '../writeIdeaService/write-idea-service.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {CommentParameter} from '../writeIdeaService/CommentParameter';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-opinion-feedback',
  templateUrl: './opinion-feedback.component.html',
  styleUrls: ['./opinion-feedback.component.scss']
})
export class OpinionFeedbackComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  detail: any;
  reply = '';

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private utils: Utils,
      private http: HttpClient,
      public dialog: MatDialog,
      private loading: FuseProgressBarService,
      private dateTransform: NewDateTransformPipe,
      private writeIdeaService: WriteIdeaServiceService,
      private notify: NotifyAsynService
  ) {
  }

  ngOnInit() {
    this.getColumns();
    this.initSearch(null);
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'popupId', translate: '手机号', value: '', type: 'input'},
      {name: 'nickName', translate: '昵称', value: ''},
      {name: 'feedback', translate: '意见反馈', type: '', value: ''},
      {name: 'reply', translate: '回复', type: '', value: ''},
      {name: 'lastModifiedBy', translate: '操作人', type: '', value: ''},
      {name: 'lastModifiedDate', translate: '操作时间', type: '', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.writeIdeaService.searchOpinionList(this.page.page, this.page.size, this.page.sort, search).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res.body) {
        this.rows = res.body;
        this.page.count = res.headers.get('X-Total-Count');
        this.notify.onResponse.emit();
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
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
    this.initSearch(multiSearch);
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

  // 获取退款详详情信息并打开弹出框
  getDetail(event, MatDialogFrozen) {
    this.detail = {};
    this.loading.show();
    this.writeIdeaService.getOpinionDetailById(event['id']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
      if (res_json){
        this.detail = res_json;
        this.dialog.open(MatDialogFrozen, {id: 'frozenTips', width: '410px', height: '368px', position: {top: '200px'}});
      }
      this.loading.hide();
    }, error => {
      this.loading.hide();
    }, () => {
      this.loading.hide();
    });
  }

  save(){
    if (!this.detail['reply']) {
      this.snackBar.open('回复不能为空', '✖');
    } else {
      const data = {
        id: this.detail['id'],
        reply: this.detail['reply']
      };
      this.loading.show();
      this.writeIdeaService.updateOpinion(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
        console.log('res_json:', res_json);
        if (res_json && res_json.status === 200){
          this.initSearch(null);
          this.detail = {};
          this.snackBar.open('回复成功', '✖');
        }
        this.dialog.closeAll();
        this.loading.hide();
      }, error => {
        this.loading.hide();
      }, () => {
        this.loading.hide();
      });
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
