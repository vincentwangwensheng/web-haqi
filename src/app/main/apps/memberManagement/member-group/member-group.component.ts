import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MemberLevelService} from '../../../../services/memberLevelService/member-level.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {InjectConfirmDialogComponent} from '../../../../components/inject-confirm-dialog/inject-confirm-dialog.component';

@Component({
  selector: 'app-member-group',
  templateUrl: './member-group.component.html',
  styleUrls: ['./member-group.component.scss']
})
export class MemberGroupComponent implements OnInit, OnDestroy {
  // 列表数据
  private _unsubscribeAll: Subject<any> = new Subject();
  columns = [];
  page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  rows = [];
  detailMenu = []; // 详情操作菜单
  currentProject = '';
  @Input()
  overPanel = false;
  @Input()
  checkbox = false;
  @Input()
  selectedRows = [];

  @Input()
  createButton = true;
  constructor(private memberLevelService: MemberLevelService,
              private snackBar: MatSnackBar,
              private translate: TranslateService,
              private router: Router,
              private loading: FuseProgressBarService,
              private dateTransform: NewDateTransformPipe,
              private notify: NotifyAsynService,
              public dialog: MatDialog
  ) {
      this.currentProject = localStorage.getItem('currentProject');
  }

  ngOnInit() {
    this.getColumns();
    this.getDetailMenu();
    this.initSearch();
  }

  /** 详情操作菜单*/
  getDetailMenu() {
    this.detailMenu = [
      {
        translate: '详情', icon: 'edit', fn: (event) => { this.getDetail(event); }
      },
      {
        translate: '删除', icon: 'delete', fn: (event) => { this.deleteMemberGroup(event); }
      },
      {
        translate: '导出', icon: 'vertical_align_bottom', fn: (event) => { this.exportMemberGroup(event); }
      }

      ];
  }

  // 获取表头和显示key
  getColumns() {
    this.columns = [
      {name: 'storeId', translate: 'MallId', type: '', value: '', sort: true},
      {name: 'storeName', translate: '商场名称', type: '', value: '', sort: true},
      {name: 'id', translate: '分群ID', type: '', value: '', sort: true},
      {name: 'categoryName', translate: '分群名称', type: 'input', value: '', sort: true},
      {name: 'categoryDescribe', translate: '分群描述', type: '', value: '', sort: true},
      {name: 'categoryMemberNumber', translate: '人数', type: '', value: '', sort: true},
      {name: 'categoryStatus', translate: '状态', type: '', value: '', sort: true},
      {name: 'lastModifiedDate', translate: '修改时间', type: '', value: '', sort: true},
      {name: 'lastModifiedBy', translate: '修改人', type: '', value: '', sort: true}
    ];
  }

  // 初始化列表数据
  initSearch(multiSearch?) {
    this.loading.show();
    this.memberLevelService.searchMemberGroupList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
      if (res_json) {
        this.rows = [];
        this.rows = res_json['body'];
        this.rows.forEach(item => {
            if (item['categoryStatus'] === 'NORMAL') {
              item['categoryStatus'] = '正常';
            } else if (item['categoryStatus'] === 'FROZEN'){
              item['categoryStatus'] = '冻结';
            }
        });
        this.page.count = res_json['headers'].get('X-Total-Count');
        this.notify.onResponse.emit();
        if (this.rows.length === 0) {
          this.snackBar.open(this.translate.instant('未查询到数据'), '✖');
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
        multiSearch.push(column);
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
    this.page.sort = event;
    this.onSearch();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // 新建常旅客分群
  createBrand() {
    this.loading.show();
    this.dialog.closeAll();
    this.router.navigate(['/apps/memberGroup/memberGroupAdd']).then(() => {
      this.loading.hide();
    });
  }

  // 常旅客分群编辑
  getDetail(event) {
    this.loading.show();
    this.dialog.closeAll();
    this.router.navigate(['/apps/memberGroup/memberGroupEdit'], {queryParams: {id: event['id']}}).then(() => {
      this.loading.hide();
    });
  }

  // 常旅客分群编辑
  deleteMemberGroup(event) {
    this.loading.show();
    this.memberLevelService.toDeleteMemberCategory(event['id']).pipe(takeUntil(this._unsubscribeAll)).subscribe(res_json => {
      this.snackBar.open(this.translate.instant('删除成功'), '✖');
      this.initSearch();
      this.loading.hide();
    }, error => {
      this.loading.hide();
    }, () => {
      this.loading.hide();
    });
  }

  // 会员分群导出
  exportMemberGroup(event) {
    this.dialog.open(InjectConfirmDialogComponent, {
      width: '500px', data: {
        title: '导出：',
        content: '导出分群名称为“' + event.categoryName + '”的会员群体信息',
        cancelButton: true
      }
    }).afterClosed().subscribe(r => {
      if (r) {
        this.downloadTemplate(event.id);
      }
    });
  }


  // 下载模板
  downloadTemplate(id){
    this.memberLevelService.toGetGroupMembers(id).subscribe(reg => {
      if (reg.body.type === 'application/json') { // 如果返回的是错误json消息
        const reader = new FileReader();
        let result = '';
        reader.readAsText(reg.body, 'utf-8');
        reader.onloadend = (ev: ProgressEvent) => { // fileReader读取文件需要时间 默认代码不会等待
          result = ev.currentTarget['result'];
          if (result) {
            const resMessage = JSON.parse(result);
            this.snackBar.open('下载模板:' + resMessage['header'].errorMsg);
          }
        };
      } else {
        this.downloadFileLink(reg.body);
      }
    });
  }

  downloadFileLink(data, fileName?: string) {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('target', '_self');
    link.setAttribute('downLoad', '会员数据.csv');
    link.click();
    window.URL.revokeObjectURL(url); // 手动释放url对象
  }



}
