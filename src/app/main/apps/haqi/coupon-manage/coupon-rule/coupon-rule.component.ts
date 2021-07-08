import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {CouponManageService} from '../coupon-manage.service';

@Component({
  selector: 'app-coupon-rule',
  templateUrl: './coupon-rule.component.html',
  styleUrls: ['./coupon-rule.component.scss']
})
export class CouponRuleComponent implements OnInit, OnDestroy {
  @Input()
  overPanel = false;
  @Input()
  singleSelect = false;
  @Input()
  selectedRow = null;
  @Input()
  checkbox = false;
  @Input()
  selectedRows = [];
  @Output()
  dataSelect: EventEmitter<any> = new EventEmitter();
  @Input()
  createBut = true;
  @Input()
  isPackage = true;
  @Input()
  isParking = false;

  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  // filter = [{name: 'type', value: 'DEFAULT'}];
  filter = [];
  couponTypeListInit = [];
  couponTypeList = [];

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
    }).finally( () => {
      setTimeout(() => {
        this.initSearch(null);
      }, 100);
    });
  }

  getSelectData(){
    return new Observable(subscriber => {
      forkJoin(this.couponManageService.toGetCouponType()).subscribe(res => {
        subscriber.next(res);
      });
    });
  }

  getAllData(){
    return new Promise((resolve , rj ) => {
      this.getSelectData().subscribe(res => {
        if (res){
          res[0].forEach(item => {
            this.couponTypeListInit.push(item);
            this.couponTypeList.push({translate: item.desc, value: item.id});
          });
        }
        resolve(true);
      } , error1 => {
        rj(true);
      });
    });
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: '券规则ID', value: ''},
      {name: 'name', translate: '券规则名称', value: ''},
      {name: 'type', translate: '券类型', value: ''},
      {name: 'validity', translate: '有效期', value: '', sort: false},
      {name: 'createdBy', translate: '创建人', value: ''},
      {name: 'createdDate', translate: '创建时间', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''},
      {name: 'enabled', translate: '状态', type: 'select', value: '' , options: [
          {translate: '已上线', value: true},
          {translate: '已下线', value: false},
       ]}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    let flag = '';
    // 优惠券推送只能选择isPackege=false类型的券规则，查询得条件特别定义
    if (!this.isPackage){
      const query = [];
      this.couponTypeListInit.map(item => {
        if (item['isPackege'] === false){
          query.push(item['id']);
        }
      });
      if (query.length !== 1){
        flag = '(' + query.join(' OR ') + ')';
      } else {
        flag = query[0];
      }
    }
    if (this.isParking) {
      flag = '';
      this.filter = [{name: 'type', value: 'PARKING'}];
    }
    this.couponManageService.toGetCouponRuleList(this.page.page, this.page.size, this.page.sort , search, this.filter, flag).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        this.rows = res;
        // this.page.count = res.headers.get('x-total-count');
        this.page.count = 1;
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else {
          this.rows.forEach(item => {
            if (item['type']){
              this.couponTypeList.forEach(coupon => {
                if (coupon['value'] === item['type']){
                  item['type'] = coupon['translate'];
                }
              });
            }
            if (item['enabled'] === true){
              item['enabled'] = '已上线';
            } else {
              item['enabled'] = '已下线';
            }
            item['validity'] = this.newDateTransformPipe.transform(item['beginTime']) + ' - ' + this.newDateTransformPipe.transform(item['endTime']);
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

  onSelect(event) {
    this.dataSelect.emit(event);
  }

  // 详情跳转
  getDetail(event) {
    this.loading.show();
    this.router.navigate(['/apps/couponRule/edit'], {queryParams: {
        id: event.id
      }}).then(res => {
      this.loading.hide();
    });
  }

  // 新增券规则
  createConfiguration() {
    this.loading.show();
    this.router.navigate(['/apps/couponRule/create']).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
