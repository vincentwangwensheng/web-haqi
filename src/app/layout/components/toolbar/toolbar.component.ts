import {Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '@fuse/services/config.service';
import {SidebarService} from '@fuse/components/sidebar/sidebar.service';

import {Navigation} from '../../../navigation/navigation';
import {LogoutService} from '../../../services/logout.service';
import {NotifyAsynService} from '../../../services/notify-asyn.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ChangePasswordComponent} from '../../../components/change-password/change-password.component';
import {Md5} from 'md5-typescript';
import {InjectConfirmDialogComponent} from '../../../components/inject-confirm-dialog/inject-confirm-dialog.component';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {HttpClient} from '@angular/common/http';
import {CustomValidators} from '../../../services/CustomValidators';

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy {
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    languages: any[];
    navigation: any;
    selectedLanguage: any;
    username: string;

    // Private
    private _unsubscribeAll: Subject<any>;

    passwordForm: FormGroup;
    repeatPassword = new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.strongPasswordValidator, CustomValidators.passwordValidator, Validators.required]);
    oldType = {type: 'password'};
    newType = {type: 'password'};
    repeatType = {type: 'password'};

    changePasswordShow = true;

    pwInfo = {usernameContent: '', passwordContent: ''}; // 用户名密码提示

    /**
     * Constructor
     *
     */
    constructor(
        private configService: ConfigService,
        private sidebarService: SidebarService,
        private translateService: TranslateService,
        private notify: NotifyAsynService,
        private loading: FuseProgressBarService,
        private http: HttpClient,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private logoutService: LogoutService,
    ) {
        this.passwordForm = new FormGroup({
            oldPassword: new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.passwordValidator, Validators.required]),
            newPassword: new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.strongPasswordValidator, CustomValidators.passwordValidator, Validators.required])
        });

        // if (localStorage.getItem('currentProject') === 'hq') {
        //     this.changePasswordShow = false;
        // }
        this.initLanguage();

        this.navigation = Navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.notify.usernameChange.subscribe(res => {
            this.username = res;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.username = sessionStorage.getItem('username');
        // Subscribe to the config changes
        this.configService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((settings) => {
                this.horizontalNavbar = settings.layout.navbar.position === 'top';
                this.rightNavbar = settings.layout.navbar.position === 'right';
                this.hiddenNavbar = settings.layout.navbar.hidden === true;
            });
    }

    // 初始化语言
    initLanguage(selectLang?) {
        this.translateService.get('language').subscribe(language => {
            this.languages = [
                {
                    id: 'en-US',
                    current: language['current'],
                    title: language['en-US'],
                    flag: 'us'
                },
                {
                    id: 'zh-CN',
                    current: language['current'],
                    title: language['zh-CN'],
                    flag: 'cn'
                },
                {
                    id: 'zh-TW',
                    current: language['current'],
                    title: language['zh-TW'],
                    flag: 'cn'
                },
            ];

            if (selectLang) {
                this.selectedLanguage = this.languages.find(item => item.id === selectLang.id);
            }
            if (this.translateService.currentLang === 'zh-CN' || this.translateService.currentLang === 'zh-TW') {
                this.selectedLanguage = this.languages.find(item => item.id === this.translateService.currentLang);
            } else {
                this.selectedLanguage = this.languages.find(item => item.id === 'en-US');
            }
            this.languages = this.languages.filter(item => item.id !== this.selectedLanguage.id);
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this.sidebarService.getSidebar(key).toggleOpen();
    }

    /**
     * Search
     *
     * @param value
     */
    search(value): void {
        // Do your search here...
        console.log(value);
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void {
        // Set the selected language for the toolbar

        // Use the selected language for translations
        this.translateService.use(lang.id);
        this.initLanguage(lang);
        // this.navigationService.removeNavigationItem('custom-function');
    }

    logout() {
        this.logoutService.logout().then(value => {
        });
    }


    // 重置密码
    resetPassword(pwTip) {
        this.dialog.open(InjectConfirmDialogComponent, {
            id: 'resetPassword', width: '400px', data: {
                title: '重置密码',
                content: '重置当前登录账号的密码后，需要重新登录，请确认操作！',
                cancelButton: true
            }
        }).afterClosed().subscribe(res => {
            if (res) {
                const data = {username: this.username};
                this.loading.show();
                this.http.post<any>(sessionStorage.getItem('baseUrl') + 'auth/api/account/reset', data).subscribe((r) => {
                    this.logoutService.logout().then(() => {
                        this.pwInfo.usernameContent = data.username;
                        this.pwInfo.passwordContent = r.password;
                        this.dialog.open(pwTip, {width: '500px', hasBackdrop: false});
                        this.loading.hide();
                    });
                });
            }
        });
    }

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
                data.username = this.username;
                data.oldPassword = Md5.init(data.oldPassword);
                data.newPassword = Md5.init(data.newPassword);
                this.dialog.open(InjectConfirmDialogComponent, {
                    width: '500px', data: {
                        content: '修改当前登录账户的密码后，需要重新登录，请确认操作！',
                        cancelButton: true
                    }
                }).afterClosed().subscribe(r => {
                    if (r) {
                        instance.changeSelfPassword(data).then(() => {
                            this.resetForms();
                            this.logoutService.logout().then(() => {
                                this.snackBar.open('修改密码成功，请重新登录！', '✓');
                            });
                        }, reason => console.log(reason));
                    } else if (r === false) {
                        this.resetForms();
                    }
                });
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
}
