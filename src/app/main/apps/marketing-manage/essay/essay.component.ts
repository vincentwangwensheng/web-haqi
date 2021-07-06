import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {StoreManageService} from '../../mall-management/store-mange/store.manage.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {PassengersManageService} from '../../../../services/passengersManageService/passengers-manage.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {ArticleService} from './article.service';

@Component({
  selector: 'app-essay',
  templateUrl: './essay.component.html',
  styleUrls: ['./essay.component.scss']
})
export class EssayComponent implements OnInit , OnDestroy{

  private _unsubscribeAll: Subject<any> = new Subject();
  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private merchantService: StoreManageService,
      private notify: NotifyAsynService,
      private passengersManageService: PassengersManageService,
      private newDateTransformPipe: NewDateTransformPipe,
      private articleService: ArticleService,
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
     this.initSearch();
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: 'marketingManage.tableHead.id',  value: ''},
      {name: 'articleTitle', translate: 'marketingManage.tableHead.name', type: 'input', value: ''},
      /* {name: 'beginTime', translate: 'marketingManage.tableHead.beginTime', type: 'date', value: ''},
       {name: 'endTime', translate: 'marketingManage.tableHead.endTime', type: 'date', value: ''},*/
      {name: 'validity', translate: '有效期',  value: ''},
      {name: 'articleIsEnginePush', translate: 'marketingManage.tableHead.enginePush',  value: ''},
      {name: 'articleStatus', translate: 'marketingManage.tableHead.articleStatus', type: 'select', options: [
          {translate: 'marketingManage.tableHead.AUDIT', value: 'AUDIT'},  // 待审核
          {translate: 'marketingManage.tableHead.AUDITED', value: 'AUDITED'},  // 已审核
          {translate: 'marketingManage.tableHead.ONLINE', value: 'ONLINE'},   // 已上线
          {translate: 'marketingManage.tableHead.REJECTED', value: 'REJECTED'},   // 已驳回
              {translate: 'marketingManage.tableHead.EXPIRED', value: 'EXPIRED'},   // 已过期
        ], value: ''},
      {name: 'lastModifiedBy', translate: 'marketingManage.tableHead.lastModifiedBy', value: ''},
      {name: 'lastModifiedDate', translate: 'marketingManage.tableHead.lastModifiedDate', value: ''},
    ];
  }

  // 初始化列表数据
  initSearch() {

    this.loading.show();
    this.articleService.searchArticleList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.transToIndate(res['body']);
        this.rows = res['body'];
        this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
        }
      }
      this.loading.hide();
      this.notify.onResponse.emit();
    }, error => {

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
    this.loading.show();
    const multiSearch = [];
    this.columns.forEach(column => {
      if (column.value !== '') {
        multiSearch.push({name: column.name, value: column.value, type: column.type});
      }
    });
    this.articleService.searchArticleList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body'];
        this.transToIndate(res['body']);
        this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
        }
      }
      this.loading.hide();
      this.notify.onResponse.emit();
    }, error => {

    }, () => {
      this.loading.hide();
    });
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

  // 详情跳转
  getDetail(event) {
    this.loading.show();
    this.router.navigate(['/apps/marketingManageComponent/essay/add/' + event.id]).then(res => {
      this.loading.hide();
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
  // 跳转套新增页面
  createActivity(){
    this.loading.show();
    this.router.navigate(['/apps/marketingManageComponent/essay/add']).then(res => {
      this.loading.hide();
    });
  }
  // 将开始时间与结束时间变为有效期
  transToIndate(param){
    for (let i = 0; i < param.length; i++) { //
      if ( param[i]['articleStartTime'] && param[i]['articleEndTime']){
        param[i]['validity'] = this.newDateTransformPipe.transform(param[i]['articleStartTime']) + '-' + this.newDateTransformPipe.transform(param[i]['articleEndTime']);
      } else {
        param[i]['validity'] = '';
      }
      if (param[i]['articleStatus'] === 'ONLINE') {
          param[i]['articleStatus'] = this.translate.instant('marketingManage.tableHead.ONLINE'); //  '已在线'; //
      } else if (param[i]['articleStatus'] === 'REJECTED'){
          param[i]['articleStatus'] = this.translate.instant('marketingManage.tableHead.REJECTED');  //  '已驳回';
      } else if (param[i]['articleStatus'] === 'EXPIRED'){
          param[i]['articleStatus'] = this.translate.instant('marketingManage.tableHead.EXPIRED'); // '已过期';
      } else if (param[i]['articleStatus'] === 'AUDIT'){
          param[i]['articleStatus'] = this.translate.instant('marketingManage.tableHead.AUDIT'); // '未审核';
      } else {
          param[i]['articleStatus'] = this.translate.instant('marketingManage.tableHead.AUDITED'); // '已审核';
      }
    }
  }

}
