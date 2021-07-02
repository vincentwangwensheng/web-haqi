import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {AdvertisingScreenService} from './advertising-screen.service';

@Component({
  selector: 'app-advertising-screen',
  templateUrl: './advertising-screen.component.html',
  styleUrls: ['./advertising-screen.component.scss']
})
export class AdvertisingScreenComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private advertisingScreenService: AdvertisingScreenService,
      private newDateTransformPipe: NewDateTransformPipe,
  ) { }

  ngOnInit() {
    this.getColumns();
    this.initSearch();
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'name', translate: '内容组名称', value: ''},
      {name: 'mallName', translate: '关联商场', value: '', type: 'input'},
      {name: 'valid', translate: '有效时间', value: ''}, //  英文名称
      {
        name: 'enabled', translate: '状态', type: 'select', value: '',
        options: [
          {translate: '正常', value: 'true'},
          {translate: '冻结', value: 'false'}
        ]
      },
      {name: 'lastModifiedBy', translate: 'brand.lastModifiedBy', value: ''},  //  修改人
      {name: 'lastModifiedDate', translate: 'brand.lastModifiedDate', value: ''},   //  修改时间
    ];
  }

  // 初始化列表数据
  initSearch() {
    this.loading.show();
    this.advertisingScreenService.multiSearchAdvertisingLists(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = this.transFormRes(res['body']);
        this.page.count = res['headers'].get('X-Total-Count');
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
        }
      }
      this.loading.hide();
      this.notify.onResponse.emit();
    }, error => {
      this.loading.hide();
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
    this.advertisingScreenService.multiSearchAdvertisingLists(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = this.transFormRes(res['body']);

        this.page.count = res['headers'].get('X-Total-Count');
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
    this.router.navigate(['/apps/advertisingScreen/detail/' + event.id]).then(res => {
      this.loading.hide();
    });
  }

  // 处理返回结果
  transFormRes(res) {
    for (let j = 0; j < res.length; j++) {
      res[j]['valid'] = this.newDateTransformPipe.transform(res[j]['startTime'])  + ' ' + this.newDateTransformPipe.transform(res[j]['endTime']);
      if ('NORMAL' === res[j]['loopStatus']) {
        res[j]['loopStatus'] = '正常';
      }else if ('FROZEN' === res[j]['loopStatus']) {
        res[j]['loopStatus'] = '冻结';
      }
    }
    return res;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // 跳转套新增页面
  createCarouselPhoto() {
    this.loading.show();
    this.router.navigate(['/apps/advertisingScreen/create']).then(res => {
      this.loading.hide();
    });
  }
}
