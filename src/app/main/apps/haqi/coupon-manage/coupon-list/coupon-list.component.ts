import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {CouponManageService} from '../../../haqi/coupon-manage/coupon-manage.service';
import {DatePipe} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.scss']
})
export class CouponListComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  filter = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  couponTypeList = [];

  customButtons = []; // 自定义按钮组
  loadingShowData = 'loading...';
  @ViewChild('loadTg', {static: true})
  loadTg: TemplateRef<any>;

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private datePipe: DatePipe,
      private dialog: MatDialog,
      private newDateTransformPipe: NewDateTransformPipe,
      private couponManageService: CouponManageService
  ) {
    this.customButtons = [
      {
        name: '导出', iconFont: '', class: 'shallow-button', fn: () => {
          this.exportList();
        }
      }
    ];
  }

  // 导出列表数据
  exportList(){
    const dialog = this.dialog.open(this.loadTg, {
      id: 'loadingDialog', width: '100%', height: '100%'
    });
    dialog.afterOpened().subscribe(re => {
      const multiSearch = [];
      this.columns.forEach(column => {
        if (column.value !== '') {
          multiSearch.push({name: column.name, value: column.value, type: column.type});
        }
      });
      this.couponManageService.toExportCouponList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', multiSearch).subscribe(reg => {
        if (reg.body.type === 'application/json') { // 如果返回的是错误json消息
          const reader = new FileReader();
          let result = '';
          reader.readAsText(reg.body, 'utf-8');
          reader.onloadend = (ev: ProgressEvent) => { // fileReader读取文件需要时间 默认代码不会等待
            result = ev.currentTarget['result'];
            if (result) {
              const resMessage = JSON.parse(result);
              this.snackBar.open('导出优惠券列表:' + resMessage['header'].errorMsg);
            }
          };
        } else {
          this.downloadFileLink(reg.body, '优惠券列表.csv');
        }
      }, error1 => {
        dialog.close();
      }, () => {
        dialog.close();
      });
    });
  }

  downloadFileLink(data, fileName?: string) {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_self');
    link.setAttribute('downLoad', fileName);
    link.click();
    window.URL.revokeObjectURL(url); // 手动释放url对象
  }

  ngOnInit(): void {
    this.getColumns();
    // 通过接口获取表头数据
    this.getAllData().then(res => {
    }).catch((res) => {
    }).finally( () => {
      this.initSearch(null);
    });
  }

  getSelectData(){
    return new Observable<any>(subscriber => {
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
            this.couponTypeList.push(item);
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
      {name: 'code', translate: '券编码', value: ''},
      {name: 'couponName', translate: '券名称', value: ''},
      {name: 'batchNumber', translate: '券批次号', value: ''},
      {name: 'validity', translate: '有效期', value: '', sort: false},
      {name: 'userId', translate: '手机号', value: '', type: 'input'},
      {name: 'type', translate: '券类型', value: ''},
      {name: 'pickupTime', translate: '领取时间', value: ''},
      {name: 'clearBy', translate: '是否核销', type: 'select', value: '' , options: [
          {translate: '已核销', value: true},
          {translate: '未核销', value: false},
        ]},
      {name: 'clearTime', translate: '核销时间', value: '', transformType: 'date'},
      {name: 'enabled', translate: '状态', type: 'select', value: '' , options: [
          {translate: '已上线', value: true},
          {translate: '已下线', value: false},
        ]},
      {name: 'mallName', translate: '商场名称', value: ''},
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.couponManageService.toGetCouponList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else {
          this.rows.forEach(item => {
            item['type'] = item['coupon']['type'];
            item['couponName'] = item['coupon']['name'];
            item['mallName'] = item['mallInfo']['mallName'];
            this.couponTypeList.forEach(type => {
              if (type['id'] === item['type']){
                item['type'] = type['name'];
              }
            });
            if (item['enabled'] === true){
              item['enabled'] = '已上线';
            } else {
              item['enabled'] = '已下线';
            }
            if (item['clearBy']){
              item['clearBy'] = '已核销';
            } else {
              item['clearBy'] = '未核销';
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
