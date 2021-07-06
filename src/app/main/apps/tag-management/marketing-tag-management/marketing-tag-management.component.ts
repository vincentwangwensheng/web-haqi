import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {StoreManageService} from '../../mall-management/store-mange/store.manage.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {MarketingTagService} from '../../../../services/marketingTagService/marketing-tag.service';

@Component({
  selector: 'app-marketing-tag-management',
  templateUrl: './marketing-tag-management.component.html',
  styleUrls: ['./marketing-tag-management.component.scss']
})
export class MarketingTagManagementComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject();
  @Input()
  selectedRows = [];
  @Input()
  overPanel = false;
  @Output()
  dataSelect: EventEmitter<any> = new EventEmitter();
  @Input()
  createFlag = true; // 是否有新建按钮
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
      private marketingTagService: MarketingTagService,
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    this.initSearch();
  }

  onSelect(event) {
    this.dataSelect.emit(event);
  }


  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'TagManagement.PassengersTagManagement.id', value: ''},
      {name: 'name', translate: 'TagManagement.PassengersTagManagement.name', type: 'input', value: ''},
      {name: 'category', translate: 'TagManagement.PassengersTagManagement.category', value: ''},
      {
        name: 'subCategory', translate: 'TagManagement.PassengersTagManagement.subCategory',  value: ''
      },
      {name: 'description', translate: 'TagManagement.PassengersTagManagement.description', value: ''},
      {name: 'enabled', translate: 'TagManagement.PassengersTagManagement.enabled', type: 'select', options: [
          {translate: '正常', value: true},
          {translate: '冻结', value: false},
        ], value: ''},
      {name: 'lastModifiedBy', translate: 'TagManagement.PassengersTagManagement.lastModifiedBy', value: ''},
      {
        name: 'lastModifiedDate', translate: 'TagManagement.PassengersTagManagement.lastModifiedDate', value: ''
      },
    ];
  }

  // 初始化列表数据
  initSearch() {
    this.loading.show();
    this.marketingTagService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body'];
        this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
        if (this.rows.length === 0) {
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
    this.marketingTagService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body'];
        this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
        if (this.rows.length === 0) {
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
  navigateDetail(event) {
    this.loading.show();
    this.router.navigate(['/apps/MarketingTagManagement/MarketingTagDetail/' + event.id] ).then(() => {
      this.loading.hide();
    });
  }

  // 新增页面方法
  createActivity(){
    this.router.navigate(['/apps/MarketingTagManagement/MarketingTagAdd']).then(() => {

    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
