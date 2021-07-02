import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {Utils} from '../../../../services/utils';
import {MessageSubscribeService} from './message-subscribe.service';

@Component({
  selector: 'app-message-subscribe',
  templateUrl: './message-subscribe.component.html',
  styleUrls: ['./message-subscribe.component.scss']
})
export class MessageSubscribeComponent implements OnInit  , OnDestroy{
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private utils: Utils,
      private loading: FuseProgressBarService,
      private messageSubscribeService: MessageSubscribeService,
      private dateTransform: NewDateTransformPipe ,
      private notify: NotifyAsynService
  ) { }

  ngOnInit() {
    this.getColumns();
    this.initSearch(null);
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.messageSubscribeService.getMessageProviderTemplate(this.page.page, this.page.size, this.page.sort, search).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        for (let y = 0; y < res.body.length; y++) {
          res['body'][y]['validity'] = this.dateTransform.transform(res['body'][y]['popupStartTime']) + ' - ' + this.dateTransform.transform(res['body'][y]['popupEndTime'])  ;
        }
        this.rows = res.body;
        this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
        if (this.rows.length === 0) { // 如果是空数组返回了
          this.snackBar.open('未查询到数据', '✖');
        } else { // 查询大小
          this.messageSubscribeService.getMessageProviderTemplateCount().pipe(takeUntil(this._unsubscribeAll)).subscribe(count_ => {
            if (count_) {
              this.page.count = Number(count_);
            }
          }, error1 => {
            console.log(error1);
          } , () => {
            this.loading.hide();
            this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
          });
          this.rows.forEach(item => {
            if (item['templateStatus'] === 'NORMAL'){
              item['templateStatus'] = '正常';
            } else if (item['templateStatus'] === 'FROZEN'){
              item['templateStatus'] = '冻结';
            }
            if (item['templatePluginWay'] === 'SMSTT'){
              item['templatePluginWay'] = '短信科传';
            } else if (item['templatePluginWay'] === 'SUBMSGWX'){
              item['templatePluginWay'] = '微信订阅消息发送';
            }
          });
        }
      }
    }, error => {
      console.log(error);
      this.loading.hide();
    }, () => {
      this.loading.hide();
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

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'templateName', translate: '模板名称', type: '', value: ''},
      {name: 'templateContent', translate: '配置模板内容', type: 'input', value: ''},
      {name: 'externalCode', translate: '模板ID', type: '', value: ''},
      {name: 'templatePluginWay', translate: '供应商类型', type: '', value: ''},
      {name: 'templateStatus', translate: '状态', type: '', value: ''},
      {name: 'lastModifiedBy', translate: '操作人', type: '', value: ''},
      {name: 'lastModifiedDate', translate: '操作时间', type: '', value: ''},
    ];
  }

  // 详情跳转
  getDetail(event) {
    this.loading.show();
    this.router.navigate(['/apps/appletMaskMessageSubscribe/detail'], {queryParams: {
      id: event.id
      }}).then(res => {
      this.loading.hide();
    });
  }

  // 新增跳转
  Create(){
    this.loading.show();
    this.router.navigate(['/apps/appletMaskMessageSubscribe/create']).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


}
