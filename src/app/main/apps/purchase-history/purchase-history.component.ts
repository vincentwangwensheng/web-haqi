import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {ECouponServiceService} from '../../../services/EcouponService/ecoupon-service.service';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {CouponParameter} from '../../../services/EcouponService/CouponParameter';

@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit, OnDestroy {

  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  hasStatus = false;
  detail: any;
  examineStatus = ''; // 状态
  operator = ''; // 操作人
  filter = [{name: 'coupon.rule', value: 'COUPON_OF_GOODS'}];
  // 购买记录
  constructor(private couponService: ECouponServiceService,
              private snackBar: MatSnackBar,
              private translate: TranslateService,
              private router: Router,
              private loading: FuseProgressBarService,
              private dateTransform: NewDateTransformPipe,
              private notify: NotifyAsynService,
              public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.operator = sessionStorage.getItem('username');
    this.getColumns();
    this.initSearch();
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'name', source: 'coupon', translate: '电子券名称', type: 'input', value: '', sort: true}, //
      {name: 'code', translate: '券码', type: '',  value: '', sort: true},
      {name: 'rule', source: 'coupon', translate: '电子券类型', type: '', value: '',  options: [
          {translate: 'ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT', value: CouponParameter.FULL_BREAK_DISCOUNT},
          {translate: 'ElectronicVoucherManagement.SelectCOUPON_OF_GOODS', value: CouponParameter.COUPON_OF_GOODS},
          {translate: 'ElectronicVoucherManagement.SelectCASH', value: CouponParameter.CASH}
        ], sort: true}, //
      {name: 'validity', translate: '有效期', type: '', value: '', sort: false},
      {name: 'mobile', source: 'code', translate: '手机号', type: 'input', value: '', sort: true}, //
      {name: 'lastModifiedDate', translate: '修改时间', type: '', value: '', sort: true},
      {name: 'outId', translate: 'OutID', type: '', value: '', sort: true},
      {name: 'payMoney', translate: '支付金额', type: '', value: '', sort: false},
      {name: 'status', translate: '状态', type: '', value: '', sort: false}, // 中间算出来的，做不了条件查询
    ];
  }

  // 初始化列表数据
  initSearch(multiSearch?) {
    this.loading.show();
    this.couponService.getCodeWithCouponAndWechat(this.page.page, this.page.size, this.page.sort, multiSearch , this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
      if (res_json) {
        this.rows = [];
        const res = res_json['body'];
        for (let a = 0; a < res.length; a++) {
          let rule;
          if (res[a]['coupon']) {
            if (res[a]['coupon']['rule'] === CouponParameter.FULL_BREAK_DISCOUNT) {
              rule = this.translate.instant('ElectronicVoucherManagement.SelectFULL_BREAK_DISCOUNT'); // '满减券';
            } else if (res[a]['coupon']['rule'] === CouponParameter.CASH) {
              rule = this.translate.instant('ElectronicVoucherManagement.SelectCASH');  // '现金券';
            } else if (res[a]['coupon']['rule'] === CouponParameter.COUPON_OF_GOODS) {
              rule = this.translate.instant('ElectronicVoucherManagement.SelectCOUPON_OF_GOODS'); // '商品券';
            } else {
              rule = this.translate.instant('ElectronicVoucherManagement.SelectOther');  // '其他券';
            }
          }
          let validity_ = this.dateTransform.transform(res[a]['code'] ? res[a]['code']['timeBegin'] : null)
              + ' - ' + this.dateTransform.transform(res[a]['code'] ? res[a]['code']['timeEnd'] : null);
          if (validity_.indexOf('Invalid') !== -1) {
            validity_ = res[a]['code']['timeBegin'] + ' - ' + res[a]['code']['timeEnd'];
          }
          if (res[a]['status'] === 'SUBMIT'){
            res[a]['status'] = this.translate.instant('ElectronicVoucherManagement.purchaseHistory.SUBMIT'); // '待审核';
          } else if (res[a]['status'] === 'PAYED' || res[a]['status'] === 'REFUSE') { // (包括已驳回）
            res[a]['status'] =  this.translate.instant('ElectronicVoucherManagement.purchaseHistory.REFUSE'); // '已支付';
          } else if (res[a]['status'] === 'PASS') {
            res[a]['status'] =  this.translate.instant('ElectronicVoucherManagement.purchaseHistory.PASS');  // '已退款';
          }
          this.rows.push({
                name: res[a]['coupon'] ? res[a]['coupon']['name'] : null, // 电子卷名称--
                code: res[a]['code'] ? res[a]['code']['code'] : null, // 券码--
                rule: rule, // 电子券类型--
                validity: validity_, // 有效期--
                mobile: res[a]['code'] ? res[a]['code']['mobile'] : null, // 手机号--
                lastModifiedDate: res[a]['code'] ? res[a]['code']['lastModifiedDate'] : null, // 修改时间--
                outId: res[a]['wechatPayOrder'] ? res[a]['wechatPayOrder']['outId'] : null, // OutID--
                payMoney: res[a]['wechatPayOrder'] ? res[a]['wechatPayOrder']['amount'] : null, // 支付金额--
                status: res[a]['status'] // 状态
              });
        }
        this.page.count = res_json['headers'].get('X-Total-Count');
        this.notify.onResponse.emit();
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('ElectronicVoucherManagement.purchaseHistory.tips1'), '✖');
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
    const multiSearch = [];
    this.columns.forEach(column => {
      if (column.value !== '') {
        if (column.source) {
          const newColumn: any = {};
          Object.assign(newColumn, column);
          newColumn.name = newColumn.source + '.' + newColumn.name;
          multiSearch.push(newColumn);
        } else {
          multiSearch.push(column);
        }
      }
    });
    this.initSearch(multiSearch);
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
    console.log('event:', event);
    let pa_ev = event;
    if (pa_ev.includes('name') || pa_ev.includes('number') || pa_ev.includes('rule')) {
      pa_ev = 'coupon.' + event;
    }
    this.page.sort = pa_ev;
    this.onSearch();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // 获取退款详详情信息并打开弹出框
  getDetail(event, MatDialogFrozen) {
    this.detail = {};
    const data = {'couponNum': event['code']};
    if (event['status'] === this.translate.instant('ElectronicVoucherManagement.purchaseHistory.REFUSE')) {
      this.hasStatus = false;
      this.examineStatus = this.translate.instant('ElectronicVoucherManagement.purchaseHistory.REFUSE');
      this.detail = {'couponName': event['name'], 'phone': event['mobile']};
      this.dialog.open(MatDialogFrozen, {id: 'frozenTips', width: '390px', height: '210px', position: {top: '200px'}});
    } else {
      this.loading.show();
      this.couponService.getRefundReason(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
        if (res_json){
          console.log('res_json:', res_json);
          this.detail = res_json['body'];
          if (this.detail['examineStatus'] === 'SUBMIT') { // 待审核
            this.hasStatus = true;
            this.examineStatus = this.translate.instant('ElectronicVoucherManagement.purchaseHistory.SUBMIT');
            this.dialog.open(MatDialogFrozen, {id: 'frozenTips', width: '390px', height: '310px', position: {top: '200px'}});
          } else if (this.detail['examineStatus'] === 'PASS')  { // 已退款
            this.hasStatus = true;
            this.examineStatus = this.translate.instant('ElectronicVoucherManagement.purchaseHistory.PASS');
            this.dialog.open(MatDialogFrozen, {id: 'frozenTips', width: '390px', height: '310px', position: {top: '200px'}});
          }
        }
        this.loading.hide();
      }, error => {
        this.loading.hide();
      }, () => {
        this.loading.hide();
      });
    }
  }

  // 通过
  approvingPass() {
    if (!this.detail['refundReason']) {
      this.snackBar.open('请输入审核原因', '✖');
    } else {
      this.loading.show();
      this.couponService.getRefundsPass(this.detail).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
        if (res_json){
          this.initSearch();
          this.detail = {};
        }
        this.dialog.closeAll();
        this.loading.hide();
      }, error => {
        this.loading.hide();
      }, () => {
        this.loading.hide();
      });
    }
  }

  // 驳回
  approvingReject() {
    if (!this.detail['refundReason']) {
      this.snackBar.open('请输入审核原因', '✖');
    } else {
      this.loading.show();
      this.couponService.getRefundsRefuse(this.detail).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
        if (res_json){
          this.initSearch();
          this.detail = {};
        }
        this.dialog.closeAll();
        this.loading.hide();
      }, error => {
        this.loading.hide();
      }, () => {
        this.loading.hide();
      });
    }
  }

}
