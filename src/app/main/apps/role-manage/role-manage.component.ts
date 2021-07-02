import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {RoleManageService} from './role-manage.service';

@Component({
    selector: 'app-role-manage',
    templateUrl: './role-manage.component.html',
    styleUrls: ['./role-manage.component.scss']
})
export class RoleManageComponent implements OnInit, OnDestroy {
    /** 浮动模式选择标签*/
    @Input()
    selectedRows = [];
    @Input()
    overPanel = false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    checkbox = false;
    @Input()
    createButton = false;

    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private roleService: RoleManageService,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService
    ) {
    }

    ngOnInit() {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    getColumns() {
        this.columns = [
            {name: 'name', translate: '角色名称', value: ''},
            {name: 'description', translate: '角色说明', value: ''},
            {name: 'createdBy', translate: '创建人', value: ''},
            {name: 'createdDate', translate: '创建时间', value: ''},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.roleService.getRoleList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.status === 200) {
                this.rows = res.body;
                this.page.count = Number(res.headers.get('X-Total-Count'));
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                if (!this.overPanel) {
                    this.createButton = true;
                }
                this.notify.onResponse.emit();
                this.loading.hide();
            }
        });
    }

    onDataSelect(data) {
        this.dataSelect.emit(data);
    }

    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.roleService.getRoleList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.status === 200) {
                this.rows = res.body;
                this.page.count = Number(res.headers.get('X-Total-Count'));
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                if (!this.overPanel) {
                    this.createButton = true;
                }
                this.notify.onResponse.emit();
                this.loading.hide();
            }
        });

    }

    onPage(event) {
        this.page.page = event.page;
        this.onSearch();
    }

    onSort(event) {
        this.page.sort = event;
        this.onSearch();
    }

    getDetail(event) {
        this.router.navigate(['apps/roleManage/edit/' + event.id]);
    }

    create() {
        this.router.navigate(['apps/roleManage/create']).then();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
