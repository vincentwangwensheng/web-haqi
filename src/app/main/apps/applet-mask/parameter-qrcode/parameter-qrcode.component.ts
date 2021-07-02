import {Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {DatePipe} from '@angular/common';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {MessageSubscribeService} from '../message-subscribe/message-subscribe.service';
import QRCode from 'qrcode';
import {FileDownloadService} from '../../../../directives/file-download/file-download.service';
import {AppletMaskParameter} from '../appletMaskService/AppletMaskParameter';

@Component({
  selector: 'app-parameter-qrcode',
  templateUrl: './parameter-qrcode.component.html',
  styleUrls: ['./parameter-qrcode.component.scss']
})
export class ParameterQRCodeComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  filter = [{name: 'enabled', value: true}];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  basicForm: FormGroup;

  detailMenu = []; // 详情操作菜单
  // 选择商场
  mallSource = null;
  // 选择商户
  selectedStoreList = [];
  allMemberList = [];
  // 选择活动
  activitySource = null;
  @ViewChild('viewDialog', {static: true})
  viewDialog: TemplateRef<any>;
  qrSrc: any;
  qrName = '';

  typeList = [];

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private dialog: MatDialog,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private datePipe: DatePipe,
      private fileDownload: FileDownloadService,
      private newDateTransformPipe: NewDateTransformPipe,
      private messageSubscribeService: MessageSubscribeService
  ) {
    this.basicForm = new FormGroup({
      qrName:  new FormControl('', Validators.required),
      mallId:  new FormControl('', Validators.required),
      mallName:  new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      desc: new FormControl('', Validators.required),
      bindingActivity: new FormControl(''), // 活动id
      // bindingStore: new FormControl(''), // 店铺Id字符串
      bindingActivityName: new FormControl('') // 活动名称
    });
    this.basicForm.get('type').valueChanges.subscribe(res => {
      if (this.basicForm.get('type').value === '活动详情'){
        this.basicForm.get('bindingActivity').setValidators(Validators.required);
        this.basicForm.get('bindingActivityName').setValidators(Validators.required);
      } else {
        this.basicForm.get('bindingActivity').clearValidators();
        this.basicForm.get('bindingActivityName').clearValidators();
      }
    });
  }

  ngOnInit(): void {
    this.getColumns();
    this.getQRCodesTypes();
    this.getDetailMenu();
  }

  // 获取二维码类型
  getQRCodesTypes(){
    this.messageSubscribeService.getQRCodesTypes().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res) {
        // tslint:disable-next-line:forin
        for (const item in res) {
          this.typeList.push({translate: res[item], value: item});
        }
      }
    }, error => {

    }, () => {
      this.initSearch(null);
    });
  }

  /** 详情操作菜单*/
  getDetailMenu() {
    this.detailMenu = [
      {translate: '预览', icon: 'pageview', fn: (event) => { this.toViewQRCode(event['url'], event['qrName']); }},
      {translate: '下载', icon: 'cloud_download', fn: (event) => { this.toDownLoadQRCode(event['url'], event['qrName']); }}
    ];
  }

  generateQRCodeUrl(qrUrl){
    return new Promise((resolve, reject) => {
      if (qrUrl){
        const pos = qrUrl.indexOf('?');
        const scene = qrUrl.slice(pos + 1);
        const page = qrUrl.slice(0, pos);
        qrUrl = sessionStorage.getItem('baseUrl') + 'backend/api/wechat/createWxaCodeUnlimitBytes?scene=' + scene + '&page=' + page;
        resolve(qrUrl);
      } else {
        reject('给定的二维码地址不能为空！');
      }
    });
  }


  // 预览二维码
  toViewQRCode(qrUrl, qrName){
    this.generateQRCodeUrl(qrUrl).then(res => {
      this.qrSrc = res;
      this.qrName = qrName;
      this.dialog.open(this.viewDialog, {id: 'tagTemplate', width: '400px'}).afterClosed().subscribe(ref => {});
    }).catch(error => {
      this.snackBar.open(error);
    });
  }

  // 下载二维码
  toDownLoadQRCode(qrUrl, qrName){
    this.generateQRCodeUrl(qrUrl).then(res => {
      this.qrSrc = res;
      this.fileDownload.urlImageDownload(this.qrSrc, qrName);
    }).catch(error => {
      this.snackBar.open(error);
    });
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'qrName', translate: '二维码名称', value: ''},
      {name: 'type', translate: '类型', value: '', type: 'select', options: this.typeList},
      {name: 'mallId', translate: '商场名称', value: ''},
      {name: 'desc', translate: '说明', value: ''},
      {name: 'createdBy', translate: '创建人', value: ''},
      {name: 'createdDate', translate: '创建时间', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.messageSubscribeService.toGetQRCodesList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        }
      }
      this.rows.forEach(item => {
        for (let i = 0; i < this.typeList.length; i++) {
          if (this.typeList[i]['value'] === item['type']) {
            item['type'] = this.typeList[i]['translate'];
            break;
          }
        }
      });
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

  /********获取商场********/
  selectMall(template) {
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res && this.mallSource) {
        this.basicForm.patchValue({
          mallId: this.mallSource['mallId'],
          mallName: this.mallSource['mallName'],
        });
      }
    });
  }

  onSelectMallType(event) {
    this.mallSource = event;
  }

  /********获取商户********/
  openStoreList(storeTemplate: TemplateRef<any>) {
    this.dialog.open(storeTemplate, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res && this.selectedStoreList.length > 0) {
        this.allMemberList = this.selectedStoreList;
        this.basicForm.get('bindingStore').setValue(this.allMemberList.map(item => item['id']).join(','));
      }
    });
  }

  onStoreSelect(event){
    this.selectedStoreList = event;
  }

  deleteStore(index){
    this.allMemberList.splice(index, 1);
    this.selectedStoreList = this.allMemberList;
    this.basicForm.get('bindingStore').setValue(this.allMemberList.map(item => item['id']).join(','));
  }

  /********获取活动********/
  selectActivity(template) {
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res && this.activitySource) {
        this.basicForm.patchValue({
          bindingActivity: this.activitySource['id'],
          bindingActivityName: this.activitySource['name']
        });
      }
    });
  }

  onSelectActivity(event) {
    this.activitySource = event;
  }

  /************ 新增带参二维码 *********/
  createData(openDialog) {
    this.basicForm.patchValue({
      mallId:  '',
      mallName:  '',
      type: '店铺二维码',
      bindingActivity: '',
      bindingActivityName: '',
      bindingStore: ''
    });
    this.mallSource = null;
    this.selectedStoreList = [];
    this.allMemberList = [];
    this.activitySource = null;
    this.dialog.open(openDialog, {id: 'frozenTips', width: '450px', disableClose: true}).afterOpened().subscribe(ref => {});
  }

  toSureDo(){
    this.basicForm.markAllAsTouched();
    if (this.basicForm.valid){
      if (this.basicForm.get('type').value === '店铺二维码' && this.basicForm.get('bindingStore').value === ''){
        this.snackBar.open('请选择绑定店铺');
        return;
      } else {
        const data = {
          'mallId': this.basicForm.value['mallId'],
          'qrName': this.basicForm.value['qrName'],
          'type': this.basicForm.value['type'],
          'bindingActivity': this.basicForm.value['bindingActivity'],
          'bindingStore': this.basicForm.value['bindingStore'],
          'desc': this.basicForm.value['desc'],
          // 'id': 0,
          'url': '',
          'enabled': true,
          'lastModifiedBy': '',
          'lastModifiedDate': '',
          'createdBy': '',
          'createdDate': ''
        };
        this.messageSubscribeService.toAddQRCodesList(data).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
          this.snackBar.open('新建成功！');
          this.basicForm.reset();
          this.initSearch(null);
          this.dialog.closeAll();
        });
      }
    }
  }
}
