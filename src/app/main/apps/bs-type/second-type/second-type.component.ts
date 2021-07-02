import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {SecondTypeService} from './second-type.service';
import {Utils} from '../../../../services/utils';

@Component({
    selector: 'app-second-type',
    templateUrl: './second-type.component.html',
    styleUrls: ['./second-type.component.scss']
})
export class SecondTypeComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    editTitle = ['新建二级业态', '二级业态详情', '编辑二级业态'];
    editStatus = 0;
    formGroup = new FormGroup({
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
        enabled: new FormControl(true),
        businessTypeId: new FormControl('', Validators.required),
        businessTypeName: new FormControl('', Validators.required)
    });

    filterSelect: Observable<any>;
    selectSource: [];

    dialogRef: MatDialogRef<any>;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private secondService: SecondTypeService,
        private router: Router,
        private utils: Utils,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getColumns();
        this.initAutoSelect();
        setTimeout(() => {
            this.initSearch();
        });
    }

    // 初始化自动补全选择框
    initAutoSelect() {
        this.secondService.searchBusinessTypes(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            if (res) {
                this.selectSource = res.body;
                this.filterSelect = this.utils.getFilterOptions(this.formGroup.get('businessTypeName'), this.selectSource, 'name', 'color');
            }
        });
    }

    // 选中name补全id或者互选
    onSelectionChange(option, controlId, field) {
        this.formGroup.get(controlId).setValue(option[field], {emitEvent: false});
        this.filterSelect = this.utils.getFilterOptions(this.formGroup.get('businessTypeName'), this.selectSource, 'name', 'id');
    }

    getColumns() {
        this.columns = [
            {name: 'id', translate: 'ID', value: ''},
            {name: 'name', translate: '业态名称', type: 'input', value: ''},
            {
                name: 'enabled',
                translate: '状态',
                type: 'select',
                options: [
                    {translate: 'normal', value: true},
                    {translate: 'frozen', value: false}
                ],
                value: ''
            },
            {name: 'businessTypeId', translate: '一级业态ID', value: ''},
            {name: 'businessTypeName', translate: '一级业态名称', value: ''},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.secondService.searchTypes(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body;
                this.page.count = Number(res.headers.get('x-total-count'));
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
        this.secondService.searchTypes(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res) {
                this.rows = res.body;
                this.page.count = Number(res.headers.get('x-total-count'));
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

    openDialog(template) {
        return new Promise((resolve, reject) => {
            if (!this.dialog.getDialogById('editGroup')) {
                this.dialogRef = this.dialog.open(template, {id: 'editGroup', width: '500px'});
                this.dialogRef.afterClosed().subscribe(res => {
                    if (res) {
                        this.loading.show();
                        const data = this.formGroup.getRawValue();
                        resolve(data);
                    } else if (res === false || this.editStatus !== 0) {
                        this.formGroup.reset();
                    }
                }, reject);
            }
        });
    }

    save() {
        if (this.formGroup.valid) {
            this.dialogRef.close(true);
        } else {
            this.formGroup.markAllAsTouched();
        }
    }

    create(addGroup) {
        this.editStatus = 0;
        this.formGroup.enable();
        this.formGroup.get('enabled').setValue(true);
        this.openDialog(addGroup).then(data => {
            console.log(data);
            this.secondService.postType(data).subscribe(r => {
                this.loading.hide();
                this.onSearch();
                this.formGroup.reset();
            });
        });
    }

    // 根据id获取一级业态
    getBusinessTypeById(id) {
        return new Promise<any>(resolve => {
            this.secondService.getBsTypeById(id).subscribe(res => {
                resolve(res);
            }, error => resolve());
        });
    }

    getDetail(event, editGroup) {
        this.loading.show();
        this.secondService.getTypeById(event.id).subscribe(res => {
            this.getBusinessTypeById(res.businessTypeId).then(type => {
                this.editStatus = 1;
                res.businessTypeName = type ? type.name : '';
                this.formGroup.patchValue(res);
                this.formGroup.disable();
                this.loading.hide();
                this.openDialog(editGroup).then(data => {
                    this.secondService.putType(data).subscribe(r => {
                        this.loading.hide();
                        this.formGroup.reset();
                        this.onSearch();
                    });
                });
            });
        });
    }

    showEdit() {
        this.editStatus = 2;
        this.formGroup.enable();
        this.formGroup.get('id').disable();

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
