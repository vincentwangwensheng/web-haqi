import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {takeUntil} from 'rxjs/operators';
import {AccountManageService} from './account-manage.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ChangePasswordComponent} from '../../../components/change-password/change-password.component';
import {Md5} from 'md5-typescript';
import {LogoutService} from '../../../services/logout.service';
import {InjectConfirmDialogComponent} from '../../../components/inject-confirm-dialog/inject-confirm-dialog.component';
import {Utils} from '../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {CustomValidators} from '../../../services/CustomValidators';

@Component({
    selector: 'app-account-manage',
    templateUrl: './account-manage.component.html',
    styleUrls: ['./account-manage.component.scss']
})

export class AccountManageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    rows = [];
    columns = [];
    page = {page: 0, size: 10, count: 0, sort: 'lastModifiedDate,desc'};
    createButton = false;
    detailMenu = []; // 详情操作菜单


    /**账户操作相关*/
    editFlag = 0;
    detailId: any;
    titles = ['新建账户', '账户详情', '编辑账户'];
    onSaving = false;
    accountGroup: FormGroup;

    /** 账户类型*/
    blocControl = new FormControl('', Validators.required);
    blocIdControl = new FormControl('');
    blocSources = [];
    filterBlocs: Observable<any>;
    mallControl = new FormControl('', Validators.required);
    mallIdControl = new FormControl('');
    mallSources = [];
    filterMall: Observable<any>;
    terminalControl = new FormControl('', Validators.required);
    terminalIdControl = new FormControl('');
    terminalSources = [];
    filterTerminal: Observable<any>;
    storeControl = new FormControl('', Validators.required);
    storeIdControl = new FormControl('');
    storeSources = [];
    filterStore: Observable<any>;

    selectedRows = [];
    editDialogRef: any;
    usernameContent = ''; // 生成账户后的账户提示
    passwordContent = ''; // 生成账户后着重的密码提示

    @ViewChild('editTemplate', {static: true})
    editTemplate: TemplateRef<any>;

    /** 修改密码*/
    passwordForm: FormGroup;
    repeatPassword = new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.strongPasswordValidator, CustomValidators.passwordValidator, Validators.required]);
    oldType = {type: 'password'};
    newType = {type: 'password'};
    repeatType = {type: 'password'};

    // 重置密码
    pwInfo = {usernameContent: '', passwordContent: ''}; // 用户名密码提示
    isCurrent = false; // 是否是当前账户
    @ViewChild('pwTip', {static: false})
    pwTip: TemplateRef<any>;

    currentScope: any; // 当前账户类型 DEFAULT /BLOC /MALL / MERCHANT

    isSuperAdmin = false; // 是否超级管理员
    isBlocAdmin = false; // 是否是集团超级管理员


    constructor(
        private snackBar: MatSnackBar,
        private translate: TranslateService,
        private router: Router,
        private dialog: MatDialog,
        private utils: Utils,
        private logout: LogoutService,
        private accountService: AccountManageService,
        private loading: FuseProgressBarService,
        private notify: NotifyAsynService,
        private http: HttpClient
    ) {
        this.accountGroup = new FormGroup({
            username: new FormControl('', Validators.required),
            enabled: new FormControl(true),
            roles: new FormControl([]),
            scope: new FormControl('', Validators.required),
            scopeValue: new FormControl('')
        });

        this.passwordForm = new FormGroup({
            username: new FormControl({disabled: true, value: ''}),
            oldPassword: new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.passwordValidator, Validators.required]),
            newPassword: new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.strongPasswordValidator, CustomValidators.passwordValidator, Validators.required])
        });
    }

    ngOnInit() {
        this.getColumns();
        this.getBlocAutoSelect();
        this.getDetailMenu();
        setTimeout(() => {
            this.initSearch();
        });
        this.getCurrentUser();
        this.checkAdmin();
    }


    // 检查是否是超级管理员
    checkAdmin() {
        const auth = JSON.parse(sessionStorage.getItem('auth')).split(',');
        if (auth.includes('ROLE_SUPERADMIN')) {
            this.isSuperAdmin = true;
        } else if (auth.includes('ROLE_BLOC_SUPERADMIN')) {
            this.isBlocAdmin = true;

        }
    }

    // 获取当前用户信息
    getCurrentUser() {
        this.accountService.getAccountByUsername(sessionStorage.getItem('username')).subscribe(res => {
            console.log(res);
            if (res) {
                this.currentScope = res.scope;
            }
        });
    }

    // 集团自动补全选择
    getBlocAutoSelect() {
        this.accountService.getBlocList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
            if (res && res.content) {
                this.blocSources = res.content;
                this.filterBlocs = this.utils.getFilterOptions(this.blocControl, this.blocSources, 'blocName', 'blocId');
            }
        });
    }

    // 商场自动补全选择
    getMallAutoSelect(blocId) {
        const filter = [{name: 'blocId', value: blocId}];
        this.accountService.getMallList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
            if (res && res.content) {
                this.mallSources = res.content;
                this.filterMall = this.utils.getFilterOptions(this.mallControl, this.mallSources, 'mallName', 'mallId');
            }
        });
    }

    // 街区自动选择
    getTerminalAutoSelect(mallId) {
        const filter = [{name: 'mallId', value: mallId}];
        this.accountService.getTerminalList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
            if (res && res.content) {
                this.terminalSources = res.content;
                this.filterTerminal = this.utils.getFilterOptions(this.terminalControl, this.terminalSources, 'terminalName', 'terminalNo');
            }
        });
    }

    // 商户自动选择
    getStoreAutoSelect(terminalId) {
        const filter = [{name: 'terminalId', value: terminalId}];
        this.accountService.searchStores(0, 0x3f3f3f3f, 'lastModifiedDate,desc', null, filter).subscribe(res => {
            if (res && res.content) {
                this.storeSources = res.content;
                this.filterStore = this.utils.getFilterOptions(this.storeControl, this.storeSources, 'storeName', 'storeNo');
            }
        });
    }


    // 账号类型选择
    onSelectChange(event) {

        this.resetForm();
    }

    // 自动补全选择
    onSelectionChange(option, field) {
        switch (field) {
            case 'blocId': {
                this.getMallAutoSelect(option[field]);
                this.filterBlocs = this.utils.getFilterOptions(this.blocControl, this.blocSources, 'blocName', 'blocId');
                this.blocIdControl.setValue(option[field]);
                break;
            }
            case 'mallId': {
                this.getTerminalAutoSelect(option[field]);
                this.filterMall = this.utils.getFilterOptions(this.mallControl, this.mallSources, 'mallName', 'mallId');
                this.mallIdControl.setValue(option[field]);
                break;
            }
            case 'terminalId': {
                this.getStoreAutoSelect(option[field]);
                this.terminalIdControl.setValue(option[field]);
                this.filterTerminal = this.utils.getFilterOptions(this.terminalControl, this.terminalSources, 'terminalName', 'terminalNo');
                break;
            }
            case 'storeId': {
                this.storeIdControl.setValue(option[field]);
                this.filterStore = this.utils.getFilterOptions(this.storeControl, this.storeSources, 'storeName', 'storeNo');
            }

        }
    }

    /** 详情操作菜单*/
    getDetailMenu() {
        this.detailMenu = [
            {
                translate: '详情', icon: 'edit', fn: (event) => {
                    this.getDetail(event);
                }
            },
            {
                translate: '修改密码', icon: 'vpn_key', fn: (event) => {
                    if (event.username && event.username !== this.passwordForm.get('username').value) {
                        this.passwordForm.reset();
                        this.passwordForm.get('username').setValue(event.username);
                    }
                    this.changePassword();
                }
            },
            {
                translate: '重置密码', icon: 'refresh', fn: (event) => {
                    this.resetPassword(event);
                }
            }];
    }

    // 重置密码
    resetPassword(event) {
        if (event.username === sessionStorage.getItem('username')) {
            this.isCurrent = true;
            this.dialog.open(InjectConfirmDialogComponent, {
                id: 'resetPassword', width: '400px', data: {
                    title: '重置密码',
                    content: '重置当前登录账号的密码后，需要重新登录，请确认操作！',
                    cancelButton: true
                }
            }).afterClosed().subscribe(res => {
                if (res) {
                    const data = {username: event.username};
                    this.loading.show();
                    this.http.post<any>(sessionStorage.getItem('baseUrl') + 'auth/api/account/reset', data).subscribe((r) => {
                        this.logout.logout().then(() => {
                            this.pwInfo.usernameContent = data.username;
                            this.pwInfo.passwordContent = r.password;
                            this.dialog.open(this.pwTip, {width: '500px', hasBackdrop: false});
                            this.loading.hide();
                        });
                    });
                }
            });
        } else {
            this.isCurrent = false;
            this.dialog.open(InjectConfirmDialogComponent, {
                id: 'resetPassword', width: '400px', data: {
                    title: '重置密码',
                    content: '该操作将重置该账户的密码，请确认操作！',
                    cancelButton: true
                }
            }).afterClosed().subscribe(res => {
                if (res) {
                    const data = {username: event.username};
                    this.loading.show();
                    this.http.post<any>(sessionStorage.getItem('baseUrl') + 'auth/api/account/reset', data).subscribe((r) => {
                        this.pwInfo.usernameContent = data.username;
                        this.pwInfo.passwordContent = r.password;
                        this.dialog.open(this.pwTip, {width: '500px', hasBackdrop: false});
                        this.loading.hide();
                    });
                }
            });
        }
    }

    /** 修改密码相关*/
    // 打开修改密码弹窗
    changePassword() {
        const dialog = this.dialog.open(ChangePasswordComponent, {
            id: 'changePassword', width: '400px', data: {
                passwordForm: this.passwordForm,
                repeatPassword: this.repeatPassword,
                oldType: this.oldType,
                newType: this.newType,
                repeatType: this.repeatType
            }
        });
        dialog.afterClosed().subscribe(res => {
            if (res) {
                const instance = dialog.componentInstance;
                const data = this.passwordForm.getRawValue();
                data.oldPassword = Md5.init(data.oldPassword);
                data.newPassword = Md5.init(data.newPassword);
                if (data.username) {
                    if (data.username !== sessionStorage.getItem('username')) {
                        instance.changePassword(data).then(() => {
                            const message = '修改账户“' + data.username + '”的密码成功，请使用新的密码登录该账户！';
                            this.snackBar.open(message, '✓');
                            this.onSearch();
                            this.resetForms();
                        }, reason => console.log(reason));
                    } else {
                        this.dialog.open(InjectConfirmDialogComponent, {
                            width: '500px', data: {
                                content: '修改当前登录账户的密码后，需要重新登录，请确认操作！',
                                cancelButton: true
                            }
                        }).afterClosed().subscribe(r => {
                            if (r) {
                                instance.changePassword(data).then(() => {
                                    this.resetForms();
                                    const message = '修改密码成功，请重新登录！';
                                    this.snackBar.open(message, '✓');
                                    this.logout.logout().then(() => {
                                    });
                                }, reason => console.log(reason));
                            } else if (r === false) {
                                this.resetForms();
                            }
                        });
                    }
                }
            } else if (res === false) {
                this.resetForms();
            }
        });
    }

    resetForms() {
        this.oldType.type = this.newType.type = this.repeatType.type = 'password';
        this.passwordForm.reset('');
        this.repeatPassword.reset('');
    }

    getColumns() {
        this.columns = [
            {name: 'username', translate: '用户名', value: ''},
            {
                name: 'enabled',
                translate: '状态',
                value: ''
            },
            {
                name: 'scope', needTranslate: true,
                translate: '账号类型', value: ''
            },
            {name: 'roles', translate: '角色', value: ''},
            {name: 'createdBy', translate: '创建人', value: ''},
            {name: 'createdDate', translate: '创建时间', value: ''},
            {name: 'lastModifiedBy', translate: '修改人', value: ''},
            {name: 'lastModifiedDate', translate: '修改时间', value: ''},
        ];
    }

    initSearch() {
        this.loading.show();
        this.accountService.getAccountList(this.page.page, this.page.size, this.page.sort).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.status === 200) {
                this.rows = res.body;
                this.rows.forEach(row => {
                    if (row.roles) {
                        row.roles = row.roles.map(item => item.name);
                    }
                });
                this.page.count = Number(res.headers.get('X-Total-Count'));
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.createButton = true;
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
        this.accountService.getAccountList(this.page.page, this.page.size, this.page.sort, multiSearch).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.status === 200) {
                this.rows = res.body;
                this.rows.forEach(row => {
                    if (row.roles) {
                        row.roles = row.roles.map(item => item.name);
                    }
                });
                this.page.count = Number(res.headers.get('X-Total-Count'));
                if (this.rows.length === 0) {
                    this.snackBar.open(this.translate.instant('tableList.listEmpty'), '✖');
                }
                this.createButton = true;
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

    /** 账户操作相关*/
    showEdit() {
        this.editFlag = 2;
        this.accountGroup.get('enabled').enable();
        this.accountGroup.get('scope').enable();
        this.terminalControl.enable({emitEvent: false});
        this.mallControl.enable({emitEvent: false});
        this.blocControl.enable({emitEvent: false});
        this.storeControl.enable({emitEvent: false});
    }

    saveAccount() {
        if (this.accountGroup.valid) {
            let flag = false;
            switch (this.accountGroup.get('scope').value) {
                case AccountType.BLOC: {
                    flag = this.blocControl.valid;
                    if (!flag) {
                        this.blocControl.markAsTouched();
                    }
                    break;
                }
                case AccountType.MALL: {
                    flag = this.blocControl.valid && this.mallControl.valid;
                    if (!flag) {
                        this.blocControl.markAsTouched();
                        this.mallControl.markAsTouched();
                    }
                    break;
                }
                case AccountType.STREET: {
                    flag = this.blocControl.valid && this.mallControl.valid && this.terminalControl.valid;
                    if (!flag) {
                        this.blocControl.markAsTouched();
                        this.mallControl.markAsTouched();
                        this.terminalControl.markAsTouched();
                    }
                    break;
                }
                case AccountType.MERCHANT: {
                    flag = this.blocControl.valid && this.mallControl.valid && this.terminalControl.valid && this.storeControl.valid;
                    if (!flag) {
                        this.blocControl.markAsTouched();
                        this.mallControl.markAsTouched();
                        this.terminalControl.markAsTouched();
                        this.storeControl.markAsTouched();
                    }
                }
            }
            if (flag) {
                this.editDialogRef.close(true);
            }
        } else {
            this.accountGroup.markAllAsTouched();
        }
    }

    getDetail(event) {
        this.loading.show();
        this.accountService.getAccountByUsername(event.username).subscribe(res => {
            this.editFlag = 1;
            this.accountGroup.patchValue(res);
            this.accountGroup.disable();
            this.blocControl.disable();
            this.mallControl.disable();
            this.terminalControl.disable();
            this.storeControl.disable();
            if (res.scope && Array.isArray(res.scopeValue) && res.scopeValue.length > 0) {
                const id = res.scopeValue[0];
                switch (res.scope) {
                    case AccountType.BLOC: {
                        this.accountService.getBlocByBlocId(id).subscribe(r => {
                            this.blocControl.setValue(r.blocName, {emitEvent: false});
                            this.blocIdControl.setValue(r.blocId);
                            this.getMallAutoSelect(r.blocId);
                        });
                        break;
                    }
                    case AccountType.MALL: {
                        this.accountService.getMallByMallId(id).subscribe(r => {
                            this.blocControl.setValue(r.blocName, {emitEvent: false});
                            this.mallControl.setValue(r.mallName, {emitEvent: false});
                            this.mallIdControl.setValue(r.mallId);
                            this.getMallAutoSelect(r.blocId);
                            this.getTerminalAutoSelect(r.mallId);
                        });
                        break;
                    }
                    case AccountType.STREET: {
                        this.accountService.getTerminalByTerminalId(id).subscribe(data => {
                            const r = data.terminalDTO;
                            this.blocControl.setValue(r.blocName, {emitEvent: false});
                            this.mallControl.setValue(r.mallName, {emitEvent: false});
                            this.terminalControl.setValue(r.terminalName, {emitEvent: false});
                            this.terminalIdControl.setValue(r.terminalId);
                            this.getMallAutoSelect(r.blocId);
                            this.getTerminalAutoSelect(r.mallId);
                        });
                        break;
                    }
                    case AccountType.MERCHANT: {
                        this.accountService.getStoreByStoreId(id).subscribe(data => {
                            this.mallControl.setValue(data.mallName, {emitEvent: false});
                            this.mallIdControl.setValue(data.mallId, {emitEvent: false});
                            this.terminalControl.setValue(data.terminalName, {emitEvent: false});
                            this.storeControl.setValue(data.storeName, {emitEvent: false});
                            this.storeIdControl.setValue(data.storeId, {emitEvent: false});
                            this.accountService.getMallByMallId(data.mallId).subscribe(data1 => {
                                this.blocControl.setValue(data1.blocName, {emitEvent: false});
                                this.getMallAutoSelect(data1.blocId);
                            });
                            this.getStoreAutoSelect(data.terminalId);
                            this.getTerminalAutoSelect(data.mallId);
                        });
                    }
                }
            }
            this.loading.hide();
            // 打开详情弹框
            this.openDialog(this.editTemplate).then(data => {
                this.accountService.updateAccount(data).subscribe(r => {
                    this.loading.hide();
                    if (data.username === sessionStorage.getItem('username')) {
                        this.snackBar.open('编辑当前账户成功，请重新登录以适应修改！', '✓');
                    } else {
                        this.snackBar.open('编辑账户成功，该账户下次登录将适应修改！', '✓');
                    }
                    this.resetForm();
                    this.onSearch();
                });
            });
        });
    }

    create(template, pwConfirm) {
        this.editFlag = 0;
        this.accountGroup.reset();
        this.accountGroup.enable();
        this.terminalControl.enable();
        this.blocControl.enable();
        this.mallControl.enable();
        this.storeControl.enable();
        this.accountGroup.get('enabled').setValue(true);
        this.openDialog(template).then(data => {
            this.accountService.createAccount(data).subscribe(r => {
                this.loading.hide();
                this.usernameContent = data.username;
                this.passwordContent = r.password;
                this.dialog.open(pwConfirm, {width: '500px', hasBackdrop: false});
                this.onSearch();
                this.accountGroup.reset();
                this.resetForm();
            });
        });
    }

    // 重置表单
    resetForm() {
        this.terminalControl.reset();
        this.terminalIdControl.reset();
        this.blocControl.reset();
        this.blocIdControl.reset();
        this.mallIdControl.reset();
        this.mallControl.reset();
    }

    openDialog(template) {
        return new Promise<any>((resolve, reject) => {
            if (!this.dialog.getDialogById('editAccount')) {
                this.editDialogRef = this.dialog.open(template, {id: 'editAccount', width: '500px'});
                this.editDialogRef.afterClosed().subscribe(res => {
                    if (res) {
                        this.loading.show();
                        const data = this.accountGroup.getRawValue();
                        if (data.roles) {
                            data.roles = data.roles.map(role => role.name);
                        }
                        switch (data.scope) {
                            case AccountType.BLOC: {
                                data.scopeValue = [this.blocIdControl.value];
                                break;
                            }
                            case AccountType.MALL: {
                                data.scopeValue = [this.mallIdControl.value];
                                break;
                            }
                            case AccountType.STREET: {
                                data.scopeValue = [this.terminalIdControl.value];
                                break;
                            }
                            case AccountType.MERCHANT: {
                                data.scopeValue = [this.storeIdControl.value];
                                data.mall = this.mallIdControl.value;
                                data.store = this.storeIdControl.value;
                            }

                        }
                        resolve(data);
                    } else if (res === false || this.editFlag !== 0) {
                        this.accountGroup.reset();
                    }
                }, reject);
            }
        });
    }

    onDataSelect(roles) {
        this.selectedRows = roles;
    }

    openRoleSelect(roleTemplate) {
        this.selectedRows = [];
        Object.assign(this.selectedRows, this.accountGroup.get('roles').value);
        this.dialog.open(roleTemplate, {id: 'tagSelect', width: '80%'}).afterClosed().subscribe(res => {
            if (res) {
                const roles = [];
                Object.assign(roles, this.selectedRows);
                this.accountGroup.get('roles').setValue(roles);
            } else {
                this.selectedRows = [];
            }
        });
    }

    removeRole(i) {
        const value = this.accountGroup.get('roles').value;
        value.splice(i, 1);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}

enum AccountType {
    BLOC = 'BLOC',
    MALL = 'MALL',
    STREET = 'STREET',
    MERCHANT = 'MERCHANT'
}
