import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {takeUntil} from 'rxjs/operators';
import {CouponMaintainEntity, ECouponServiceService} from '../../../../services/EcouponService/ecoupon-service.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {CouponParameter} from '../../../../services/EcouponService/CouponParameter';

@Component({
    selector: 'app-coupon-maintain',
    templateUrl: './coupon-maintain.component.html',
    styleUrls: ['./coupon-maintain.component.scss']
})
export class CouponMaintainComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject();

    /** 浮动模式选择标签单选*/
    @Input()
    selectedRow: any; // 单个选中，传一个对象
    @Input()
    singleSelect = false;
    /** 多选*/
    @Input()
    selectedRows = [];
    @Input()
    checkbox = false;
    @Input()
    overPanel = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    resetSelect = true;

    rows: CouponMaintainEntity[];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private couponService: ECouponServiceService,
        private dateTransform: NewDateTransformPipe,
        private notify: NotifyAsynService
    ) {
    }

    ngOnInit() {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    onDataSelect(event) {
        this.dataSelect.emit(event);
    }


    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'ElectronicVoucherManagement.PageTwice.id', type: '', value: ''},
            {name: 'name', translate: 'ElectronicVoucherManagement.PageTwice.name', type: 'input', value: ''},
            {
                name: 'rule', translate: 'ElectronicVoucherManagement.PageTwice.rule', type: 'select',  needTranslate: true ,
                options: [
                    {
                        translate: 'ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT',
                        value: CouponParameter.FULL_BREAK_DISCOUNT
                    },
                    {translate: 'ElectronicVoucherManagement.SelectCASH', value: CouponParameter.CASH},
                    {
                        translate: 'ElectronicVoucherManagement.SelectCOUPON_OF_GOODS',
                        value: CouponParameter.COUPON_OF_GOODS
                    }
                ]
                ,
                value: ''
            },
            {
                name: 'source', translate: 'ElectronicVoucherManagement.PageTwice.source', type: 'select',
                options: [
                    {translate: 'ElectronicVoucherManagement.SelectBCIA_TT_CRM_30', value: CouponParameter.BCIA_TT_CRM},
                    {translate: 'ElectronicVoucherManagement.SelectDEFAULT', value: CouponParameter.DEFAULT}
                ]
                , value: ''
            },
            {
                name: 'validity',
                translate: 'ElectronicVoucherManagement.PageFirst.TermOfValidity',
                type: '',
                value: '',
                sort: false
            },
            {
                name: 'lastModifiedBy',
                translate: 'ElectronicVoucherManagement.PageTwice.lastModifiedBy',
                type: '',
                value: ''
            },
            {
                name: 'lastModifiedDate',
                translate: 'ElectronicVoucherManagement.PageTwice.lastModifiedDate',
                type: '',
                value: ''
            },
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.couponService.getCouponEntityByCondition(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.setData(res);
                this.rows = res['body'];
                this.page.count = res['headers'].get('X-Total-Count');
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
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
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.couponService.getCouponEntityByCondition(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this. setData(res);
                this.rows = res['body'];
                this.page.count = res['headers'].get('X-Total-Count');
                this.notify.onResponse.emit(); // 拿到大小时 流程完成发射事件
                if (this.rows.length === 0) { // 如果是空数组返回了
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
        this.page.sort = event;
        this.onSearch();
    }

    // 详情跳转
    getDetail(event) {
        this.loading.show();
        // + event.id
        this.router.navigate(['/apps/CouponMaintainComponent/EditSecuritiesRulesComponent/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    // 新增跳转 <!--[createButton]="true" (create)="CreatCoupon()" -->
    CreatCoupon() {
        this.loading.show();
        this.router.navigate(['/apps/AddCouponMaintainComponent']).then(res => {
            this.loading.hide();
        });
    }

    // 新增券规则跳转  <!-- [createRuleButton]=true (createRule)="CreatCouponRule()"-->
    CreatCouponRule() {
        this.loading.show();
        this.router.navigate(['/apps/AddCouponMaintainComponent']).then(res => {
            this.loading.hide();
        });
    }


    setData(res){
        for (let y = 0; y < res['body'].length; y++) {
            // if (res['body'][y].rule === CouponParameter.FULL_BREAK_DISCOUNT) {
            //     res['body'][y].rule = this.translate.instant('ElectronicVoucherManagement.PageFirst.FULL_BREAK_DISCOUNT');
            // } else if (res['body'][y].rule === CouponParameter.CASH){
            //     res['body'][y].rule = this.translate.instant('ElectronicVoucherManagement.PageFirst.CASH');
            // } else {
            //     res['body'][y].rule =  this.translate.instant('ElectronicVoucherManagement.SelectCOUPON_OF_GOODS');
            // }

            if (res['body'][y].source === CouponParameter.BCIA_TT_CRM) {
                res['body'][y].source = this.translate.instant('ElectronicVoucherManagement.SelectBCIA_TT_CRM_30');
            } else {
                res['body'][y].source = this.translate.instant('ElectronicVoucherManagement.SelectDEFAULT');
            }

            res['body'][y]['validity'] = this.dateTransform.transform(res['body'][y]['timeBegin']) + ' - ' + this.dateTransform.transform(res['body'][y]['timeEnd']);
            if (res['body'][y]['validity'].indexOf('Invalid') !== -1) {
                res['body'][y]['validity'] = res['body'][y]['timeBegin'] + ' - ' + res['body'][y]['timeEnd'];
            }

        }
    }


    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
