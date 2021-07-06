import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog,  MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {TerminalManageService} from './terminal-manage.service';
import {Utils} from '../../../../../services/utils';

@Component({
    selector: 'app-terminal-manage',
    templateUrl: './terminal-manage.component.html',
    styleUrls: ['./terminal-manage.component.scss']
})
export class TerminalManageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    // 商场选择

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private terminalService: TerminalManageService,
        private router: Router,
        private utils: Utils,
        private dialog: MatDialog,
        private activatedRoute: ActivatedRoute,
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
            {name: 'terminalId', translate: 'terminal.terminalId', value: ''},
            {name: 'terminalName', translate: 'terminal.terminalName', value: '', type: 'input'},
            {name: 'blocId', translate: 'terminal.blocId', value: ''},
            {name: 'blocName', translate: 'terminal.blocName', value: '', type: 'input'},
            {name: 'mallId', translate: 'terminal.mallId', value: ''},
            {name: 'mallName', translate: 'terminal.mallName', value: '', type: 'input'},
            {name: 'enabled', translate: 'mall.status', type: 'select',
                options: [
                    {translate: 'normal', value: true},
                    {translate: 'frozen', value: false}
                ],
                value: ''
            },
            {name: 'address', translate: 'terminal.address', value: ''},
            {name: 'desc', translate: 'terminal.desc', value: ''},
            {name: 'lastModifiedBy', translate: 'terminal.lastModifiedBy', value: ''},
            {name: 'lastModifiedDate', translate: 'terminal.lastModifiedDate', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.terminalService.getTerminalList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.page.count = res.totalElements;
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.notify.onResponse.emit();
                this.loading.hide();
            }
        });
    }

    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                multiSearch.push({name: column.name, value: column.value, type: column.type});
            }
        });
        this.terminalService.getTerminalList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.page.count = res.totalElements;
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
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
        this.router.navigate(['apps/terminalManage/edit/' + event.id]).then();
    }

    create() {
        this.router.navigate(['apps/terminalManage/create']).then();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
