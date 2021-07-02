import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ConfigService} from '@fuse/services/config.service';
import {fuseAnimations} from '@fuse/animations';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';
import {AccountService} from '../../../../services/accountService/account.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {NavigationService} from '../../../../../@fuse/components/navigation/navigation.service';
import {environment} from '../../../../../environments/environment.hmr';
import {Utils} from '../../../../services/utils';
import {Navigation} from '../../../../navigation/navigation';
import {Md5} from 'md5-typescript';
import {LoginService} from './login.service';
import {Title} from '@angular/platform-browser';

@Component({
    selector: 'login-2',
    templateUrl: './login-2.component.html',
    styleUrls: ['./login-2.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class Login2Component implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    loginForm: FormGroup;
    loginDisabled = false;
    languages = [];
    selectedLanguage: any;
    ignoreExtraNet = false; // 去除内外网过滤,默认false


    // 项目相关
    logo_rectangle = ''; // 项目logo
    logo_square = '';
    tlKey = ''; // 翻译的前置key
    currentProject = '';

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
        private account: AccountService,
        private translate: TranslateService,
        private _configService: ConfigService,
        private _formBuilder: FormBuilder,
        private navigationService: NavigationService,
        private loading: FuseProgressBarService,
        private loginService: LoginService
    ) {
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

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.initLanguage();
        setTimeout(() => {
            this.loginForm.markAsPending();
        }, 300);
    }


    // 初始化配置
    initProjectParams(project) {
        this.logo_square = localStorage.getItem('logo_square');
        this.logo_rectangle = localStorage.getItem('logo_rectangle');
        this.currentProject = localStorage.getItem('currentProject');
        this.tlKey = 'loginPage.' + this.currentProject + '.';
            if (!this.currentProject) { // 如果无缓存或被清除
                this.currentProject = localStorage.getItem('currentProject');
                this.tlKey = 'loginPage.' + this.currentProject + '.';
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
        return new Promise((resolve => {
            this.loginService.authLogin(data).subscribe(res => {
                if (res.headers.get('Authorization')) {
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
                    resolve({response: res, auth: auth});
                }
            }, error1 => {
                this.loginDisabled = false;
                this.loading.hide();
                console.log(error1);
                if (error1 && error1.error && error1.error.detail) {
                    this.snackBar.open(this.translate.instant(error1.error.detail), '✖');
                } else {
                    this.snackBar.open(this.translate.instant('loginPage.fail'), '✖');
                }
            });
        }));
    }

    // 服务器接口登陆
    authLogin() {
        this.loginDisabled = true;
        this.loading.show();
        // 校验并跳转
        const loginData = this.loginForm.getRawValue();
        const username = loginData.username;
        const password = loginData.password;
        let navigation = [];
            navigation = Navigation;
        const data = {username: username, password: Md5.init(password)};
        this.serverAuth(data).then((res) => {
            this.filterAuth(username, navigation, res).then(da => {
                this.extraNetFilter(da).then(nav => {
                    this.getNavAndNavigate(nav);
                });
            });
        });
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

    // 获取令牌和注册导航菜单
    getTokenAndRegisterNavigation(data) {
        const username = data.username;
        this.account.getToken(username).pipe(takeUntil(this._unsubscribeAll)).subscribe(res => {
            if (res.body) {
                // 如果不是内网则过滤菜单
                data.res = res;
                this.extraNetFilter(data).then(nav => {
                    sessionStorage.setItem('token', res.body);
                    sessionStorage.setItem('username', username);
                    this.getNavAndNavigate(nav);
                });
            }
        }, error => {
            this.loading.hide();
            this.loginDisabled = false;
        }, () => {
            this.loading.hide();
            this.loginDisabled = false;
        });
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

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
