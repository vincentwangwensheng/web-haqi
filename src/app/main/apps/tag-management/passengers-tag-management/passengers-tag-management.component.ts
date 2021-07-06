import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {StoreManageService} from '../../haqi/mall-management/store-mange/store.manage.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {PassengersTagService} from '../../../../services/passengersTagService/passengers-tag.service';

@Component({
    selector: 'app-passengers-tag-management',
    templateUrl: './passengers-tag-management.component.html',
    styleUrls: ['./passengers-tag-management.component.scss']
})
export class PassengersTagManagementComponent implements OnInit, OnDestroy {

    private _unsubscribeAll: Subject<any> = new Subject();
    @Input()
    selectedRows = [];
    @Input()
    createButton = true;
    @Input()
    checkbox = false;
    @Input()
    overPanel = false;
    @Input()
    selectedRow = {};
    @Input()
    singleSelect = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    tlKey = '';

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private merchantService: StoreManageService,
        private notify: NotifyAsynService,
        private passengersTagService: PassengersTagService,
    ) {
        this.tlKey = 'TagManagement.PassengersTagManagement.' + localStorage.getItem('currentProject') + '.';

    }

    ngOnInit(): void {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }


    // 获取表头和显示key
    getColumns() {
        this.columns = [
            {name: 'id', translate: 'TagManagement.PassengersTagManagement.id', value: ''},
            {name: 'name', translate: 'TagManagement.PassengersTagManagement.name', type: 'input', value: ''},
            {name: 'category', translate: 'TagManagement.PassengersTagManagement.category', value: ''},
            {
                name: 'subCategory', translate: 'TagManagement.PassengersTagManagement.subCategory', value: ''
            },
            {name: 'description', translate: 'TagManagement.PassengersTagManagement.description', value: ''},
            {
                name: 'enabled', translate: 'TagManagement.PassengersTagManagement.enabled', type: 'select', options: [
                    {translate: '正常', value: true},
                    {translate: '冻结', value: false},
                ], value: ''
            },
            {name: 'lastModifiedBy', translate: 'TagManagement.PassengersTagManagement.lastModifiedBy', value: ''},
            {
                name: 'lastModifiedDate', translate: 'TagManagement.PassengersTagManagement.lastModifiedDate', value: ''
            },
        ];
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        this.passengersTagService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
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
        this.passengersTagService.multiSearchMemberLists(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res['body']) {
                this.rows = res['body'];
                this.page.count = parseInt(res.headers.get('X-Total-Count'), 10);
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
        this.router.navigate(['/apps/PassengersTagManagement/PassengersTagDetail/' + event.id], {queryParams: {data: 'passengers'}}).then(() => {
            this.loading.hide();
        });
    }

    // 新增页面方法
    createActivity() {
        this.router.navigate(['/apps/passengersTagManagement/createPassengersTag']).then(() => {

        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
