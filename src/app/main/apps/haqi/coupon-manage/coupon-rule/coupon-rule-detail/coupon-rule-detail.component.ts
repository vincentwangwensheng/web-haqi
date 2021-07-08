import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Utils} from '../../../../../../services/utils';
import {fuseAnimations} from '../../../../../../../@fuse/animations';
import {MatDialog, MatSnackBar} from '@angular/material';
import {CouponManageService} from '../../coupon-manage.service';
import {DomSanitizer} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-coupon-rule-detail',
  templateUrl: './coupon-rule-detail.component.html',
  styleUrls: ['./coupon-rule-detail.component.scss'],
  animations: fuseAnimations
})
export class CouponRuleDetailComponent implements OnInit {
  private _unsubscribeAll = new Subject();
  title: any;
  operation = '';
  canSave = true;
  couponRuleForm: any;
  couponTypeList = [];
  configStartTime: any; // 设置开始时间
  configEndTime: any; // 设置结束时间
  canEdit = false;
  enabledInit = false;
  previewData: any;  // 预览

  uploadFile = new UploadFile(); // 上传图片

  // 选择商户
  storeSource = [];
  storeShow = [];
  storeSourceLength = 0;
  // 核销有效期参数
  extParams: null;
  periodTypeList = [];

  constructor(
      private utils: Utils,
      private dialog: MatDialog,
      private snackBar: MatSnackBar,
      private sanitizer: DomSanitizer,
      public activatedRoute: ActivatedRoute,
      private router: Router,
      private datePipe: DatePipe,
      public couponManageService: CouponManageService
  ) {
    this.couponRuleForm = new FormGroup( {
      id : new FormControl({value: '', disabled: true}),
      name : new FormControl('', Validators.required),
      type : new FormControl('DEFAULT'),
      value : new FormControl('' ),
      price : new FormControl('' ),
      threshold : new FormControl('' ),
      beginTime : new FormControl('', Validators.required),
      endTime : new FormControl('', Validators.required),
      periodType: new FormControl('DEFAULT'),
      extParams: new FormControl(''),
      Second: new FormControl(''),
      PeriodBeginTime: new FormControl(''),
      PeriodEndTime: new FormControl(''),
      enabled: new FormControl({value: false, disabled: true}),
      pic: new FormControl(''),
      getTotal: new FormControl({value: '1', disabled: true}),
      getEveryDay: new FormControl({value: '1', disabled: true}),
      isReturn: new FormControl({value: true, disabled: true}),
      level: new FormControl({value: ['__ALL__'], disabled: true}),
      store: new FormControl(''),
      defaultBatchAmount: new FormControl(), // 默认批次
      ruleText : new FormControl('', Validators.required),
      parkingTime : new FormControl(''), // 停车时长
      canGift: new FormControl(true), // 是否支持分享
      giftMax: new FormControl(), // 单人领取分享限制数量
    });
    // this.utils.transformToFixed2ByControls([this.couponRuleForm.get('price'), this.couponRuleForm.get('value')]);
  }

  ngOnInit() {
    this.getPageInfo();
    this.getTypeList();
    this.getPeriodType();
    this.initTimeConfig();
  }

  /******************** 获取页面属性及基础信息 ******************/
  // 获取核销时间类型
  getPeriodType() {
    this.couponManageService.toGetPeriodType().subscribe(res => {
      this.periodTypeList = res;
    });
  }

  getTypeList() {
    this.couponManageService.toGetCouponType().subscribe(res => {
      this.couponTypeList = res;
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
      ['create', '新建券规则'],
      ['detail', '券规则详情'],
      ['edit', '券规则编辑']
    ]);
    this.getOperation().then(res => {
      if (res === 'detail') {
        this.getDetailInfo();
      } else if (res === 'create') {
        const couponRuleData = sessionStorage.getItem('couponRule');
        if (couponRuleData){
          this.initPageContent(JSON.parse(couponRuleData));
          sessionStorage.removeItem('couponRule');
        }
      }
    });
  }

  // 获取详情页信息
  getDetailInfo() {
    this.activatedRoute.queryParams.subscribe(p => {
      const id = p.id;
      this.couponManageService.toGetCouponRuleDetailById(id).subscribe(res => {
        this.enabledInit = res['enabled'];
        this.initPageContent(res);
      });
    });
  }

  initPageContent(res){
    this.couponRuleForm.patchValue({
      id : this.operation === 'detail' ? res['id'] : '',
      name : res['name'],
      type : res['type'],
      value : res['value'],
      price : res['price'],
      threshold : res['threshold'],
      ruleText : res['ruleText'],
      enabled: res['enabled'],
      beginTime : res['beginTime'],
      endTime : res['endTime'],
      pic: this.operation === 'detail' ? res['pic'][0] : res['pic'],
      periodType: res['periodType'],
      store: res['store'],
      level: ['__ALL__'],
      canGift: res['canGift'],
      giftMax: res['extParams']['giftMax']
    });
    // 核销周期的详情根据类型来显示的，给一定的时间间隔，否则时间显示不出来
    setTimeout(() => {
      if (res['periodType'] === 'FIXED'){
        this.couponRuleForm.patchValue({
          PeriodBeginTime: this.stringDataToUTC(res['extParams']['PeriodBeginTime']),
          PeriodEndTime: this.stringDataToUTC(res['extParams']['PeriodEndTime'])
        });
      } else if (res['periodType'] === 'AFTERNOW') {
        this.couponRuleForm.patchValue({
          Second: res['extParams']['Second']
        });
      }
      if (res['type'] === 'PARKING'){ // 停车券-停车时长
        this.couponRuleForm.patchValue({
          parkingTime: res['extParams']['parkingTime']
        });
      }
    });
    if (this.operation === 'detail' && res['pic'][0]){
      this.uploadFile.previewImgStatus = true;
      this.uploadFile.umgUploadSuccessId = res['pic'][0];
      this.couponRuleForm.disable();
      this.canEdit = true;
    } else if (this.operation === 'create' && res['pic']){
      this.uploadFile.previewImgStatus = true;
      this.uploadFile.umgUploadSuccessId = res['pic'];
    }
    this.getStoreType(res['store']);
  }

  // 将字符串时间格式转化为UTC
  stringDataToUTC(value){
    if (value !== '' && value !== null) {
      const d = value as string;
      const y = d.substring(0, 4),
          m = d.substring(4, 6),
          day = d.substring(6, 8),
          hh = d.substring(8, 10),
          mm = d.substring(10, 12),
          ss = d.substring(12, 14);
      const date = y + '.' + m + '.' + day + ' ' + hh + ':' + mm + ':' + ss;
      return new Date(date).toISOString();
    }
  }

  saveProject() {
    if (this.couponRuleForm.value['periodType'] === 'FIXED') {
      if (!this.couponRuleForm.value['PeriodBeginTime']){
        this.snackBar.open('请选择核销周期-开始时间！');
        return;
      }
      if (!this.couponRuleForm.value['PeriodEndTime']){
        this.snackBar.open('请选择核销周期-结束时间！');
        return;
      }
      this.couponRuleForm.get('extParams').setValue({
        'PeriodBeginTime': this.datePipe.transform(this.couponRuleForm.value['PeriodBeginTime'], 'yyyyMMddHHmmss'),
        'PeriodEndTime': this.datePipe.transform(this.couponRuleForm.value['PeriodEndTime'], 'yyyyMMddHHmmss'),
      });
    } else if (this.couponRuleForm.value['periodType'] === 'AFTERNOW') {
      if (!this.couponRuleForm.value['Second']){
        this.snackBar.open('核销周期-秒数不能为空！');
        return;
      }
      this.couponRuleForm.get('extParams').setValue({
        'Second': Number(this.couponRuleForm.value['Second'])
      });
    } else {
      this.couponRuleForm.get('extParams').setValue({});
    }
    if (this.couponRuleForm.value['type'] === 'PARKING'){
      if (!this.couponRuleForm.value['parkingTime']){
        this.snackBar.open('停车时长不能为空！');
        return;
      }
      this.extParams = this.couponRuleForm.get('extParams').value;
      // @ts-ignore
      this.extParams['parkingTime'] = Number(this.couponRuleForm.value['parkingTime']);
      // @ts-ignore
      this.extParams['giftMax'] = Number(this.couponRuleForm.value['giftMax']);
      this.couponRuleForm.get('extParams').setValue(this.extParams);
    } else {
      this.extParams = this.couponRuleForm.get('extParams').value;
      // @ts-ignore
      this.extParams['giftMax'] = Number(this.couponRuleForm.value['giftMax']);
      this.couponRuleForm.get('extParams').setValue(this.extParams);
    }
    if (this.operation === 'create') {
      this.extParams = this.couponRuleForm.get('extParams').value;
      // @ts-ignore
      this.extParams['quantity'] = Number(this.couponRuleForm.value['defaultBatchAmount']);
      this.couponRuleForm.get('extParams').setValue(this.extParams);
    }
    if (this.couponRuleForm.valid){
      if (this.couponRuleForm.value['pic'] === ''){
        this.snackBar.open('活动图片未上传！', '✖');
        return;
      }
      if (this.couponRuleForm.value['store'] === '' || this.couponRuleForm.value['store'] === undefined || this.couponRuleForm.value['store'].length === 0){
        this.snackBar.open('请选择商户限制！', '✖');
        return;
      }
      const data = {
        'beginTime': this.couponRuleForm.value['beginTime'],
        'type': this.couponRuleForm.value['type'],
        'endTime': this.couponRuleForm.value['endTime'],
        'level': ['__ALL__'],
        'store': this.couponRuleForm.value['store'],
        'name': this.couponRuleForm.value['name'],
        'number': 'string',
        'periodType': this.couponRuleForm.value['periodType'],
        'extParams': this.couponRuleForm.value['extParams'],
        'pic': [this.couponRuleForm.value['pic']],
        'value': this.couponRuleForm.value['value'],
        'price': this.couponRuleForm.value['price'],
        'threshold': this.couponRuleForm.value['threshold'],
        'ruleText': this.couponRuleForm.value['ruleText'],
        'canGift': this.couponRuleForm.value['canGift'],
      };
      data['beginTime'] = new Date(data['beginTime']).toISOString();
      data['endTime'] = new Date(data['endTime']).toISOString();
      this.snackBar.open('待开发！', '✖');
      return;
      this.canSave = false;
      if (this.operation === 'create'){
        data['autoCreateBatch'] = true;
        this.couponManageService.toCreateCouponRule(data).subscribe(res => {
          this.snackBar.open('新增成功！', '✖');
          this.canSave = true;
          this.router.navigate(['apps/couponRule']);
        }, error => {
          this.canSave = true;
        });
      } else if (this.operation === 'edit'){
        this.couponManageService.toUpdateCouponRuleDetailById(this.couponRuleForm.get('id')['value'], data).subscribe(res => {
          // 券规则状态改变则调用状态更新接口
          if (this.couponRuleForm.value['enabled'] !== this.enabledInit){
            const data1 = {
              'enabled': this.couponRuleForm.value['enabled']
            };
            this.couponManageService.toUpdateCouponStatus(this.couponRuleForm.get('id')['value'], data1).subscribe(ref => {
              this.snackBar.open('修改成功！', '✖');
              this.canSave = true;
              this.router.navigate(['apps/couponRule']);
            }, error => {
              this.canSave = true;
            });
          } else {
            this.snackBar.open('修改成功！', '✖');
            this.canSave = true;
            this.router.navigate(['apps/couponRule']);
          }
        }, error => {
          this.canSave = true;
        });
      }
    } else {
      this.snackBar.open('还有未填项与校验不通过项！！！', '✖');
      this.couponRuleForm.markAllAsTouched();
    }
  }

  editProject() {
    this.operation = 'edit';
    // 注意，必须先enable()后disable()，否则原先赋值的会undefied
    this.couponRuleForm.enable();
    this.couponRuleForm.get('id').disable();
    this.couponRuleForm.get('getTotal').disable();
    this.couponRuleForm.get('getEveryDay').disable();
    this.couponRuleForm.get('isReturn').disable();
    this.couponRuleForm.get('defaultBatchAmount').disable();
    this.canEdit = false;
  }

  copyProject() {
    const data = this.couponRuleForm.getRawValue();
    sessionStorage.setItem('couponRule', JSON.stringify(data));
    this.router.navigate(['apps/couponRule/create']);
  }

  goBack() {
    if (this.operation !== 'detail' && this.operation !== 'create') {
      this.operation = 'detail';
      this.getDetailInfo();
    } else {
      this.router.navigate(['apps/couponRule']);
    }
  }

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

  onSourceDate1(e, endTime, startTime, p) {
    if (p === 'startTime') {
      e.setHours(23);
      e.setMinutes(59);
      e.setSeconds(59);
    }
    'startTime' === p ? endTime.picker.set('minDate', e) : startTime.picker.set('maxDate', e);
  }

  onEditorCreatedPri(editor) {
    this.utils.onEditorCreated(editor, this.couponRuleForm.get('useText'));
  }

  /******会员限制******/
  openLevelLimitList(template){
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {

    });
  }

  /******活动图片******/
  // 打开上传文件选项框
  openUploadImgDiloag(uploadImgDloag) {
    if (!this.dialog.getDialogById('uploadImageDialog_')) {
      this.uploadFile.uploadStatus = false;
      this.uploadFile.finishStatus = true;
      this.uploadFile.fileData = null;
      this.uploadFile.imgName = '';
      this.dialog.open(uploadImgDloag, {
        id: 'uploadImageDialog_',
        width: '500px',
        height: '245px',
        position: {top: '200px'},
        hasBackdrop: true ,
      });
    }
  }

  // 打开预览的文件框
  openPreviewDilog(previewImgDloag) {
    if (this.uploadFile.umgUploadSuccessId) {
      this.uploadFile.imgPreLoading = true;
      if (!this.dialog.getDialogById('previewImageDialog_')) {
        this.dialog.open(previewImgDloag, {
          id: 'previewImageDialog_',
          width: '690px',
          height: '300px',
          position: {top: '200px'},
          hasBackdrop: true ,
        });
      }
      // this.couponManageService.previewFile(this.uploadFile.umgUploadSuccessId).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      //   const fileReader = new FileReader();
      //   fileReader.readAsDataURL(res);
      //   fileReader.onloadend = (res1) => {
      //     const result = res1.target['result'];
      //     this.uploadFile.imgSrc = this.sanitizer.bypassSecurityTrustUrl(result);
      //     this.uploadFile.imgPreLoading = false;
      //   };
      // });
      this.uploadFile.imgPreLoading = false;
      this.snackBar.open('上传接口待开发!', '✖');
    }
  }

  // 上传券文件 选择并展示路径
  couponImgUpload(event) {
    const oneM = 1024 * 1024;
    const file = event.target.files[0];
    if (file.size > oneM) {
      this.snackBar.open('上传文件大小不能超过1M', '✖');
      return;
    }
    this.uploadFile.fileData = new FormData();
    this.uploadFile.imgName = file.name;
    this.uploadFile.fileData.append('files', file);
  }

  // 上传文件
  onUploadImg() {
    if (!this.uploadFile.fileData) {
      this.snackBar.open('请选择一个文件', '✖');
    } else {
      this.uploadFile.uploading = true;
      this.couponManageService.uploadFile(this.uploadFile.fileData).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
        if (res.type === 1) {
          this.uploadFile.progressLoad = (res.loaded / res.total) * 100;  // 上传长度
        }
        if (res.status === 200) {
          this.uploadFile.previewImgStatus = true;
          this.uploadFile.progressLoad = 100;
          this.uploadFile.uploading = false;
          this.uploadFile.uploadStatus = true;
          this.uploadFile.finishStatus = false;
          this.uploadFile.umgUploadSuccessId = res['body'];
          this.couponRuleForm.get('pic').setValue(res['body']);
        }
      });
    }
  }

  /******商户限制******/
  getStoreType(data?){
    this.couponManageService.multiSearchStoreLists(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
      console.log('res：', res);
      this.storeSourceLength = res['content'].length;
      this.storeSource = [];
      this.storeShow = [];
      if (res['content']) {
        if (data && data[0] === '__ALL__') {
          this.storeSource = res['content'];
          this.storeShow.push('__ALL__');
        } else {
          res['content'].forEach(item => {
            if (data && data.includes(item.storeId + '')){
              this.storeSource.push(item);
              this.storeShow.push(item['storeName']);
            }
          });
        }
      }
    });
  }

  openStoreSelect(template){
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res){
        if (this.storeSource.length === this.storeSourceLength && sessionStorage.getItem('isSystemSuperAdmin') === 'true'){
          this.couponRuleForm.get('store').setValue(['__ALL__']);
          this.storeShow.push('__ALL__');
        } else {
          const carTypeNameList = [];
          this.storeShow = [];
          this.storeSource.forEach(item => {
            carTypeNameList.push(item['storeId']);
            this.storeShow.push(item['storeName']);
          });
          this.couponRuleForm.get('store').setValue(carTypeNameList);
        }
      }
    });
  }

  onSelectStoreType(event) {
    this.storeSource = event;
  }

  toGetSendCheckStoreInfo(data) {
    if (data.flag) {
      this.storeSourceLength = data.count;
      this.storeSource = data.body;
      // this.storeShow = ['__ALL__'];
      // this.couponRuleForm.get('store').setValue(['__ALL__']);
      // 非系统超级管理员点击选择所有时保存的是所有数据(不分页）
      if (sessionStorage.getItem('isSystemSuperAdmin') === 'true'){
        this.storeShow = ['__ALL__'];
        this.couponRuleForm.get('store').setValue(['__ALL__']);
      } else {
        const carTypeNameList = [];
        this.storeShow = [];
        this.storeSource.forEach(item => {
          carTypeNameList.push(item['storeId']);
          this.storeShow.push(item['storeName']);
        });
        this.couponRuleForm.get('store').setValue(carTypeNameList);
      }
    } else {
      this.storeSource = [];
      this.storeShow = [];
      this.couponRuleForm.get('store').setValue([]);
    }
    this.dialog.closeAll();
  }

  // 预览事件
  openPreData(PreDetailTe, data, flag) {
    this.previewData = '';
    if (flag === 'level'){
      this.previewData = '默认对所有会员开放，没有限制';
    } else if (flag === 'store') {
      if (this.couponRuleForm.value['store'][0] === '__ALL__'){
        this.previewData = '默认对所有商户开放，没有限制';
      } else {
        this.previewData = this.storeSource.map(item => item['storeName']).join().replace(/,/g, '\n\n');
      }
    }
    if (!this.dialog.getDialogById('PreDetailTeClass')) {
      this.dialog.open(PreDetailTe, {id: 'PreDetailTeClass', width: '600px', height: '550px', hasBackdrop: true});
    }
  }

  onNumberInput1(event) {
    if (!this.utils.isNumber(event.target.value)) {
      event.target.value = event.target.value.replace(/\D/g, '');
    } else {
      if (Number(event.target.value) <= 1) {
        event.target.value = 1;
      }
    }
    this.couponRuleForm.get('parkingTime').setValue(event.target.value);
  }

  onGiftMaxInput(event) {
    if (!this.utils.isNumber(event.target.value)) {
      event.target.value = event.target.value.replace(/\D/g, '');
    } else {
      if (Number(event.target.value) <= 1) {
        event.target.value = 1;
      }
    }
    this.couponRuleForm.get('giftMax').setValue(event.target.value);
  }
}


export class UploadFile{
  previewImgStatus = false; // 图片预览的状态
  progressLoad: number;  // 上传长度
  imgName: string; // 图片名称
  uploading = false; // 是否在上传 在上传则显示进度条
  fileData: any; // 图片数据
  uploadStatus = false; // 还未上传完成标识
  finishStatus = true; // 上传完成标识
  imgSrc = null; // 预览图片路径
  imgPreLoading = false; // 加载条
  umgUploadSuccessId: string; // 图片上传成功返回id
}
