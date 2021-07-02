import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {CouponManageService} from '../coupon-manage.service';

@Component({
  selector: 'app-coupon-batch',
  templateUrl: './coupon-batch.component.html',
  styleUrls: ['./coupon-batch.component.scss']
})
export class CouponBatchComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'id,desc'};
  batchTypeList = [];

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private newDateTransformPipe: NewDateTransformPipe,
      public couponManageService: CouponManageService
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    // 通过接口获取表头数据
    this.getAllData().then(res => {
    } ).catch((res) => {
      this.initSearch(null);
    }).finally( () => {
      this.initSearch(null);
    });
  }

  getSelectData(){
    return new Observable<any>(subscriber => {
      forkJoin([this.couponManageService.toGetBatchTypeList()]).subscribe(res => {
        subscriber.next(res);
      });
    });
  }

  getAllData(){
    return new Promise((resolve , rj ) => {
      this.getSelectData().subscribe(res => {
        res[0].forEach(item => {
          this.batchTypeList.push(item);
        });
        resolve(true);
      } , error1 => {
        rj(true);
      });
    });
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'number', translate: '券批次号', value: ''},
      {name: 'batchType', translate: '券类型', value: ''},
      {name: 'couponName', translate: '券规则名称', value: ''},
      {name: 'total', translate: '批次数量', value: ''},
      {name: 'remained', translate: '剩余数量', value: ''},
      {name: 'validity', translate: '有效期', value: ''},
      {name: 'enabled', translate: '状态', value: '' },
      {name: 'createdBy', translate: '创建人', value: ''},
      {name: 'createdDate', translate: '创建时间', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''},
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.couponManageService.toGetCouponBatchList(this.page.page, this.page.size, this.page.sort , search).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else{
          this.rows.forEach(item => {
            item['couponName'] = item['coupon']['name'];
            item['validity'] = this.newDateTransformPipe.transform(item['beginTime']) + ' - ' + this.newDateTransformPipe.transform(item['endTime']);
            this.batchTypeList.forEach(type => {
              if (type['id'] === item['batchType']){
                item['batchType'] = type['name'];
              }
            });
            if (item['enabled'] === true){
              item['enabled'] = '已上线';
            } else {
              item['enabled'] = '已下线';
            }
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
    this.router.navigate(['/apps/couponBatch/detail'], {queryParams: {
        id: event.id
      }}).then(res => {
      this.loading.hide();
    });
  }

  // 新增券批次
  createConfiguration() {
    this.loading.show();
    this.router.navigate(['/apps/couponBatch/create']).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
