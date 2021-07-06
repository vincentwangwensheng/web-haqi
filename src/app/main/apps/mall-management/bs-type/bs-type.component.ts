import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {BsTypeService} from './bs-type.service';

@Component({
    selector: 'app-bs-type',
    templateUrl: './bs-type.component.html',
    styleUrls: ['./bs-type.component.scss']
})
export class BsTypeComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    editTitle = ['新建业态', '业态详情', '编辑业态'];
    editStatus = 0;
    groupForm = new FormGroup({
        id: new FormControl(''),
        name: new FormControl('', Validators.required),
        color: new FormControl('#aaaaaa', Validators.required),
        enabled: new FormControl(true)
    });
    color: any;

    dialogRef: MatDialogRef<any>;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private bsService: BsTypeService,
        private router: Router,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        this.getColumns();
        setTimeout(() => {
            this.initSearch();
        });
    }

    onColorChange(event) {
        console.log(event);
        this.groupForm.get('color').setValue(event, {emitEvent: false});
    }

    getColumns() {
        this.columns = [
            {name: 'id', translate: 'ID', value: ''},
            {name: 'name', translate: '业态名称', type: 'input', value: ''},
            {name: 'color', translate: '颜色', value: '', type: 'color'},
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
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.bsService.searchTypes(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
        this.bsService.searchTypes(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
                        const data = this.groupForm.getRawValue();
                        resolve(data);
                    } else if (res === false || this.editStatus !== 0) {
                        this.groupForm.reset();
                    }
                }, reject);
            }
        });
    }

    save() {
        if (this.groupForm.valid) {
            this.dialogRef.close(true);
        } else {
            this.groupForm.markAllAsTouched();
        }
    }

    create(addGroup) {
        this.editStatus = 0;
        this.groupForm.enable();
        this.groupForm.get('enabled').setValue(true);
        this.openDialog(addGroup).then(data => {
            this.bsService.postType(data).subscribe(r => {
                this.loading.hide();
                this.onSearch();
                this.groupForm.reset();
            });
        });
    }

    getDetail(event, editGroup) {
        this.loading.show();
        this.bsService.getTypeById(event.id).subscribe(res => {
            this.editStatus = 1;
            this.groupForm.patchValue(res);
            this.groupForm.disable();
            this.loading.hide();
            this.openDialog(editGroup).then(data => {
                this.bsService.putType(data).subscribe(r => {
                    this.loading.hide();
                    this.groupForm.reset();
                    this.onSearch();
                });
            });
        });
    }

    showEdit() {
        this.editStatus = 2;
        this.groupForm.enable();
        this.groupForm.get('id').disable();

    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
