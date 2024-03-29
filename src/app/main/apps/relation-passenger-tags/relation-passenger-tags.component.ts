import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {StoreManageService} from '../haqi/mall-management/store-mange/store.manage.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MessageTemplateService} from '../message-template/message-template.service';
import {takeUntil} from 'rxjs/operators';
import {RelationPassengerTagsService} from './relation-passenger-tags.service';

@Component({
  selector: 'app-relation-passenger-tags',
  templateUrl: './relation-passenger-tags.component.html',
  styleUrls: ['./relation-passenger-tags.component.scss']
})
export class RelationPassengerTagsComponent implements OnInit, OnDestroy{



  @Input()
  selectedRows = [];
  @Input()
  checkbox = false;
  @Input()
  overPanel = false;
  @Input()
  createButton = true;
  @Input()
  singleSelect = false;
  @Input()
  selectedRow = null;
  @Output()
  dataSelect: EventEmitter<any> = new EventEmitter();


  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'id,desc'};

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private merchantService: StoreManageService,
      private notify: NotifyAsynService,
      private relationPassengerTagsService: RelationPassengerTagsService,
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    setTimeout(() => {
      this.initSearch();
    });
  }

  onSelect(event) {
    this.dataSelect.emit(event);
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'tagName', translate: '标签名称', type: 'input', value: ''},
      {name: 'firstLevel', translate: '一级分类', value: ''},
      {name: 'secondLevel', translate: '二级分类', value: ''},
      {name: 'tagRemarks', translate: '标签说明', value: ''},
    ];
  }

  // 初始化列表数据
  initSearch() {

    this.loading.show();
    this.relationPassengerTagsService.searchPassengerTagsList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.parseStatus(res['body']);
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
    this.relationPassengerTagsService.searchPassengerTagsList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body'];
        this.parseStatus(res['body']);
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
    this.router.navigate(['/apps/messageTemplate/edit/' + event.id]).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // 跳转套新增页面
  createActivity() {
    this.loading.show();
    this.router.navigate(['/apps/messageTemplate/add']).then(res => {
      this.loading.hide();
    });
  }

// 处理模板状态
  parseStatus(param) {
    for (let i = 0; i < param.length; i++) {
      if (param[i]['templateStatus'] === 'NORMAL') {
        param[i]['templateStatus'] = '正常';
      } else if (param[i]['templateStatus'] === 'FROZEN') {
        param[i]['templateStatus'] = '  冻结';
      }
    }
  }

}
