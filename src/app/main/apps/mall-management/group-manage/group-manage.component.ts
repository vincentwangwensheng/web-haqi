import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {GroupManageService} from './group-manage.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-group-manage',
    templateUrl: './group-manage.component.html',
    styleUrls: ['./group-manage.component.scss']
})
export class GroupManageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    editTitle = ['新建集团', '集团信息详情', '编辑集团信息'];
    editStatus = 0;
    groupForm = new FormGroup({
        id: new FormControl(''),
        blocId: new FormControl(''),
        blocName: new FormControl('', Validators.required),
        enabled: new FormControl(true),
        desc: new FormControl('')
    });

    dialogRef: MatDialogRef<any>;
    @Input()
    createFlag = true;
    @Input()
    checkbox: false;
    @Input()
    overPanel: false;
    @Input()
    selectedRows = [];
    @Input()
    singleSelect: false;
    @Output()
    dataSelect: EventEmitter<any> = new EventEmitter();
    @Input()
    selectedRow = null;
    @Input()
    popUpYes = false;

    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private groupService: GroupManageService,
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

    getColumns() {
        this.columns = [
            {name: 'blocId', translate: 'group.blocId', value: ''},
            {name: 'blocName', translate: 'group.blocName', type: 'input', value: ''},
            {name: 'desc', translate: 'group.desc', value: ''},
            {
                name: 'enabled',
                translate: 'group.status',
                type: 'select',
                options: [
                    {translate: 'normal', value: true},
                    {translate: 'frozen', value: false}
                ],
                value: ''
            },
            {name: 'lastModifiedBy', translate: 'group.lastModifiedBy', value: ''},
            {name: 'lastModifiedDate', translate: 'group.lastModifiedDate', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.groupService.getBlocList(this.page.page, this.page.size, this.page.sort , null , this.popUpYes).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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
        this.groupService.getBlocList(this.page.page, this.page.size, this.page.sort, multiSearch, this.popUpYes).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
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

    saveGroup() {
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
            this.groupService.createBloc(data).subscribe(r => {
                this.loading.hide();
                this.onSearch();
                this.groupForm.reset();
            });
        });
    }

    getDetail(event, editGroup) {
        this.loading.show();
        this.groupService.getBlocById(event.id).subscribe(res => {
            this.editStatus = 1;
            this.groupForm.patchValue(res);
            this.groupForm.disable();
            this.loading.hide();
            this.openDialog(editGroup).then(data => {
                this.groupService.updateBloc(data).subscribe(r => {
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
        this.groupForm.get('blocId').disable();

    }

    onSelect(event) {
        this.dataSelect.emit(event);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
