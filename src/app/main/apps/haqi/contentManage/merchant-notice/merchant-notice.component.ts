import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {DatePipe} from '@angular/common';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {ContentManageService} from '../content-manage.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-merchant-notice',
  templateUrl: './merchant-notice.component.html',
  styleUrls: ['./merchant-notice.component.scss']
})
export class MerchantNoticeComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  filter = [{name: 'enabled', value: true}];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  basicForm: FormGroup;
  isCreate = false;
  eventDetail: any;
  config = {
    enableTime: true,
    time_24hr: true,
    enableSeconds: true,
    defaultHour: '0',
    defaultMinute: '0',
    defaultSeconds: '0'
  };

  // 选择商场
  mallSource = null;
  // 选择商户
  storeSource = [];
  storeShow = [];
  previewData: any;  // 预览

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private dialog: MatDialog,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private datePipe: DatePipe,
      private newDateTransformPipe: NewDateTransformPipe,
      private contentManage: ContentManageService
  ) {
    this.basicForm = new FormGroup({
      title: new FormControl('', Validators.required),
      content: new FormControl('', Validators.required),
      time: new FormControl('', Validators.required),
      isAll: new FormControl(false),
      mallId: new FormControl(''),
      mallName: new FormControl(''),
      storeId: new FormControl([]),
      informType: new FormControl('ACTIVITY'),
    });
  }

  ngOnInit(): void {
    this.getColumns();
    // 通过接口获取表头数据
    this.initSearch(null);
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'title', translate: '公告标题', value: ''},
      {name: 'content', translate: '公告内容', value: ''},
      {name: 'time', translate: '发布时间', value: ''},
      {name: 'mallId', translate: '商场编号', value: ''},
      {name: 'mallName', translate: '商场名称', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.contentManage.informsList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        }
        this.rows.forEach(item => {
          if (item['mallId'] === '__ALL__')  {
            item['mallId'] = '全部';
            item['mallName'] = '全部';
          }
        });
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

  createData(openDialog) {
    this.isCreate = true;
    this.basicForm.patchValue({
      title: '',
      content: '',
      time: '',
      isAll: false,
      mallId: '',
      mallName: '',
      storeId: '',
      informType: 'ACTIVITY',
    });
    this.basicForm.get('title').enable();
    this.storeShow = [];
    this.storeSource = [];
    this.dialog.open(openDialog, {id: 'frozenTips', width: '700px', disableClose: false}).afterOpened().subscribe(ref => {});
  }

  getDetail(event, openDialog) {
    this.isCreate = false;
    this.basicForm.patchValue({
      title: '',
      content: '',
      time: '',
      isAll: false,
      mallId: '',
      mallName: '',
      storeId: '',
      informType: 'ACTIVITY',
    });
    this.storeShow = [];
    this.storeSource = [];
    this.eventDetail = event;
    this.dialog.open(openDialog, {id: 'frozenTips', width: '700px', disableClose: false}).afterOpened().subscribe(ref => {});
    setTimeout(() => {
      this.basicForm.patchValue({
        title: this.eventDetail['title'],
        content: this.eventDetail['content'],
        time: this.eventDetail['time'],
        isAll: this.eventDetail['isAll'],
        informType: this.eventDetail['informType']
      });
      this.basicForm.get('title').disable();
      if (!this.eventDetail['isAll']){
        // 获取商场名称
        this.contentManage.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null,
            [{name: 'mallId', value: this.eventDetail['mallId']}]).subscribe(res => {
          if (res['content'].length !== 0){
            this.basicForm.get('mallName').setValue(res['content'][0]['mallName']);
            this.basicForm.patchValue({
              mallId: this.eventDetail['mallId'],
              storeId: this.eventDetail['storeId']
            });
          }
        });
        // 获取商户名称
        this.contentManage.multiSearchStoreLists(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null,
            [{name: 'mallId', value: this.eventDetail['mallId']}]).subscribe(res => {
          this.storeSource = [];
          this.storeShow = [];
          if (res['content']) {
            res['content'].forEach(item => {
              if (this.eventDetail['storeId'] && this.eventDetail['storeId'].includes(item.storeId + '')){
                this.storeSource.push(item);
                this.storeShow.push(item['storeName']);
              }
            });
          }
        });
      } else {
        this.basicForm.patchValue({
          mallId: '',
          storeId: ''
        });
        this.basicForm.get('mallName').disable();
      }
    }, 200);
  }

  toSureDo(){
    if (!this.basicForm.value['isAll']){
      this.basicForm.get('mallName').setValidators(Validators.required);
      this.basicForm.markAllAsTouched();
      if (this.basicForm.get('storeId').value.length === 0){
        this.snackBar.open('请添加通知商户');
        return;
      }
    } else {
      this.basicForm.get('mallName').setValidators(null);
    }
    this.basicForm.markAllAsTouched();
    if (this.isCreate){
      if (this.basicForm.valid){
        const data = {
          'content': this.basicForm.value['content'],
          'createdBy': '',
          'createdDate': '',
          'enabled': true,
          // "id": 0,
          'lastModifiedBy': '',
          'lastModifiedDate': '',
          'time': new Date(this.basicForm.value['time']).toISOString(),
          'title': this.basicForm.value['title'],
          'isAll': this.basicForm.value['isAll'],
          'informType': this.basicForm.value['informType'],
          'mallId': this.basicForm.value['mallId'],
          'storeId': this.basicForm.value['storeId']
        };
        this.contentManage.addInforms(data).subscribe(res => {
          this.snackBar.open('新建成功！');
          this.basicForm.reset();
          this.initSearch(null);
          this.dialog.closeAll();
        });
      }
    } else {
      if (this.basicForm.valid){
        const data = {
          'content': this.basicForm.value['content'],
          'createdBy': '',
          'createdDate': '',
          'enabled': true,
          'id': this.eventDetail['id'],
          'lastModifiedBy': '',
          'lastModifiedDate': '',
          'time': new Date(this.basicForm.value['time']).toISOString(),
          'title': this.eventDetail['title'],
          'isAll': this.basicForm.value['isAll'],
          'informType': this.basicForm.value['informType'],
          'mallId': this.basicForm.value['mallId'],
          'storeId': this.basicForm.value['isAll'] ? [] : this.basicForm.value['storeId']
        };
        this.contentManage.updateInforms(data).subscribe(res => {
          this.snackBar.open('更新成功！');
          this.basicForm.reset();
          this.initSearch(null);
          this.dialog.closeAll();
        });
      }
    }
  }

  getIsAll() {
    if (this.basicForm.value['isAll']){
      this.storeShow = [];
      this.storeSource = [];
      this.basicForm.patchValue({
        mallName: '',
        mallId: '',
        storeId: []
      });
      this.basicForm.get('mallName').disable();
    } else {
      this.basicForm.get('mallName').enable();
    }
  }

  /***** 选择商场 ****/
  selectMall(template) {
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res && this.mallSource) {
        this.basicForm.patchValue({
          mallId: this.mallSource['mallId'],
          mallName: this.mallSource['mallName']
        });
        this.storeShow = [];
        this.storeSource = [];
        this.basicForm.patchValue({
          storeId: []
        });
      }
    });
  }

  onSelectMallType(event) {
    this.mallSource = event;
  }

  /***** 选择商户 *****/
  openStoreSelect(template){
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res){
        const carTypeNameList = [];
        this.storeShow = [];
        this.storeSource.forEach(item => {
          carTypeNameList.push(item['storeId']);
          this.storeShow.push(item['storeName']);
        });
        this.basicForm.get('storeId').setValue(carTypeNameList);
      }
    });
  }

  onSelectStoreType(event) {
    this.storeSource = event;
  }

  // 预览事件
  openPreData(PreDetailTe) {
    this.previewData = '';
    this.previewData = this.storeSource.map(item => item['storeName']).join().replace(/,/g, '\n\n');
    if (!this.dialog.getDialogById('PreDetailTeClass')) {
      this.dialog.open(PreDetailTe, {id: 'PreDetailTeClass', width: '600px', height: '550px', hasBackdrop: true});
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
