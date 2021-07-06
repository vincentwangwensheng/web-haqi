import {Component, OnDestroy, OnInit} from '@angular/core';
import {forkJoin, Observable, Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {DatePipe} from '@angular/common';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {CouponManageService} from '../../coupon-manage/coupon-manage.service';
import {takeUntil} from 'rxjs/operators';
import {ContentManageService} from '../content-manage.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-member-feedback',
  templateUrl: './member-feedback.component.html',
  styleUrls: ['./member-feedback.component.scss']
})
export class MemberFeedbackComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  filter = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  basicForm: FormGroup;
  eventDetail: any;
  hasReply = false;
  contentId = 0;

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
    this.initSearch(null);
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'ID', value: ''},
      {name: 'mobile', translate: '手机号', value: '', type: 'input'},
      {name: 'nickName', translate: '会员昵称', value: ''},
      {name: 'content', translate: '反馈内容', value: ''},
      {name: 'replyContent', translate: '回复内容', value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.contentManage.feedbacksList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else {
          this.rows.forEach(item => {
            if (item['feedreply']){
              item['replyContent'] = item['feedreply']['content'];
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
    this.eventDetail = event;
    this.hasReply = false;
    this.dialog.open(openDialog, {id: 'frozenTips', width: '450px', disableClose: false}).afterOpened().subscribe(ref => {});
    this.basicForm.get('content').setValue(event.content);
    this.basicForm.get('content').disable();
    if (this.eventDetail['feedreply']){
      this.hasReply = true;
      this.contentId = this.eventDetail['feedreply']['id'];
      this.basicForm.get('replyContent').setValue(this.eventDetail['feedreply']['content']);
    }
  }

  toSureDo(){
    if (this.basicForm.valid){
      if (!this.hasReply){
        const data = {
          'content': this.basicForm.value['content'],
          'feedbackTime': '',
          'feedreply': {
            'content': this.basicForm.value['replyContent'],
            'createdBy': '',
            'createdDate': '',
            // 'id': 0,
            'lastModifiedBy': '',
            'lastModifiedDate': ''
          },
          'id': this.eventDetail['id'],
          'mobile': this.eventDetail['mobile'],
          'nickName': this.eventDetail['nickName'],
        };
        this.contentManage.updateFeedbacks(data).subscribe(res => {
          this.basicForm.reset();
          this.snackBar.open('更新成功！');
          this.initSearch(null);
          this.dialog.closeAll();
        });
      } else {
        const data = {
          'id': this.contentId,
          'content': this.basicForm.value['replyContent']
        };
        this.contentManage.updateFeedbacksReplyed(data).subscribe(res => {
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
