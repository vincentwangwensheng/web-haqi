import {
    Component,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    OnInit, Optional,
    Output,
    ViewChild
} from '@angular/core';
import {Column, CustomButton} from '../table-list.component';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';

export const TABLE_SERVICE = new InjectionToken('tableService');
export const TABLE_FUNCTION = new InjectionToken('tableFunction');


@Component({
    selector: 'app-super-table-list',
    templateUrl: './super-table-list.component.html',
    styleUrls: ['./super-table-list.component.scss']
})
export class SuperTableListComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    @Input()
    overPanel = false;
    @Input()
    stick = false;
    @Input()
    checkbox = false;
    @Input()
    singleSelect = false;
    @Input()
    resetSelect = true;
    @Input()
    noScrollPaging = false; // 去除鼠标滚动翻页
    // 列表名
    @Input() title = '';
    // 列表字段
    @Input() // 数据
    rows: any[] = [];
    @Input() // 选中的数据
    selectedRows: any[] = []; // checkbox mode
    @Input() //
    selectedRow: any; // singleSelect mode
    @Input() // 输入的比较变量
    selectedField = 'id';

    @Input() // 表头
    columns: Column[] = [];

    @Input()
    hasHeader = true; // 是否有头部搜索框
    @Input()
    hasClear = true; // 是否有刷新按钮

    @Input()
    page: any = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    @Input()
    customButtons: CustomButton[] = [];

    @Input()
    searchPermissions: string | string[];
    @Input()
    createButton = false; // 新建按钮
    @Input()
    createPermissions: string | string[];
    @Input()
    hasDetail = true; // 详情
    @Input()
    editPermissions: string | string[];
    @Input()
    detailMenu = []; // 详情菜单
    @Input()
    hasEnabled = false; // 冻结解冻操作行按钮
    @Input()
    detailText = ''; // 自定详情文本 比如编辑、查看等
    @Input()
    hasCopy = false;
    @Input()
    hasStatistics = false; // 统计
    @Input()
    initOpacity = false; // 透明渐变

    @Input()
    navigateUrl = ''; // 详情跳转路由

    @Input()
    createUrl = ''; // 新建跳转路由

    @Input()
    filter = [];

    @Input()
    directShow = false;

    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @ViewChild('tableList', {static: false})
    tableList: any;

    @Input()
    functionIndex = 0; // 调用的方法索引

    @Input()
    filterId: number; // 过滤id

    constructor(
        @Inject(TABLE_SERVICE) private tableService: any,
        @Optional() @Inject(TABLE_FUNCTION) private tableFunctions: string[],
        private loading: FuseProgressBarService,
        private router: Router,
        private notify: NotifyAsynService,
        private translate: TranslateService,
        private snackBar: MatSnackBar
    ) {
        if (!this.tableFunctions || (this.tableFunctions && this.tableFunctions.length === 0)) {
            this.tableFunctions = [];
            this.tableFunctions.push(Object.getOwnPropertyNames(Object.getPrototypeOf(this.tableService)).find(item => item.includes('search')));
        }
    }

    ngOnInit() {
        setTimeout(() => {
            this.initSearch();
        });
    }

    /**
     * 返回查询Observable
     */
    getSearchObservable(multiSearch?): Observable<any> {
        let searchObservable: Observable<any>;
        switch (this.tableService[this.tableFunctions[this.functionIndex]].length) {
            case 3: {
                searchObservable = this.tableService[this.tableFunctions[this.functionIndex]](this.page.page, this.page.size, this.page.sort);
                break;
            }
            case 4: {
                searchObservable = this.tableService[this.tableFunctions[this.functionIndex]](this.filterId, this.page.page, this.page.size, this.page.sort);
                break;
            }
            case 5: {
                searchObservable = this.tableService[this.tableFunctions[this.functionIndex]](this.page.page, this.page.size, this.page.sort, multiSearch, this.filter);
                break;
            }
        }
        return searchObservable;
    }

    initSearch() {
        this.loading.show();
        const searchObservable: Observable<any> = this.getSearchObservable();
        searchObservable.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.loading.hide();
                this.notify.onResponse.emit();
            }
        }, error => {
            this.notify.onResponse.emit();
        });

    }

    onSearch() {
        this.loading.show();
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push(column);
            }
        });
        const searchObservable: Observable<any> = this.getSearchObservable(multiSearch);
        searchObservable.pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.loading.hide();
                this.notify.onResponse.emit();
            }
        }, error => {
            this.notify.onResponse.emit();
        });

    }

    // 分页
    onPage(event) {
        this.page.page = event.page;
        this.onSearch();
    }


    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    onDataSelect(event) {
        this.dataSelect.emit(event);
    }

    onCreate() {
        this.loading.show();
        this.router.navigate([this.createUrl]).then(() => {
            this.loading.hide();
        });
    }

    navigateDetail(event) {
        this.loading.show();
        this.router.navigate([this.navigateUrl + '/' + event.id]).then(() => {
            this.loading.hide();
        });

    }

    // 调用计算列宽方法
    getColumnWidth() {
        this.tableList.getColumnWidth();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
