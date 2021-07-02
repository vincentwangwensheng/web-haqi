import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {DatePipe} from '@angular/common';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {CouponManageService} from '../../coupon-manage/coupon-manage.service';
import {takeUntil} from 'rxjs/operators';
import {ContentManageService} from '../content-manage.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-merchant-feedback',
  templateUrl: './merchant-feedback.component.html',
  styleUrls: ['./merchant-feedback.component.scss']
})
export class MerchantFeedbackComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  filter = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  basicForm: FormGroup;
  id: 0;
  eventDetail: any;
  hasReply = false;
  contentId = 0;
  uploadFile = new UploadFile();
  imgShow = false;
  imageBaseUrl = '';

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
      content: new FormControl('', Validators.required),
      replyContent: new FormControl('', Validators.required)
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
      {name: 'storeId', translate: '商户ID', value: ''},
      {name: 'storeName', translate: '反馈商户', value: '', type: 'input'},
      {name: 'content', translate: '反馈内容', value: ''},
      {name: 'replyContent', translate: '回复内容', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.contentManage.feedbackStoresList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else {
          this.rows.forEach(item => {
            if (item['feedreplyStore']){
              item['replyContent'] = item['feedreplyStore']['content'];
            }
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

  getDetail(event, openDialog) {
    this.basicForm.patchValue({
      content: '',
      replyContent: ''
    });
    this.hasReply = false;
    this.eventDetail = event;
    this.imageBaseUrl = sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=' + event['fileId'];
    console.log('this.imageBaseUrl:', this.imageBaseUrl);
    this.dialog.open(openDialog, {id: 'frozenTips', width: '450px', disableClose: false}).afterOpened().subscribe(ref => {});
    this.basicForm.get('content').setValue(event.content);
    this.basicForm.get('content').disable();
    if (this.eventDetail['feedreplyStore']){
      this.hasReply = true;
      this.contentId = this.eventDetail['feedreplyStore']['id'];
      this.basicForm.get('replyContent').setValue(this.eventDetail['feedreplyStore']['content']);
    }
  }

  toSureDo(){
    if (this.basicForm.valid){
      if (!this.hasReply){
        const data = {
          'content': this.basicForm.value['content'],
          'feedbackTime': '',
          'feedreplyStore': {
            'content': this.basicForm.value['replyContent'],
            'createdBy': '',
            'createdDate': '',
            // 'id': 0,
            'lastModifiedBy': '',
            'lastModifiedDate': ''
          },
          'id': this.eventDetail['id'],
          'mallId': this.eventDetail['mallId'],
          'storeId': this.eventDetail['storeId'],
          'storeName': this.eventDetail['storeName']
        };
        this.contentManage.updateFeedbackStores(data).subscribe(res => {
          this.basicForm.reset();
          this.snackBar.open('更新成功！');
          this.initSearch(null);
          this.dialog.closeAll();
        });
      } else {
        const data = {
          'id': this.contentId,
          'content': this.basicForm.value['replyContent'],
        };
        this.contentManage.updateFeedbackStoresReplyed(data).subscribe(res => {
          this.basicForm.reset();
          this.snackBar.open('更新成功！');
          this.initSearch(null);
          this.dialog.closeAll();
        });
      }

    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
export class UploadFile {
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
