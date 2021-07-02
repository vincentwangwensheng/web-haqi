import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {Subject} from 'rxjs';
import {Utils} from '../../../services/utils';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';
import {TableListComponent} from '../../../components/table-list/table-list.component';
import {ActivationService} from './activation.service';

@Component({
    selector: 'app-activation-code',
    templateUrl: './activation-code.component.html',
    styleUrls: ['./activation-code.component.scss'],
    animations: fuseAnimations
})
export class ActivationCodeComponent implements OnInit, OnDestroy {
    private _unsubscribeAll = new Subject();
    // 激活码
    rows = [];
    columns = [];
    page = {page: 0, size: 10, sort: 'lastModifiedDate,desc', count: 0};

    @ViewChild('createCode', {static: false})
    createTemplate: TemplateRef<any>;
    // 生成激活码
    createColumns = [];
    selectedRow = null;
    selectedCount = 1; // 激活码数量
    dialogRef: MatDialogRef<any, any>;

    functions = [
        {value: '核销小程序', translate: 'activation.reissue'}
    ];
    applyApp = this.functions[0].value;

    @ViewChild('frozeConfirm', {static: true})
    frozeConfirm: TemplateRef<any>;
    @ViewChild('thawConfirm', {static: true})
    thawConfirm: TemplateRef<any>;

    constructor(
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private utils: Utils,
        private translate: TranslateService,
        private activationService: ActivationService,
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
            {name: 'code', translate: 'activation.list.code', value: '', sort: true, type: 'input'},
            {name: 'mallId', translate: 'activation.list.mallId', value: '', sort: true},
            {name: 'storeNo', translate: 'activation.list.storeId', value: '', sort: true},
            {name: 'storeName', translate: 'activation.list.storeName', type: 'input', value: '', sort: true},
            {name: 'createdDate', translate: 'activation.list.createdDate', value: '', type: 'date', sort: true},
            {name: 'activateTime', translate: 'activation.list.activateTime', value: '', sort: true},
            {name: 'openId', translate: 'activation.list.openId', value: '', sort: true},
            {name: 'nickName', translate: 'activation.list.nickName', value: '', sort: true},
            {name: 'appletApp', translate: 'activation.list.appletApp', value: '', sort: true},
            {
                name: 'status',
                translate: 'activation.list.status',
                type: 'select',
                options: [{translate: 'yes', value: true}, {translate: 'no', value: false}],
                value: '',
                sort: true
            },
            {
                name: 'enabled',
                translate: 'activation.list.enabled',
                type: 'select',
                options: [{translate: 'normal', value: true}, {translate: 'frozen', value: false}],
                value: '',
                sort: true
            },
            {name: 'lastModifiedBy', translate: 'activation.list.lastModifiedBy', value: '', sort: true},
        ];
        this.createColumns = [
            {name: 'mallId', translate: 'activation.list.mallId', value: '', sort: true},
            {name: 'storeNo', translate: 'activation.list.storeId', value: '', sort: true},
            {name: 'storeName', translate: 'activation.list.storeName', type: 'input', value: '', sort: true},
        ];
    }

    initSearch() {
        this.loading.show();
        this.activationService.getCodeList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.page.count = res.totalElements;
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
            this.notify.onResponse.emit();
        });

    }

    onSearch() {
        this.loading.show();
        const multiSearch = this.utils.transformColumns(this.columns);
        this.activationService.getCodeList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.content;
                this.page.count = res.totalElements;
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
            }
            this.loading.hide();
            this.notify.onResponse.emit();
        });
    }

    // 生成激活码
    onCustomClick() {
        this.dialogRef = this.dialog.open(this.createTemplate, {id: 'createCode', width: '90%'});
    }

    // 生成激活码
    ensure(tableList: TableListComponent) {
        if (!this.selectedRow) {
            this.snackBar.open(this.translate.instant('activation.notSelected'), '!');
        } else {
            const codeVm = {
                mallId: this.selectedRow.mallId,
                applyApp: this.applyApp,
                quantity: this.selectedCount,
                storeNo: this.selectedRow.storeNo
            };
            this.activationService.createCode(codeVm).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                const message = this.translate.instant('activation.message') + '“' + this.selectedRow.storeName + '” ' + this.translate.instant('activation.generate') + ' “' + this.selectedCount + this.translate.instant('activation.actCode') + '”';
                this.dialogRef.close(true);
                this.clearCode();
                tableList.clearAll();
                this.snackBar.open(message, '✔');
            });
        }
    }

    clearCode() {
        this.selectedRow = null;
        this.selectedCount = 1;
        this.applyApp = this.functions[0].value;
    }

    cancel() {
        this.clearCode();
        this.dialogRef.close(false);
    }

    // 冻结解冻激活码
    onDetail(event) {
        if (event.enabled) {
            const codeVm = {code: event.code, enabled: false};
            this.dialog.open(this.frozeConfirm).afterClosed().subscribe(res => {
                if (res) {
                    this.loading.show();
                    this.activationService.changeStatus(codeVm).subscribe(r => {
                        this.onSearch();
                    });
                }
            });
        } else {
            const codeVm = {code: event.code, enabled: true};
            this.dialog.open(this.thawConfirm).afterClosed().subscribe(res => {
                if (res) {
                    this.loading.show();
                    this.activationService.changeStatus(codeVm).subscribe(r => {
                        this.onSearch();
                    });
                }
            });
        }
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

    /**生成激活码*/
    onSelect(event) {
        this.selectedRow = event;
    }


    // 顶部条件查询调用组件的方法
    headerSearch(merchantsData) {
        merchantsData.onSearch();
    }

    headerSearchInput(event, merchantsData) {
        if (event.target.value === '') { // 回退清空
            this.createColumns.forEach(column => {
                if (column.value) {
                    column.value = '';
                }
            });
            merchantsData.onSearch();
        } else {
            this.createColumns.find(column => column.name === 'storeName').value = event.target.value;
        }
    }

    onNumberInput(event) {
        if (!this.utils.isNumber(event.target.value)) {
            event.target.value = event.target.value.replace(/\D/g, '');
        } else {
            if (Number(event.target.value) >= 10) {
                event.target.value = 10;
            } else if (Number(event.target.value) <= 1) {
                event.target.value = 1;
            }
        }
        this.selectedCount = event.target.value;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
