import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {BrandManageService} from '../../haqi/brand-manage/brand-manage.service';
import {takeUntil} from 'rxjs/operators';
import {IntegralRuleListService} from './integral-rule-list.service';

@Component({
  selector: 'app-integral-rule-list',
  templateUrl: './integral-rule-list.component.html',
  styleUrls: ['./integral-rule-list.component.scss']
})
export class IntegralRuleListComponent implements OnInit, OnDestroy {

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
      private integralRuleListService: IntegralRuleListService,
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    this.initSearch();
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'mallId', translate: '商场ID', value: ''}, //  商场ID
      {name: 'mallName', translate: '商场名称', value: '', type: 'input'}, //  商场名称
      {name: 'blocName', translate: '集团名称', value: ''}, //  集团名称
      {name: 'lastModifiedBy', translate: 'brand.lastModifiedBy', value: ''},  //  修改人
      {name: 'lastModifiedDate', translate: 'brand.lastModifiedDate', value: ''},   //  修改时间
    ];
  }

  // 初始化列表数据
  initSearch() {
    this.loading.show();
    this.integralRuleListService.multiSearchBrandLists(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body']; // this.transFormRes(res['body']['content']) ;
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
    this.integralRuleListService.multiSearchBrandLists(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body']; // this.transFormRes(res['body']['content']) ;
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
    this.router.navigate(['/apps/BonusPointRulesComponent/detail/' + event.id]).then(res => {
      this.loading.hide();
    });
  }

  // 处理返回结果
  transFormRes(res) {
    for (let j = 0; j < res.length; j++) {
      res[j]['labelNames'] = '';
      if (res[j]['labels'] && res[j]['labels'].length !== 0) {
        for (let i = 0; i < res[j]['labels'].length; i++) {
          if (i < res[j]['labels'].length - 1) {
            res[j]['labelNames'] += res[j]['labels'][i]['name'] + ',';
          } else {
            res[j]['labelNames'] += res[j]['labels'][i]['name'];
          }
        }
      }
    }
    return res;
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // 跳转套新增页面
  createIntegralRule() {
    this.loading.show();
    this.router.navigate(['/apps/BonusPointRulesComponent/create']).then(res => {
      this.loading.hide();
    });
  }

}
