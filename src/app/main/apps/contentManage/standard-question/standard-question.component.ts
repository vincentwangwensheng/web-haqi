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
  selector: 'app-standard-question',
  templateUrl: './standard-question.component.html',
  styleUrls: ['./standard-question.component.scss']
})
export class StandardQuestionComponent implements OnInit, OnDestroy {
  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  filter = [{name: 'enabled', value: true}];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  basicFormAdd: FormGroup;
  basicForm: FormGroup;
  isCreate = false;
  eventDetail: any;

  // 选择商场
  mallSource = null;

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
    this.basicFormAdd = new FormGroup({
      mallId:  new FormControl(''),
      mallName:  new FormControl('', Validators.required),
      question: new FormControl('', Validators.required)
    });
    this.basicForm = new FormGroup({
      mallId:  new FormControl(''),
      mallName:  new FormControl('', Validators.required),
      question: new FormControl('', Validators.required),
      answer: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.getColumns();
    // 通过接口获取表头数据
    this.initSearch(null);
  }

  selectMall(template) {
    this.dialog.open(template, {id: 'tagTemplate', width: '80%'}).afterClosed().subscribe(res => {
      if (res && this.mallSource) {
        this.basicFormAdd.patchValue({
          mallId: this.mallSource['mallId'],
          mallName: this.mallSource['mallName']
        });
      }
    });
  }

  onSelectMallType(event) {
    this.mallSource = event;
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: '问题ID', value: ''},
      {name: 'question', translate: '问题', value: '', type: 'input'},
      {name: 'answer', translate: '回复', value: ''},
      {name: 'mallId', translate: '商场编号', value: ''},
      {name: 'mallName', translate: '商场名称', value: ''},
      {name: 'lastModifiedBy', translate: '操作人', value: ''},
      {name: 'lastModifiedDate', translate: '操作时间', value: ''}
    ];
  }

  // 初始化列表数据
  initSearch(search) {
    this.loading.show();
    this.contentManage.questionsList(this.page.page, this.page.size, this.page.sort , search, this.filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res.body;
        this.page.count = res.headers.get('x-total-count');
        if (this.rows.length === 0) {
          this.snackBar.open('未查询到数据', '✖');
        } else {
          this.rows.forEach(item => {
            // if (item['feedreplyStore']){
            //   item['replyContent'] = item['feedreplyStore']['content'];
            // }
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

  createData(openDialog) {
    this.isCreate = true;
    this.basicForm.get('question').setValue('');
    this.dialog.open(openDialog, {id: 'frozenTips', width: '450px', disableClose: false}).afterOpened().subscribe(ref => {});
  }

  getDetail(event, openDialog) {
    this.basicForm.patchValue({
      mallId: '',
      answer: '',
      question: ''
    });
    this.isCreate = false;
    this.eventDetail = event;
    this.dialog.open(openDialog, {id: 'frozenTips', width: '450px', disableClose: false}).afterOpened().subscribe(ref => {});
    setTimeout(() => {
      this.basicForm.get('answer').setValue(this.eventDetail['answer']);
      this.basicForm.get('question').setValue(this.eventDetail['question']);
      // this.basicForm.get('question').disable();
    }, 100);
    this.contentManage.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, [{name: 'mallId', value: this.eventDetail['mallId']}]).subscribe(res => {
      if (res['content'].length !== 0){
        this.basicForm.get('mallName').setValue(res['content'][0]['mallName']);
        this.basicForm.get('mallName').disable();
      }
    });
  }

  toSureDo(){
    if (this.isCreate){
      this.basicFormAdd.markAllAsTouched();
      if (this.basicFormAdd.valid){
        const data = {
          'answer': '',
          'createdBy': '',
          'createdDate': '',
          'enabled': true,
          // 'id': 0,
          'lastModifiedBy': '',
          'lastModifiedDate': '',
          'mallId': this.basicFormAdd.value['mallId'],
          'question': this.basicFormAdd.value['question']
        };
        this.contentManage.addQuestions(data).subscribe(res => {
          this.snackBar.open('新建成功！');
          this.basicForm.reset();
          this.basicFormAdd.reset();
          this.initSearch(null);
          this.dialog.closeAll();
        });
      }
    } else {
      this.basicForm.markAllAsTouched();
      if (this.basicForm.valid){
        const data = {
          'answer': this.basicForm.value['answer'],
          'createdBy': '',
          'createdDate': '',
          'enabled': true,
          'id': this.eventDetail['id'],
          'lastModifiedBy': '',
          'lastModifiedDate': '',
          'mallId': this.eventDetail['mallId'],
          'question': this.basicForm.value['question'],
        };
        this.contentManage.updateQuestions(data).subscribe(res => {
          this.snackBar.open('更新成功！');
          this.basicForm.reset();
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
