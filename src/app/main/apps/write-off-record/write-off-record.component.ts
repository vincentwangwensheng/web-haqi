import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {CouponParameter} from '../../../services/EcouponService/CouponParameter';
import {CouponEntity, ECouponServiceService} from '../../../services/EcouponService/ecoupon-service.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {FileDownloadService} from '../../../services/file-download.service';
import {Utils} from '../../../services/utils';

@Component({
    selector: 'app-write-off-record',
    templateUrl: './write-off-record.component.html',
    styleUrls: ['./write-off-record.component.scss']
})
export class WriteOffRecordComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows: CouponEntity[] = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    @ViewChild('confirm', {static: true})
    confirmTemplate: TemplateRef<any>;
    @ViewChild('export', {static: true})
    exportTemplate: TemplateRef<any>;

    exFilterDisabled = false; // 导出筛选按钮操作时禁用
    exAllDisabled = false; // 导出全部按钮操作时禁用

    notifyNumber = 10000; // 提醒数据量过大的临界数

    // 电子券列表
    constructor(private couponService: ECouponServiceService,
                private snackBar: MatSnackBar,
                private fileDownload: FileDownloadService,
                private translate: TranslateService,
                private router: Router,
                private utils: Utils,
                private dialog: MatDialog,
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
            {name: 'name', source: 'coupon', translate: '电子券名称', value: '', sort: true, type: 'input'},
            {name: 'code', source: 'code', translate: '券编码', value: '', sort: true, type: 'input'},
            {name: 'mobile', source: 'code', translate: '手机号', value: '', sort: true, type: 'input'},
            {
                name: 'rule', translate: '电子券类型', value: '', sort: false, type: '', options: [
                    {
                        translate: 'ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT',
                        value: CouponParameter.FULL_BREAK_DISCOUNT
                    },
                    {translate: 'ElectronicVoucherManagement.SelectCASH', value: CouponParameter.CASH}
                ]
            },
            {name: 'source', translate: '券来源', value: '', sort: false},
            {name: 'receiveTime', source: 'code', translate: '领取时间', value: '', type: 'date'},
            {name: 'clearTime', source: 'code', translate: '使用时间', value: '', type: 'date'},
            {name: 'statusText', translate: '状态', value: '', sort: false},
            {name: 'storeId', translate: '店铺编号', value: ''},
            {name: 'storeName', translate: '店铺名称', value: '', sort: false},
            {name: 'outId', translate: 'outID', value: ''},
            {name: 'outAmount', translate: '订单金额', value: ''},
            {name: 'amount', translate: '优惠金额', value: ''}
        ];
    }

    dataTransform() {
        this.rows.forEach(row => {
            switch (row['source']) {
                case CouponParameter.DEFAULT: {
                    row['source'] = '精准营销';
                    break;
                }
            }
            switch (row['rule']) {
                case CouponParameter.FULL_BREAK_DISCOUNT: {
                    row['rule'] = '满减券';
                    break;
                }
                case CouponParameter.CASH: {
                    row['rule'] = '现金券';
                    break;
                }
                case CouponParameter.COUPON_OF_GOODS: {
                    row['rule'] = '商品券';
                    break;
                }
            }
        });
    }


    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.couponService.getWriteOffRecord(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body as any;
                this.page.count = Number(res.headers.get('X-Total-Count'));
                this.dataTransform();
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.loading.hide();
                this.notify.onResponse.emit();
            }
        }, error => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });
    }


    // 搜索
    onSearch() {
        this.loading.show();
        const multiSearch = this.utils.transformColumns(this.columns);
        this.couponService.getWriteOffRecord(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body as any;
                this.page.count = Number(res.headers.get('X-Total-Count'));
                this.dataTransform();
                this.loading.hide();
                this.notify.onResponse.emit();
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });
    }

    // 导出筛选
    exportFilter() {
        this.exFilterDisabled = true;
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
        if (multiSearch.length === 0) {
            this.snackBar.open('请输入条件查询之后再进行导出筛选！', '✖');
            this.exFilterDisabled = false;
        } else {
            if (this.page.count <= this.notifyNumber) {
                this.getFilterExport(multiSearch);
            } else {
                this.dialog.open(this.exportTemplate).afterClosed().subscribe(res => {
                    if (res) {
                        this.getFilterExport(multiSearch);
                    } else {
                        this.exFilterDisabled = false;
                    }
                });
            }
        }
    }

    // 导出筛选为文件
    getFilterExport(multiSearch) {
        this.loading.show();
        this.couponService.exportWriteOffRecord(0, this.page.count, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.fileDownload.blobDownload(res, '核销记录导出筛选.csv');
            }
            this.loading.hide();
            this.exFilterDisabled = false;
        }, error1 => {
            this.exFilterDisabled = false;
        });
    }

    // 导出所有
    exportAll() {
        this.exAllDisabled = true;
        this.dialog.open(this.confirmTemplate).afterClosed().subscribe(res => {
            if (res) {
                if (this.page.count <= this.notifyNumber) {
                    this.getAllExport();
                } else {
                    this.dialog.open(this.exportTemplate).afterClosed().subscribe(r => {
                        if (r) {
                            this.getAllExport();
                        } else {
                            this.exAllDisabled = false;
                        }
                    });
                }
            } else {
                this.exAllDisabled = false;
            }
        });
    }

    // 导出所有为文件
    getAllExport() {
        this.loading.show();
        this.couponService.exportWriteOffRecord(0, 0x3f3f3f, this.page.sort).subscribe(r => {
            if (r) {
                this.fileDownload.blobDownload(r, '核销记录导出全部.csv');
            }
            this.exAllDisabled = false;
            this.loading.hide();
        }, error1 => {
            this.exAllDisabled = false;
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
        this.page.sort = event;
        this.onSearch();
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
