import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {
    CouponEntity,
    ECouponServiceService,
} from '../../../services/EcouponService/ecoupon-service.service';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {TranslateService} from '@ngx-translate/core';
import {takeUntil} from 'rxjs/operators';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {CouponParameter} from '../../../services/EcouponService/CouponParameter';

@Component({
    selector: 'app-ecoupon-list',
    templateUrl: './coupon-list.component.html',
    styleUrls: ['./coupon-list.component.scss']
})
export class CouponListComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject();
    rows: CouponEntity[] = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    // 电子券列表
    constructor(private couponService: ECouponServiceService,
                private snackBar: MatSnackBar,
                private translate: TranslateService,
                private router: Router,
                private loading: FuseProgressBarService,
                private dateTransform: NewDateTransformPipe,
                private notify: NotifyAsynService
    ) {
    }

    ngOnInit() {
        this.getColumns();
        this.initSearch();


    }

// 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'name', source: 'coupon', translate: 'ElectronicVoucherManagement.PageFirst.name', type: 'input', value: '', sort: true}, // input
            {name: 'number', source: 'coupon',  translate: 'ElectronicVoucherManagement.PageFirst.batchNo', value: '', sort: true},
            {name: 'code', source: 'code', translate: 'ElectronicVoucherManagement.PageFirst.code',  value: '', sort: true},
            {name: 'validity', translate: 'ElectronicVoucherManagement.PageFirst.TermOfValidity', value: '', sort: false},
            {name: 'mobile', source: 'code', translate: 'ElectronicVoucherManagement.PageFirst.mobile', value: ''},
            {
                name: 'rule', source: 'coupon', translate: 'ElectronicVoucherManagement.PageFirst.rule', type: 'select',  needTranslate: true ,
                options: [
                    {translate: 'ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT', value: CouponParameter.FULL_BREAK_DISCOUNT},
                    {translate: 'ElectronicVoucherManagement.SelectCASH', value: CouponParameter.CASH},
                    {translate: 'ElectronicVoucherManagement.SelectCOUPON_OF_GOODS', value: CouponParameter.COUPON_OF_GOODS}
                ]
                ,
                value: '', sort: true
            },
            {
                name: 'statusText', translate: 'ElectronicVoucherManagement.PageFirst.status', type: '', // select
                options: [
                    {translate: 'ElectronicVoucherManagement.NOWriteOff', value: '未核销'},
                    {translate: 'ElectronicVoucherManagement.YESWriteOff', value: '已核销'},
                    {translate: 'ElectronicVoucherManagement.YESReturnGoods', value: '已退货'},
                    /*{translate: 'ElectronicVoucherManagement.ReturnGoods', value: '已核销'},*/
                ]
                ,
                value: '', sort: false
            },
            {name: 'receiveTime', source: 'code', translate: 'ElectronicVoucherManagement.PageFirst.receiveTime', type: 'date', value: ''},
            {name: 'clearTime', source: 'code', translate: 'ElectronicVoucherManagement.PageFirst.clearTime', type: 'date', value: ''},
        ];
    }


    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.couponService.getAllCouponCodes(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
            if (res_json) {
                this.rows = [];
                const res =  res_json['body'];
                this.setData(res);
                this.page.count = res_json['headers'].get('X-Total-Count');
                this.notify.onResponse.emit();
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
    }


    // 搜索
    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                if (column.source) { // 拼接特殊字段查询code.xxx.contains  / coupon.xxxx.contains
                    const newColumn: any = {};
                    Object.assign(newColumn, column);
                    newColumn.name = newColumn.source + '.' + newColumn.name;
                    multiSearch.push(newColumn);
                } else {
                    multiSearch.push(column);
                }
            }

        });
        this.couponService.getAllCouponCodes(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
            if (res_json) {
                const res =  res_json['body'];
                this.rows = [];
                this.setData(res);
                if (res.length === 0) {
                    this.rows = [];
                }
                this.page.count = res_json['headers'].get('X-Total-Count');
                this.notify.onResponse.emit();
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
        }, error => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
        });
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
        let pa_ev = event;
        if (pa_ev.includes('name') || pa_ev.includes('number') || pa_ev.includes('rule')) {
            pa_ev = 'coupon.' + event;
        } else {
           // pa_ev = 'code.' + event;
        }
        this.page.sort = pa_ev;
        this.onSearch();
    }

    setData(res){
        for (let a = 0; a < res.length; a++) {
            // let rule;
            // if (res[a]['coupon']['rule'] === CouponParameter.FULL_BREAK_DISCOUNT) {
            //     rule = this.translate.instant('ElectronicVoucherManagement.PageFirst.FULL_BREAK_DISCOUNT');
            // } else if (res[a]['coupon']['rule'] === CouponParameter.CASH) {
            //     rule = this.translate.instant('ElectronicVoucherManagement.PageFirst.CASH');
            // } else {
            //     rule = this.translate.instant('ElectronicVoucherManagement.PageFirst.COUPON_OF_GOODS');
            // }
            let validity_ = this.dateTransform.transform(res[a]['code']['timeBegin']) + ' - ' + this.dateTransform.transform(res[a]['code']['timeEnd']);
            if (validity_.indexOf('Invalid') !== -1) {
                validity_ = res[a]['code']['timeBegin'] + ' - ' + res[a]['code']['timeEnd'];
            }
            this.rows.push(
                {
                    name: res[a]['coupon']['name'], number: res[a]['coupon']['number'],
                    rule: res[a]['coupon']['rule'], code: res[a]['code']['code']
                    , validity: validity_,
                    mobile: res[a]['code']['mobile'], statusText: res[a]['code']['statusText'],
                    receiveTime: res[a]['code']['receiveTime'], clearTime: res[a]['code']['clearTime'], couponId: res[a]['code']['couponId']
                });
        }
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
