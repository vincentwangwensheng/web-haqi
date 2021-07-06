import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {StrategyService} from './strategy.service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-marketing-strategy',
    templateUrl: './market-strategy.component.html',
    styleUrls: ['./market-strategy.component.scss']
})
export class MarketStrategyComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    title = '';
    isViewPage = false;
    auditStatusSelect = [];

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private strategyService: StrategyService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService
    ) {
    }

    ngOnInit() {
        this.title = this.activatedRoute.snapshot.data['title'];
        if(this.title === '营销策略审核'){
            this.isViewPage = true;
            this.auditStatusSelect = [
                // {translate: '待审核', value: 'APPROVED'}
            ];
        } else {
            this.isViewPage = false;
            this.auditStatusSelect = [
                {translate: '已发布', value: 'REVIEWED'},
                {translate: '驳回', value: 'REJECT'}
            ];
        }
        this.getColumns();
        this.initSearch();
    }

    getColumns() {
        this.columns = [
            {name: 'id', translate: 'strategy.strategyNo', value: ''},
            {name: 'name', translate: 'strategy.name', type: 'input', value: ''},
            {name: 'description', translate: 'strategy.strategyDesc', value: ''},
            {name: 'type', translate: 'strategy.type', needTranslate: true, value: ''},
            {name: 'beginDate', translate: 'strategy.startTime', value: ''},
            {name: 'endDate', translate: 'strategy.endTime', value: ''},
            {
                name: 'enabled',
                translate: 'strategy.status',
                enabled: 'enabled',
                disabled: 'disabled',
                type: 'select',
                options: [
                    {translate: 'enabled', value: true},
                    {translate: 'disabled', value: false}
                ],
                value: ''
            },
            {
                name: 'auditStatus',
                translate: '策略状态',
                type: 'select',
                options: this.auditStatusSelect,
                value: ''
            },
            {name: 'createdBy', translate: 'strategy.creator', value: ''},
            {name: 'createdDate', translate: 'strategy.createTime', value: ''},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''}
        ];
    }

    initSearch() {
        this.loading.show();
        this.strategyService.getAllProcesses(this.page.page, this.page.size, this.page.sort, this.isViewPage).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.rows = res.body as any;
            this.page.count = Number(res.headers.get('X-Total-Count'));
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
            } else {
                this.rows.forEach(item => {
                    if (item['auditStatus'] === 'REVIEWED'){
                        item['auditStatus'] = '已发布';
                    } else if (item['auditStatus'] === 'REJECT'){
                        item['auditStatus'] = '驳回';
                    } else {
                        item['auditStatus'] = '待审核';
                    }
                });
            }
            this.notify.onResponse.emit();
            this.loading.hide();
        });
    }

    onSearch() {
        this.loading.show();
        const multiSearch = [];
        this.columns.forEach(column => {
            if (column.value !== '') {
                if (column.name === 'terminalName') { // 特殊情况处理 航站楼根据编号搜索 显示航站楼名称
                    multiSearch.push({name: 'terminalNo', value: column.value, type: column.type});
                } else {
                    multiSearch.push({name: column.name, value: column.value, type: column.type});
                }
            }
        });
        this.strategyService.getAllProcesses(this.page.page, this.page.size, this.page.sort, this.isViewPage, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            this.rows = res.body as any;
            this.page.count = Number(res.headers.get('X-Total-Count'));
            if (this.rows.length === 0) {
                this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
            } else {
                this.rows.forEach(item => {
                    if (item['auditStatus'] === 'REVIEWED'){
                        item['auditStatus'] = '已发布';
                    } else if (item['auditStatus'] === 'REJECT'){
                        item['auditStatus'] = '驳回';
                    } else {
                        item['auditStatus'] = '待审核';
                    }
                });
            }
            this.notify.onResponse.emit();
            this.loading.hide();
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
        this.router.navigate(['apps/strategy/edit'], {
            queryParams: {
                id: event.id,
                type: event.type,
                isViewPage: this.isViewPage,
                enabled: event.enabled,
                // beginDate: event.beginDate
            }
        });
    }

    create() {
        this.router.navigate(['apps/strategyCreate']).then();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
