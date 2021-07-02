import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {CouponManageService} from '../coupon-manage.service';
import {Utils} from '../../../../services/utils';

@Component({
  selector: 'app-activity-review',
  templateUrl: './activity-review.component.html',
  styleUrls: ['./activity-review.component.scss']
})
export class ActivityReviewComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  configurationTypeList = [];
  configurationTypeListSelected = [];
  filter = [{name: 'reviewStatus', value: false}];

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private utils: Utils,
      private newDateTransformPipe: NewDateTransformPipe,
      private couponManageService: CouponManageService
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    // 通过接口获取表头数据
    this.getAllData().then(res => {
    } ).catch((res) => {
    }).finally( () => {
      this.initSearch(null);
    });
  }

  getSelectData(){
    return new Observable(subscriber => {
      forkJoin(this.couponManageService.toGetActivityTypeList()).subscribe(res => {
        subscriber.next(res);
      });
    });
  }

  getAllData(){
    return new Promise((resolve , rj ) => {
      this.getSelectData().subscribe(res => {
        if (res){
          res[0].forEach(item => {
            this.configurationTypeList.push(item);
            this.configurationTypeListSelected.push({translate: item['name'], value: item['id']});
          });
        }
        console.log('configurationTypeList:', this.configurationTypeList);
        resolve(true);
      } , error1 => {
        rj(true);
      });
    });
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'name', translate: '活动名称', value: '', type: 'input'},
      {name: 'type', translate: '活动类型', value: '', type: 'select', options: this.configurationTypeListSelected},
      {name: 'ruleText', translate: '活动说明', value: '', transformType: 'htmlToText'},
      {name: 'validity', translate: '有效期', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''},
      {name: 'reviewResult', translate: '审核状态', value: ''},
      {name: 'enabled', translate: '状态', value: ''},
      {name: 'reviewUserId', translate: '审核人', value: ''},
      {name: 'reviewTime', translate: '审核时间', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.couponManageService.toGetActivityList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else {
          this.rows.forEach(item => {
            this.configurationTypeList.forEach(type => {
              if (type['id'] === item['type']){
                item['type'] = type['name'];
              }
            });
            if (item['enabled'] === true){
              item['enabled'] = '已上线';
            } else {
              item['enabled'] = '已下线';
            }
            item['validity'] = this.newDateTransformPipe.transform(item['beginTime']) + ' - ' + this.newDateTransformPipe.transform(item['endTime']);
            item['reviewResult'] = '待审核';
          });
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
    const multiSearch = [];
    this.columns.forEach(column => {
      if (column.value !== '') {
        multiSearch.push({name: column.name, value: column.value, type: column.type});
      }
    });
    this.initSearch(multiSearch);
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
    this.router.navigate(['/apps/activityReview/edit'], {queryParams: {
        id: event.id
      }}).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
