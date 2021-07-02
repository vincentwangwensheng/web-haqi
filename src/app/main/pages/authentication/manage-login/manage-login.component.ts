import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ConfigService} from '../../../../../@fuse/services/config.service';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';
import {NavigationService} from '../../../../../@fuse/components/navigation/navigation.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {Title} from '@angular/platform-browser';
import {environment} from '../../../../../environments/environment.hmr';
import {Md5} from 'md5-typescript';
import {Navigation} from '../../../../navigation/navigation';
import {takeUntil} from 'rxjs/operators';
import {ManageLoginService} from './manage-login.service';
import {ChangePasswordComponent} from '../../../../components/change-password/change-password.component';
import {InjectConfirmDialogComponent} from '../../../../components/inject-confirm-dialog/inject-confirm-dialog.component';
import {CustomValidators} from '../../../../services/CustomValidators';

@Component({
    selector: 'app-manage-login',
    templateUrl: './manage-login.component.html',
    styleUrls: ['./manage-login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ManageLoginComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    loginForm: FormGroup;
    loginDisabled = false;
    languages = [];
    selectedLanguage: any;
    ignoreExtraNet = false; // 去除内外网过滤,默认false

    // 项目相关
    logo_rectangle = ''; // 项目logo
    logo_square = '';
    logo_login = ''; // 登陆右上方logo
    tlKey = ''; // 翻译的前置key
    currentProject = '';

    passwordForm: FormGroup;
    repeatPassword = new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.strongPasswordValidator, CustomValidators.passwordValidator, Validators.required]);
    oldType = {type: 'password'};
    newType = {type: 'password'};
    repeatType = {type: 'password'};

    confirmOnce = false; // 确认一次


    /**
     * Constructor
     *
     */
    constructor(
        private snackBar: MatSnackBar,
        private router: Router,
        private http: HttpClient,
        private utils: Utils,
        private title: Title,
        private translate: TranslateService,
        private _configService: ConfigService,
        private _formBuilder: FormBuilder,
        private navigationService: NavigationService,
        private loading: FuseProgressBarService,
        private loginService: ManageLoginService,
        private dialog: MatDialog
    ) {
        this.passwordForm = new FormGroup({
            oldPassword: new FormControl('', [Validators.minLength(6), Validators.required, CustomValidators.passwordValidator, Validators.maxLength(18)]),
            newPassword: new FormControl('', [Validators.minLength(6), Validators.maxLength(18), CustomValidators.strongPasswordValidator, CustomValidators.passwordValidator, Validators.required])
        });
        this.utils.changeProjectByConfig().then(data => {
            // 设置浏览器标题
            this.translate.get(localStorage.getItem('currentProject') + '.title').subscribe(res => {
                this.title.setTitle(res);
            });
            this.initProjectParams(data);
        });
        this.loginForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
        // Configure the layout
        this._configService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    ngOnInit() {
        this.initLanguage();
        sessionStorage.clear();
        setTimeout(() => {
            this.loginForm.markAsPending();
        }, 300);
    }


    // 初始化配置
    initProjectParams(project) {
        this.logo_square = localStorage.getItem('logo_square');
        this.currentProject = localStorage.getItem('currentProject');

        this.logo_login = 'assets/projects/' + this.currentProject + '/logo-square.svg';
        this.logo_rectangle = localStorage.getItem('logo_rectangle');

        this.tlKey = 'manageLogin.' + this.currentProject + '.';
        if (!this.currentProject) { // 如果无缓存或被清除
            this.currentProject = localStorage.getItem('currentProject');
            this.tlKey = 'manageLogin.' + this.currentProject + '.';
            this.logo_login = 'assets/projects/' + this.currentProject + '/logo-square.svg';
        }
        if (!this.logo_rectangle) {
            this.logo_rectangle = project.logo_rectangle;
        }
        if (!this.logo_square) {
            this.logo_square = project.logo_square;
        }
        if (this.currentProject !== 'hq') { // 非机场项目去除内外网过滤
            this.ignoreExtraNet = true;
        }
    }


    // 初始化语言
    initLanguage(selectLang?) {
        this.translate.get('language').subscribe(language => {
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
            if (this.translate.currentLang === 'zh-CN' || this.translate.currentLang === 'zh-TW') {
                this.selectedLanguage = this.languages.find(item => item.id === this.translate.currentLang);
            } else {
                this.selectedLanguage = this.languages.find(item => item.id === 'en-US');
            }
            this.languages = this.languages.filter(item => item.id !== this.selectedLanguage.id);
        });
    }

    setLanguage(lang) {
        this.translate.use(lang.id);
        this.initLanguage(lang);
    }

    // 登录按钮
    login() {
        if (!sessionStorage.getItem('baseUrl')) {
            this.utils.getBaseUrl().then(() => {
                this.authLogin();
            });
        } else {
            this.authLogin();
        }
    }

    // 服务器认证登录
    serverAuth(data) {
        return new Promise<any>((resolve => {
            this.loginService.authLogin(data).subscribe(res => {
                if (res.status === 456) {
                    resolve({force: true});
                } else if (res.headers.get('Authorization')) {
                    this.loginDisabled = true;
                    this.loading.show();
                    const token = res.headers.get('Authorization');
                    const info = token.split('.');
                    let auth = '';
                    try {
                        auth = JSON.parse(window.atob(info[1])).auth;
                    } catch (e) {
                        console.log(e);
                    }
                    sessionStorage.setItem('token', token);
                    sessionStorage.setItem('username', data.username);
                    sessionStorage.setItem('currentSystem', 'manage');
                    sessionStorage.setItem('auth', JSON.stringify(auth));
                    sessionStorage.setItem('isSystemSuperAdmin', JSON.stringify(auth.includes('ROLE_SUPERADMIN'))); // 是否是系统超级管理员
                    resolve({response: res, auth: auth});
                }
            }, error1 => {
                if (error1 && error1.status === 456) {
                    return  resolve({force: true});
                }
                this.loginDisabled = false;
                this.loading.hide();
                console.log(error1);
                if (error1 && error1.status === 401) {
                    this.snackBar.open(this.translate.instant('loginPage.fail'), '✖');
                } else if (error1 && error1.status === 404) {
                    this.snackBar.open('无法找到登录服务（状态码404），请联系系统管理员！', '✖');
                } else if (error1 && error1.status === 0) {
                    this.snackBar.open('登录服务不可用（状态码0），请联系系统管理员！', '✖');
                }
                else if (error1 && error1.error && error1.error.detail) {
                    this.snackBar.open(this.translate.instant(error1.error.detail), '✖');
                } else if (error1 && error1.message) {
                    this.snackBar.open(this.translate.instant(error1.message), '✖');
                } else {
                    this.snackBar.open('服务发生未知错误，请联系系统管理员！', '✖');
                }
            });
        }));
    }

    // 服务器接口登陆
    authLogin() {
        // 校验并跳转
        const loginData = this.loginForm.getRawValue();
        const username = loginData.username;
        const password = loginData.password;
        let navigation = [];
        /** 区分项目菜单*/
        navigation = Navigation;
        const data = {username: username, password: Md5.init(password)};
        this.serverAuth(data).then((res) => {
            if (res.force) {
                this.forceChangePassword(data);
                return;
            }
            this.filterAuth(username, navigation, res).then(da => {
                    this.getNavAndNavigate(da.nav);

                    // 获取权限菜单
                    const auth = this.utils.getFlatMenu(navigation);
                    const list = [];
                    auth.forEach(item => {
                        const a = {name: item.id, description: item.title};
                        list.push(a);
                    });
                    console.log(JSON.stringify(list));
                    console.log(navigation);
            });
        });
    }

    // 长期未改密码强制改密码
    forceChangePassword(userInfo) {
        if (!this.confirmOnce) {
            this.dialog.open(InjectConfirmDialogComponent, {
                width: '500px', data: {
                    title: '系统安全提示：',
                    content: '您的密码已过期，修改密码后可重新登录。请确认操作！',
                    cancelButton: true
                }
            }).afterClosed().subscribe(r => {
                if (r) {
                    this.confirmOnce = true;
                    this.changePassword(userInfo);
                }
            });
        } else {
            this.changePassword(userInfo);
        }
    }

    // 修改密码
    changePassword(userInfo) {
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
                data.username = userInfo.username;
                data.oldPassword = Md5.init(data.oldPassword);
                data.newPassword = Md5.init(data.newPassword);
                instance.forceChangePassword(data).then(() => {
                    this.resetForms();
                    this.snackBar.open('修改密码成功，请使用新的密码登录系统！', '✓');
                }, reason => {
                    console.log(reason);
                });
            } else if (res === false) {
                this.resetForms();
            }
        });
    }

    // 重置表单
    resetForms() {
        this.oldType.type = this.newType.type = this.repeatType.type = 'password';
        this.passwordForm.reset('');
        this.repeatPassword.reset('');
    }

    // 过滤账户的菜单
    filterAuth(username, navigation, data?) {
        return new Promise<any>(resolve => {
            const response = data.response;
            const authStr = data.auth;
            let nav = [];
            // 从权限中过滤菜单
            if (authStr) {
                const authList = authStr.split(',');
                nav = JSON.parse(JSON.stringify(navigation));
                nav = nav.filter(item => authList.includes(item.id));
                nav.forEach(item => {
                    this.filterByAuthList(item, authList);
                });
                // 路由放行url列表
                const releaseUrls = this.navigationService.getFlatNavigation(nav).map(item => item.url);
                sessionStorage.setItem('releaseUrls', JSON.stringify(releaseUrls));
            }
            // 内外网过滤
            this.http.get<any>('configs/extraNet.json').pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
                const extraNet = res.extraNet as any[];
                resolve({res: response, username: username, nav: nav, extraNet: extraNet});
            });
        });
    }

    // 内外网过滤
    extraNetFilter(data) {
        const res = data.res;
        let nav = data.nav;
        const extraNet = data.extraNet;
        return new Promise<any>(resolve => {
            if (!this.ignoreExtraNet && environment.production && !res.headers.get('X-Hdr')) {
                nav = nav.filter(item => extraNet.find(v => v.id === item.id));
                nav.forEach(item => {
                    const filter = extraNet.find(v => v.id === item.id);
                    this.filter(item, filter);
                });
            }
            resolve(nav);
        });
    }

    // 递归调用自身  对象会引用传递 进行对比过滤
    filterByAuthList(target: any, authList: any[]) {
        if (target.children) {
            target.children = target.children.filter(item => authList.includes(item.id));
            target.children.forEach(item => {
                this.filterByAuthList(item, authList);
            });
        }
    }

    // 递归调用自身  对象会引用传递 进行对比过滤
    filter(target: any, filter: any) {
        if (target.children && filter.children) {
            target.children = target.children.filter(item => filter.children.find(v => v.id === item.id));
            target.children.forEach(item => {
                const first = filter.children.find(v => v.id === item.id);
                this.filter(item, first);
            });
        }
    }

    // 获取导航菜单并跳转
    getNavAndNavigate(nav) {
        sessionStorage.setItem('navigation', JSON.stringify(nav));
        this.navigationService.unregister('main');
        this.navigationService.register('main', nav);
        this.navigationService.setCurrentNavigation('main');
        const url = nav[0] && nav[0].children[0] ? (nav[0].children[0].children[0].url) : '';
        if (url) {
            this.router.navigate([url]).then(() => {
                this.showPanels();
            });
        } else {
            this.snackBar.open(this.translate.instant('loginPage.noAuth'), '✖');
        }
        this.loading.hide();
        this.loginDisabled = false;
    }

    // 让页面上的布局模块显示
    showPanels() {
        this._configService.config = {
            layout: {
                navbar: {
                    hidden: false
                },
                toolbar: {
                    hidden: false
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: false
                }
            }
        };
    }


    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
