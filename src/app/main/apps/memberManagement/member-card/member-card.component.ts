import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {takeUntil} from 'rxjs/operators';
import {MemberLevelService} from '../../../../services/memberLevelService/member-level.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.scss']
})
export class MemberCardComponent implements OnInit, OnDestroy{

  private _unsubscribeAll: Subject<any> = new Subject();

    @Input()
    selectedRows = [];
    @Input()
    selectedFiled = 'id';
    @Input()
    createButton = true;
    @Input()
    checkbox = false;

    @Input()
    overPanel = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();



  rows = [];
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'levelMin'};

  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private notify: NotifyAsynService,
      private newDateTransformPipe: NewDateTransformPipe,
      private  memberLevelService: MemberLevelService
  ) {

  }

  ngOnInit(): void {
    this.getColumns();
    setTimeout( () => {
        this.initSearch();
    });

  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'id', translate: '会员卡编号',  value: ''},
      {name: 'levelName', translate: '会员卡名称', type: 'input', value: ''},
      {name: 'growthValue', translate: '成长值',  value: ''},
      {name: 'levelMin', translate: '说明',  value: ''},
      {name: 'lastModifiedBy', translate: '修改人', value: ''},
      {name: 'lastModifiedDate', translate: '修改时间', value: ''},
    ];
  }

    onSelect(event) {
        this.dataSelect.emit(event);
    }

  // 初始化列表数据
  initSearch() {
    this.loading.show();
    this.memberLevelService.searchMemberCardList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.changeResponseData(res['body']);
        this.rows = res['body'];
        console.log('this.rows:', this.rows);
        // this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);  拿不到X-Total-Count，直接给值吧
        this.page.count = 10;
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
    this.memberLevelService.searchMemberCardList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
      if (res['body']) {
        this.rows = res['body'];
        this.changeResponseData(res['body']);
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
    this.router.navigate(['/apps/memberCard/edit/' + event.id]).then(res => {
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
    this.router.navigate(['/apps/memberCard/add']).then(res => {
      this.loading.hide();
    });
  }
  // 将开始时间与结束时间变为有效期
  transToIndate(param){
    for (let i = 0; i < param.length; i++) {
      if ( param[i]['beginTime'] && param[i]['endTime']){
        param[i]['validity'] = this.newDateTransformPipe.transform(param[i]['beginTime']) + '-' + this.newDateTransformPipe.transform(param[i]['endTime']);
      } else {
        param[i]['validity'] = '';
      }
    }
  }

  changeResponseData(result){
    for (let i = 0; i < result.length; i++) {
      result[i]['growthValue'] = '成长值';
      result[i]['levelMin'] = '大于等于' + result[i]['levelMin'];
    }
  }

}
