import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {TerminalService} from '../../../services/terminalService/terminal.service';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-business-type',
  templateUrl: './business-type.component.html',
  styleUrls: ['./business-type.component.scss']
})
export class BusinessTypeComponent implements OnInit , OnDestroy{
    private _unsubscribeAll: Subject<any> = new Subject();

    @Input()
    selectedRows = [];
    @Input()
    overPanel = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    selectedFiled = 'name';

    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
  constructor(
      private snackBar: MatSnackBar,
      private translate: TranslateService,
      private router: Router,
      private loading: FuseProgressBarService,
      private terminal: TerminalService,
      private notify: NotifyAsynService,
  ) { }

  ngOnInit() {
      this.getColumns();
      setTimeout( () => {
          this.initSearch();
      });
  }


    onSelect(event) {
        this.dataSelect.emit(event);
    }


    // 获取表头和显示key  利用引用传递 异步更改options
    getColumns() {
        this.columns = [
            {name: 'name', translate: 'BusinessType.name', value: 'input'},
            {name: 'color', translate: 'BusinessType.color', type: '', value: ''},
            {name: 'enabled', translate: 'BusinessType.enabled', value: ''},
            {name: 'createdBy', translate: 'BusinessType.createdBy', value: ''},
            {name: 'createdDate', translate: 'BusinessType.createdDate', type: '', value: ''},
            {name: 'lastModifiedBy', translate: 'BusinessType.lastModifiedBy', value: ''},
            {name: 'lastModifiedDate', translate: 'BusinessType.lastModifiedDate', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.terminal.getTypeListSearch(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body;
                this.page.count = res['headers'].get('X-Total-Count');
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit();
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
            multiSearch.push({name: column.name, value: column.value, type: column.type});
        });
        this.terminal.getTypeListSearch(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body;
                this.page.count = res['headers'].get('X-Total-Count');
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit();
        });
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
}
