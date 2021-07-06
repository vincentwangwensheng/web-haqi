import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {StoreManageService} from '../haqi/mall-management/store-mange/store.manage.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {PassengersManageService} from '../../../services/passengersManageService/passengers-manage.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {MessageHistoryService} from './message-history.service';

@Component({
  selector: 'app-message-history',
  templateUrl: './message-history.component.html',
  styleUrls: ['./message-history.component.scss']
})
export class MessageHistoryComponent implements OnInit, OnDestroy{



  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private merchantService: StoreManageService,
      private notify: NotifyAsynService,
      private passengersManageService: PassengersManageService,
      private newDateTransformPipe: NewDateTransformPipe,
      private messageHistoryService: MessageHistoryService,
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    this.initSearch();
  }

  // 获取表头和显示key
  getColumns() {
      this.columns = [
          {name: 'messagePhone', translate: '手机号', type: 'input', value: ''},
          {
              name: 'messageSupport', translate: '短信供应商', value: '', type: 'select', options: [
                  {translate: '国都互联', value: '国都互联'},
                  {translate: '科传', value: '科传'}
              ]
          },
          {
              name: 'messageTemplateType', translate: '模板类型', value: '', type: 'select', options: [
                  {translate: '营销短信', value: '营销短信'},
                  {translate: '系统通知', value: '系统通知'},
                  {translate: '异常报警', value: '异常报警'},
              ]
          },
          {name: 'messageContent', translate: '短信内容', value: ''},
          {name: 'messageSendStatus', translate: '状态', value: ''},
          {name: 'lastModifiedDate', translate: '发送时间', value: ''},
      ];
  }

  // 初始化列表数据
  initSearch() {

    this.loading.show();
    this.messageHistoryService.searchMessageHistoryList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.transToIndate(res['body']);
        this.rows = res['body'];
        this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
        }
      }
      this.loading.hide();
      this.notify.onResponse.emit();
    }, error => {

    }, () => {
      this.loading.hide();
    });
  }


  // 分页
  onPage(event) {
    this.page.page = event.page;
    this.onSearch();
  }

  // 搜索 包含查询、排序、分页 以及混合的情况
  onSearch() {
    this.loading.show();
    const multiSearch = [];
    this.columns.forEach(column => {
      if (column.value !== '') {
        multiSearch.push({name: column.name, value: column.value, type: column.type});
      }
    });
    this.messageHistoryService.searchMessageHistoryList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body'];
        this.transToIndate(res['body']);
        this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
        }
      }
      this.loading.hide();
      this.notify.onResponse.emit();
    }, error => {

    }, () => {
      this.loading.hide();
    });
  }

  // 搜索清除
  clearSearch() {
    this.onSearch();
  }

  // 排序
  onSort(event) {
    this.page.sort = event;
    this.onSearch();
  }

  // 详情跳转
  getDetail(event) {
    this.loading.show();
    this.router.navigate(['/apps/marketingManageComponent/essay/add/' + event.id]).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  // 跳转套新增页面
  createActivity(){
    this.loading.show();
    this.router.navigate(['/apps/marketingManageComponent/essay/add']).then(res => {
      this.loading.hide();
    });
  }
  // 将开始时间与结束时间变为有效期
  transToIndate(param){
    for (let i = 0; i < param.length; i++) {
      if ( param[i]['beginTime'] && param[i]['endTime']){
        param[i]['validity'] = this.newDateTransformPipe.transform(param[i]['beginTime']) + '-' + this.newDateTransformPipe.transform(param[i]['endTime']);
      } else {
        param[i]['validity'] = '';
      }
    }
  }
}
