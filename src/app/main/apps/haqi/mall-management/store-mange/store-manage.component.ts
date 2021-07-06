import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {StoreManageService} from './store.manage.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../../@fuse/components/progress-bar/progress-bar.service';
import {TerminalService} from '../../../../../services/terminalService/terminal.service';
import {NotifyAsynService} from '../../../../../services/notify-asyn.service';

@Component({
    selector: 'app-store-manage',
    templateUrl: './store-manage.component.html',
    styleUrls: ['./store-manage.component.scss']
})


export class StoreManageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();

    @Input()
    selectedRows = [];
    @Input()
    checkbox = false;
    @Input()
    overPanel = false;
    @Input()
    createButton = true;
    @Input()
    singleSelect = false;
    @Input()
    selectedRow = null;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    selectedFiled = 'id';

    @Input()
    hasHeader = true;

    @Input()
    mallID = '';

    rows = [];
    @Input()
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    businessTypes: any[] = []; // 业态下拉选
    terminals: any[] = []; // 航站楼下拉选

    @Input()
    disabledRows = [];

    customButtons = []; // 自定义按钮组
    @Output()
    sendCheckInfo: EventEmitter<any> = new EventEmitter();
    @Input()
    hasCheckAllFlag = false;
    @Input()
    popUpYes = false;

    @Input()
    integralRuleFlag = false; // 积分规则
    @Input()
    integralRuleMallId = ''; // 积分规则-消费积分规则商场id

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private loading: FuseProgressBarService,
        private merchantService: StoreManageService,
        private notify: NotifyAsynService,
        private terminal: TerminalService
    ) {

    }

    ngOnInit(): void {
        this.getCustomButtons();
        this.getColumns();
        this.getBusinessType();
        this.getTerminals();
        setTimeout(() => {
            this.initSearch();
        });
    }

    /** 自定义按钮组*/
    getCustomButtons() {
        if (this.overPanel) {
            if (this.hasCheckAllFlag){
                this.customButtons = [
                    {
                        name: '选择所有', class: 'dark-yellow-button', fn: () => {
                            this.toShowDefaultCheck(true);
                        }
                    },
                    {
                        name: '取消所有', class: 'dark-yellow-button', fn: () => {
                            this.toShowDefaultCheck(false);
                        }
                    }
                ];
            }
        } else {
            this.customButtons = [
                {
                    name: '新建', iconFont: 'iconadd1', class: 'dark-yellow-button', fn: () => {
                        this.onCreate();
                    }
                }
            ];
        }
    }

    toShowDefaultCheck(event) {
        if (event) {
            this.merchantService.multiSearchStoreLists(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null , this.popUpYes).subscribe(res => {
                const count = res['content'].length;
                this.sendCheckInfo.emit({flag: event, body: res['content'], count: count});
            });
        } else {
            this.sendCheckInfo.emit({flag: event});
        }
    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }

    // 获取业态options
    getBusinessType() {
        this.terminal.getTypeList().pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                res.forEach(item => {
                    this.businessTypes.push(item.name);
                });
            }
        });
    }

    // 获取航站楼下拉选列表
    getTerminals() {
        this.terminal.searchTerminalList(0, 0x3f3f3f3f, 'id,asc').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                res.content.forEach(item => {
                    this.terminals.push({translate: item.terminalNo, value: item.terminalNo});
                });
            }
        });
    }

    // 获取表头和显示key  利用引用传递 异步更改options
    getColumns() {
        if (this.columns.length === 0) {
            if (this.integralRuleFlag) {
                this.columns = [
                    {name: 'storeNo', translate: 'airport.store.storeNo', value: ''},
                    {name: 'storeName', translate: 'airport.store.storeName', type: 'input', value: ''},
                    {name: 'mallId', translate: 'airport.store.mallId', value: ''},
                    {name: 'mallName', translate: '商场名称', value: ''},
                    {name: 'brandCN', translate: 'airport.store.brandCN', value: ''},
                    {name: 'brandEN', translate: 'airport.store.brandEN', value: ''},
                    {name: 'showName', translate: 'airport.store.showName', type: 'input', value: ''},
                    {
                        name: 'businessType',
                        translate: 'airport.store.businessType',
                        type: 'select',
                        options: this.businessTypes,
                        value: ''
                    },
                    {
                        name: 'enabled', translate: 'airport.store.enabled', type: 'select', options: [
                            {translate: 'normal', value: true},
                            {translate: 'frozen', value: false}
                        ], value: ''
                    },
                    {name: 'lastModifiedBy', translate: 'airport.store.lastModifiedBy', value: ''},
                    {name: 'lastModifiedDate', translate: 'airport.store.lastModifiedDate', value: ''}
                ];
            } else {
                this.columns = [
                    {name: 'storeNo', translate: 'airport.store.storeNo', value: ''},
                    {name: 'storeName', translate: 'airport.store.storeName', type: 'input', value: ''},
                    {name: 'mallId', translate: 'airport.store.mallId', value: ''},
                    {name: 'mallName', translate: '商场名称', type: 'input', value: ''},
                    {name: 'brandCN', translate: 'airport.store.brandCN', value: ''}, //
                    {name: 'brandEN', translate: 'airport.store.brandEN', value: ''},
                    {name: 'showName', translate: 'airport.store.showName', type: 'input', value: ''},
                    {
                        name: 'terminalName',
                        translate: '街区',
                        type: 'select',
                        options: this.terminals,
                        value: ''
                    },
                    // {name: 'floor', translate: 'airport.store.floor', value: ''},
                    // {name: 'areaNo', translate: 'airport.store.areaNo', value: ''},
                    {
                        name: 'businessType',
                        translate: 'airport.store.businessType',
                        type: 'select',
                        options: this.businessTypes,
                        value: ''
                    },
                    {
                        name: 'enabled', translate: 'airport.store.enabled', type: 'select', options: [
                            {translate: 'normal', value: true},
                            {translate: 'frozen', value: false}
                        ], value: ''
                    },
                    // {name: 'source', translate: 'airport.store.source', value: ''},
                    {name: 'lastModifiedBy', translate: 'airport.store.lastModifiedBy', value: ''},
                    {name: 'lastModifiedDate', translate: 'airport.store.lastModifiedDate', value: ''}
                ];
            }
        }
    }

    // 初始化列表数据
    initSearch() {
        this.loading.show();
        let filter = [];
        if (this.mallID) {
            filter = [{name: 'mallId', value: this.mallID}];
        }

        this.merchantService.multiSearchStoreLists(this.page.page, this.page.size, this.page.sort , null , filter, this.popUpYes).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                if (this.integralRuleFlag) {
                    res.content.forEach(item => {
                        if (item['mallId'] === this.integralRuleMallId) {
                            this.rows.push(item);
                        }
                    });
                    this.page.count = this.rows.length;
                } else {
                    this.rows = res.content;
                    this.page.count = res.totalElements;
                }
                this.getNotDisabledRows();
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

    getNotDisabledRows(){
        this.rows.forEach(row => {
           row.disabled = this.disabledRows.find(item => item.storeId === row.storeId);
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
                if (column.name === 'terminalName') { // 特殊情况处理 航站楼根据编号搜索 显示航站楼名称
                    multiSearch.push({name: 'terminalNo', value: column.value, type: column.type});
                } else {
                    multiSearch.push({name: column.name, value: column.value, type: column.type});
                }
            }
        });
        let filter = [];
        if (this.mallID) {
            filter = [{name: 'mallId', value: this.mallID}];
        }
        this.merchantService.multiSearchStoreLists(this.page.page, this.page.size, this.page.sort, multiSearch , filter, this.popUpYes).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.getNotDisabledRows();
                this.page.count = res.totalElements;
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

    onCreate() {
        this.loading.show();
        this.router.navigate(['apps/storeManage/create']).then(() => {
            this.loading.hide();
        });
    }

    // 详情跳转
    getDetail(event) {
        this.loading.show();
        this.router.navigate(['apps/storeManage/edit/' + event.id]).then(res => {
            this.loading.hide();
        });
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
