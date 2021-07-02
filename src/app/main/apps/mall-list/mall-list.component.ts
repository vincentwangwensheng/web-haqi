import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {StoreManageService} from '../store-mange/store.manage.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {MallService} from '../../../services/mallService/mall-service.service';

@Component({
    selector: 'app-mall-list',
    templateUrl: './mall-list.component.html',
    styleUrls: ['./mall-list.component.scss']
})
export class MallListComponent implements OnInit, OnDestroy {


    private _unsubscribeAll: Subject<any> = new Subject();
    @Input()
    selectedRows = [];
    @Input()
    checkbox = false;
    @Input()
    overPanel = false;
    @Input()
    createFlag = true;
    @Input()
    singleSelect = false;
    @Input()
    selectedRow = null;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();

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
        private mallService: MallService,
    ) {

    }

    ngOnInit(): void {
        this.getColumns();
        setTimeout( () => {
            this.initSearch();
        });

    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }


    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'mallId', translate: '商场ID', value: ''},
            {name: 'mallName', translate: '商场名称', type: 'input', value: ''},
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();

        const  filter = [{name: 'enabled', value: true}];

        this.mallService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort , null ,  filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body']['content'];
                this.page.count = res['body']['numberOfElements'];
                // this.page.count = res['body'].length;
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
            this.loading.hide();
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
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        const  filter = [{name: 'enabled', value: true}];
        this.mallService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort, multiSearch , filter).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body']['content'];
                this.page.count = res['body']['numberOfElements'];
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
        }, error => {
            this.loading.hide();
        }, () => {
            this.loading.hide();
            this.notify.onResponse.emit();
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
    navigateDetail(event) {
        this.loading.show();
        this.router.navigate(['/apps/MarketingTagManagement/MarketingTagDetail/' + event.id]).then(() => {
            this.loading.hide();
        });
    }

    // 新增页面方法
    createActivity() {
        this.router.navigate(['/apps/MarketingTagManagement/MarketingTagAdd']).then(() => {

        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
