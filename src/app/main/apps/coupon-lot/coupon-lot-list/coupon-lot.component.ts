import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ECouponServiceService} from '../../../../services/EcouponService/ecoupon-service.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';


@Component({
  selector: 'app-coupon-lot',
  templateUrl: './coupon-lot.component.html',
  styleUrls: ['./coupon-lot.component.scss']
})
export class CouponLotComponent implements OnInit , OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private couponService: ECouponServiceService,
      private dateTransform: NewDateTransformPipe ,
      private notify: NotifyAsynService
  ) { }

  ngOnInit() {
      this.getColumns();
      this.initSearch();
  }

    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'ElectronicVoucherManagement.PageTwice.id', type: '', value: ''},
            {name: 'number', translate: 'ElectronicVoucherManagement.CouponLot.couponLotNum', type: 'input', value: ''},
            {name: 'couponName', translate: 'ElectronicVoucherManagement.CouponLot.couPonName', type: '', value: ''}, // input
            /* {name: 'number', translate: 'ElectronicVoucherManagement.CouponLot.number', type: '', value: ''}, // input
            {
                name: 'rule', translate: 'ElectronicVoucherManagement.PageTwice.rule', type: '', // select
                options: [
                    {translate: 'ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT', value: CouponParameter.FULL_BREAK_DISCOUNT},
                    {translate: 'ElectronicVoucherManagement.SelectCASH', value: CouponParameter.CASH}
                ]
                ,
                value: ''
            },*/
            {name: 'quantity', translate: 'ElectronicVoucherManagement.CouponLot.capacity', type: '', value: ''},
            {name: 'balance', translate: 'ElectronicVoucherManagement.CouponLot.balance', type: '', value: '' ,  sort: false},
       /*     {name: 'validity', translate: 'ElectronicVoucherManagement.PageFirst.TermOfValidity', value: ''  , sort: false },
            {name: 'canGift', translate: 'ElectronicVoucherManagement.CouponLot.canGift', type: ''  , // select
                options: [
                    {translate: 'ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT', value: CouponParameter.FULL_BREAK_DISCOUNT},
                    {translate: 'ElectronicVoucherManagement.SelectCASH', value: CouponParameter.CASH}
                ]
                ,  value: '' },
            {name: 'canReturn', translate: 'ElectronicVoucherManagement.CouponLot.canReturn', value: ''  },*/
            {name: 'external', translate: 'ElectronicVoucherManagement.CouponLot.external', value: ''  },
            {name: 'lastModifiedBy', translate: 'ElectronicVoucherManagement.CouponLot.lastModifiedBy', type: '', value: ''},
            {name: 'lastModifiedDate', translate: 'ElectronicVoucherManagement.CouponLot.lastModifiedDate', type: '', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.couponService.getAllBatches(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body;
                this.page.count =  res.headers.get('x-total-count');
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
            this.loading.hide();

        }, () => {  this.loading.hide(); });
    }

    // 搜索
    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.couponService.getAllBatches(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res['body'];
                this.page.count =  res['headers'].get('x-total-count');
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();

        } , () => { this.loading.hide(); });
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

    // 详情跳转
    getDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/CouponLotComponent/BatchAddDetailComponent/' + event.id ]).then(res => {
            this.loading.hide();
        });
    }

    // 新增跳转 <!--[createButton]="true" (create)="CreatCoupon()" -->
    CreateLot(){
        this.loading.show();
        this.router.navigate(['/apps/CouponLotComponent/BatchAddDetailComponent/' + CouponParameter.COUPONLOTADD_ID]).then(res => {
            this.loading.hide();
        });
    }



    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
