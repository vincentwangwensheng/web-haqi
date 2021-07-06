import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../../services/notify-asyn.service';
import {TranslateService} from '@ngx-translate/core';
import {fuseAnimations} from '../../../../../../../@fuse/animations';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CouponManageService} from '../../coupon-manage.service';
import {NewDateTransformPipe} from '../../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-coupon-batch-detail',
  templateUrl: './coupon-batch-detail.component.html',
  styleUrls: ['./coupon-batch-detail.component.scss'],
  animations: fuseAnimations
})
export class CouponBatchDetailComponent implements OnInit, OnDestroy {
  private _unsubscribeAll = new Subject();
  title: any;
  operation = '';
  // 选择券规则
  selectedRule = null;
  currentRule = null;
  couponBatchList = []; // 获取的券规则数据

  // 日期选择器
  configStartTime: any;
  configEndTime: any;
  couponBatchForm: FormGroup;
  batchTypeList = [];

  constructor(
      private dialog: MatDialog,
      private loading: FuseProgressBarService,
      private snackBar: MatSnackBar,
      private notify: NotifyAsynService,
      private translate: TranslateService,
      private router: Router,
      private sanitizer: DomSanitizer,
      private newDateTransformPipe: NewDateTransformPipe,
      public couponManageService: CouponManageService,
      public activatedRoute: ActivatedRoute
  ) {
    this.initData();
    this.initTimeConfig();
    this.couponBatchForm = new FormGroup({
      couponNumber: new FormControl('', Validators.required),
      enabled: new FormControl({value: true, disabled: true}),
      total: new FormControl('', Validators.required),
      batchType: new FormControl('', Validators.required),
      beginTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required),
    });
  }

  ngOnInit() {
    this.getPageInfo();
    this.toGetBatchTypeList();
  }

  /******************** 获取页面属性及基础信息 ******************/
  // 获取可用的套餐类型
  toGetBatchTypeList(){
    this.couponManageService.toGetBatchTypeList().subscribe(res => {
      res.forEach(item => {
        if (item['id'] !== 'EXTERNAL'){
          this.batchTypeList.push(item);
        }
      });
    });
  }

  getOperation(){
    return new Promise((resolve) => {
      this.activatedRoute.data.pipe(takeUntil(this._unsubscribeAll)).subscribe(p => {
        this.operation = p.operation;
        resolve(p.operation);
      });
    });
  }

  getPageInfo(){
    this.title = new Map([
      ['create', '新建券批次'],
      ['detail', '券批次详情'],
      ['edit', '编辑券批次'],
    ]);
    this.getOperation().then(res => {
      if (res === 'detail') {
        this.getDetailInfo();
      } else {
        this.couponBatchForm.get('couponNumber').disable();
      }
    });
  }

  // 获取详情页信息
  getDetailInfo() {
    this.activatedRoute.queryParams.subscribe(p => {
      const id = p.id;
      this.couponManageService.getCouponBatchDetailById(id).subscribe(res => {
        this.couponBatchForm.patchValue({
          couponNumber: res['number'],
          enabled: res['enabled'],
          total: res['total'],
          batchType: res['batchType'],
          beginTime: res['beginTime'],
          endTime: res['endTime']
        });
        this.couponBatchForm.disable();
        this.couponManageService.toGetCouponRuleDetailById(res['coupon']['id']).subscribe(ref => {
          this.currentRule = ref;
          this.translateCurrentRule();
        });
      });
      this.couponBatchForm.disable();
    });
  }

  /************ 券规则选择 *************/
  openMemberSelect(memberTemplate) {
    this.dialog.open(memberTemplate, {id: 'memberSelect', width: '80%'}).afterClosed().subscribe(res => {
      if (res) {
        this.currentRule = this.selectedRule;
        this.translateCurrentRule();
      } else {
        this.currentRule = null;
      }
    });
  }

  translateCurrentRule(){
    this.currentRule['validity'] = this.newDateTransformPipe.transform(this.currentRule['beginTime']) + ' - ' +
        this.newDateTransformPipe.transform(this.currentRule['endTime']);
    this.couponBatchList.forEach(item => {
      if (item['field'] in this.currentRule){
        if (item['field'] !== 'pic'){
          item['value'] = this.currentRule[item['field']];
        }
      }
    });
  }

  saveProject(){
    if (this.operation === 'create'){
      this.couponBatchForm.markAllAsTouched();
      if (this.currentRule === null){
        this.snackBar.open('请选择券规则！', '✖');
      } else if (this.couponBatchForm.valid) {
        const data = {
          'batchType': this.couponBatchForm.value['batchType'],
          'beginTime': this.couponBatchForm.value['beginTime'],
          'couponNumber': this.currentRule['number'],
          'endTime': this.couponBatchForm.value['endTime'],
          'total': this.couponBatchForm.value['total'],
          'codeList': ['string']
        };
        data['beginTime'] = new Date(data['beginTime']).toISOString();
        data['endTime'] = new Date(data['endTime']).toISOString();
        this.couponManageService.toCreateCouponBatch(data).subscribe(res => {
          this.snackBar.open('新增成功！', '✖');
          this.router.navigate(['apps/couponBatch']);
        });
      } else {
        this.snackBar.open('还有未填项与校验不通过项！！！', '✖');
      }
    } else if (this.operation === 'edit'){
      const data1 = {
        'enabled': this.couponBatchForm.value['enabled']
      };
      this.couponManageService.closeOpenEnabled(this.couponBatchForm.get('couponNumber')['value'], data1).subscribe(res => {
        this.snackBar.open('修改成功！', '✖');
        this.router.navigate(['apps/couponBatch']);
      });
    }
  }

  editProject(){
    this.operation = 'edit';
    this.couponBatchForm.get('enabled').enable();
  }

  goBack(){
    if (this.operation !== 'detail' && this.operation !== 'create') {
      this.operation = 'detail';
      this.getDetailInfo();
    } else {
      this.router.navigate(['apps/couponBatch']);
    }
  }

  onMemberSelect(event) {
    this.selectedRule = event;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  /***********日期选择器**********/
  initTimeConfig() {
    this.configStartTime = {
      enableTime: true,
      time_24hr: true,
      enableSeconds: true,
      defaultHour: '0',
      defaultMinute: '0',
      defaultSeconds: '0'
    };
    this.configEndTime = {
      enableTime: true,
      time_24hr: true,
      enableSeconds: true,
      defaultHour: '23',
      defaultMinute: '59',
      defaultSeconds: '59'
    };
  }

  onSourceDate(e, endTime, startTime, p) {
    if (p === 'startTime') {
      e.setHours(23);
      e.setMinutes(59);
      e.setSeconds(59);
    }
    'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
  }

  initData(){
    this.couponBatchList = [
      {name: '券规则名称', field: 'name', value: ''},
      {name: '券规则ID', field: 'id', value: ''},
      {name: '券类型', field: 'type', value: ''},
      {name: '领取有效期', field: 'validity', value: ''},
      {name: '核销有效期', field: '', value: ''},
      {name: '领取总量', field: '', value: '1'}, // 直接给死
      {name: '单日领取', field: '', value: '1'}, // 直接给死
      {name: '退款退券', field: '', value: '是'}, // 直接给死
      {name: '会员限制', field: 'level', value: ''}, // 10
      {name: '使用说明', field: '', value: ''},
    ];

  }
}
