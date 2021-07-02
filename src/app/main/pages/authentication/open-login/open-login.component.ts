import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {FormBuilder, Validators} from '@angular/forms';
import {LayoutControlService} from '../../../../services/layout-control.service';
import {OpenNavigation} from '../../../../navigation/openNavigation';
import {NavigationService} from '../../../../../@fuse/components/navigation/navigation.service';
import {Router} from '@angular/router';
import {OpenCenterService} from '../../../open-platform/openCenterService/open-center.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';
import {Md5} from 'md5-typescript';
import {OpenLoginService} from './open-login.service';

@Component({
    selector: 'app-open-center',
    templateUrl: './open-login.component.html',
    styleUrls: ['./open-login.component.scss'],
    animations: fuseAnimations
})
export class OpenLoginComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();
    currentProject = '';

    languages = [];

    selectedLanguage: any;

    loginForm: any; // 登陆表单

    registerForm: any; // 注册表单

    registerIng = false; // 是否是跳转注册页面

    usernameContent = '';

    passwordContent = '';

    loginDisabled = false;

    codeSendTitle = '';

    codeSendDis = false;

    logo_rectangle = '';   // 左侧logo

    logo_login = ''; // 登陆右上方logo

    tlKey = '';

    constructor(
        private layout: LayoutControlService,
        private _formBuilder: FormBuilder,
        private navigationService: NavigationService,
        private translate: TranslateService,
        private utils: Utils,
        private router: Router,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar,
        private openCenterService: OpenCenterService,
        private dialog: MatDialog,
        private loginService: OpenLoginService,
    ) {
        this.loginForm = this._formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        this.registerForm = this._formBuilder.group({
            mobile: ['', [Validators.required]],
            captcha: ['', [Validators.required]]
        });
        this.currentProject = localStorage.getItem('currentProject');
        this.layout.hideLayout();
    }

    ngOnInit() {
        this.codeSendDis = false;
        this.codeSendTitle = '发送验证码';
        this.initProjectParams();
        this.initLanguage();
        sessionStorage.clear(); // 清除所有缓存
    }


    // 初始化配置
    initProjectParams() {
        this.tlKey = 'openLogin.' + this.currentProject + '.';
        this.logo_rectangle = localStorage.getItem('logo_rectangle');
        this.logo_login = 'assets/projects/' + this.currentProject + '/logo-square.svg';
        if (!this.currentProject) { // 如果无缓存或被清除
            this.currentProject = localStorage.getItem('currentProject');
            this.tlKey = 'openLogin.' + this.currentProject + '.';
            this.logo_login = 'assets/projects/' + this.currentProject + '/logo-square.svg';
        }
    }


    // 开放中心登录
    openLogin() {
        this.loading.show();
        if (!sessionStorage.getItem('baseUrl')) {
            this.utils.getBaseUrl().then(() => {
                this.realLogin();
            });
        } else {
            this.realLogin();
        }

    }

    realLogin() {
        let navigation = [];
        /** 区分项目菜单*/
        navigation = OpenNavigation;
        const loginData = this.loginForm.getRawValue();
        const username = loginData.username;
        const password = loginData.password;
        this.loginDisabled = true;
        const data = {username: username, password: Md5.init(password)};
        this.serverAuth(data).then((res) => {
            this.filterAuth(username, navigation, res).then(da => {
                this.getNavAndNavigate(da.nav);
            });
        });

    }

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
                    sessionStorage.setItem('currentSystem', 'open');
                    resolve({response: res, auth: auth});
                }
            }, error1 => {
                this.loginDisabled = false;
                this.loading.hide();
                console.log(error1);
                if (error1 && error1.status === 401) {
                    this.snackBar.open(this.translate.instant('loginPage.fail'), '✖');
                } else if (error1 && error1.status === 404) {
                    this.snackBar.open('无法找到登录服务（状态码404），请联系系统管理员！', '✖');
                } else if (error1 && error1.status === 0) {
                    this.snackBar.open('登录服务不可用（状态码0），请联系系统管理员！', '✖');
                } else if (error1 && error1.error && error1.error.detail) {
                    this.snackBar.open(this.translate.instant(error1.error.detail), '✖');
                } else if (error1 && error1.message) {
                    this.snackBar.open(this.translate.instant(error1.message), '✖');
                } else {
                    this.snackBar.open('服务发生未知错误，请联系系统管理员！', '✖');
                }
            });
        }));
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
                // nav = nav.filter(item => authList.includes(item.id));
                nav.forEach(item => {
                    this.filterByAuthList(item, authList);
                });
                // 路由放行url列表
                const releaseUrls = this.navigationService.getFlatNavigation(nav).map(item => item.url);
                sessionStorage.setItem('releaseUrls', JSON.stringify(releaseUrls));
            }
            resolve({res: response, username: username, nav: nav});
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

    // 获取导航菜单并跳转
    getNavAndNavigate(nav) {
        sessionStorage.setItem('navigation', JSON.stringify(nav));
        this.navigationService.unregister('main');
        this.navigationService.register('main', nav);
        this.navigationService.setCurrentNavigation('main');
        const url = nav[0] && nav[0].children[0] ? (nav[0].children[0].children[0].url) : '';
        if (url) {
            this.router.navigate([url]).then(() => {
                this.layout.showLayout();
            });
        } else {
            this.snackBar.open(this.translate.instant('loginPage.noOpenAuth'), '✖');
        }
        this.loading.hide();
        this.loginDisabled = false;
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


    // 切换注册
    toRegister() {
        this.registerIng = true;
    }

    // 切换登陆
    toLogin() {
        this.registerIng = false;
    }


    // 发送验证码
    sendMessage() {
        const mobile = this.registerForm.get('mobile').value;
        if (!mobile) {
            this.snackBar.open('请先输入手机号', '✖');
            return;
        } else {
            const mob = this.VerMobile(mobile);
            if (!mob) {
                this.snackBar.open('请填写正确的手机号', '✖');
                return true;
            }
        }

        if (!sessionStorage.getItem('baseUrl')) {
            this.utils.getBaseUrl().then(() => {
                this.openCenterService.captcha(mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                    res => {
                        this.snackBar.open('验证码发送成功', '✖');
                        // 发送验证码但是没有返回
                        this.codeSendDis = true;
                        this.codeInterval();
                    }
                );
            });
        } else {
            this.openCenterService.captcha(mobile).pipe(takeUntil(this._unsubscribeAll)).subscribe(
                res => {
                    this.snackBar.open('验证码发送成功', '✖');
                    // 发送验证码但是没有返回
                    this.codeSendDis = true;
                    this.codeInterval();
                }
            );
        }

    }

    codeInterval() {
        let TimeID;
        let btuName = '300';
        TimeID = setInterval(() => {
            btuName = (Number(btuName) - 1) + '';
            if ('0' === btuName) {
                clearInterval(TimeID);
                btuName = '';
                this.codeSendTitle = '发送验证码';
                this.codeSendDis = false;
            } else {
                this.codeSendTitle = '重新发送(' + btuName + ')s';
            }
        }, 1000);
    }


    // 注册
    registerSuccess(reConfirm) {
        const form = this.registerForm.getRawValue();
        if (!form.mobile) {
            this.snackBar.open('请先输入手机号', '✖');
            return;
        } else {
            const mob = this.VerMobile(form.mobile);
            if (!mob) {
                this.snackBar.open('请填写正确的手机号', '✖');
                return true;
            }
        }
        if (!form.captcha) {
            this.snackBar.open('请填写验证码', '✖');
            return;
        }

        // 检验验证码 因为没有返回所以没有校验这一步
        if (!sessionStorage.getItem('baseUrl')) {
            this.utils.getBaseUrl().then(() => {
                this.registry(form, reConfirm);
            });
        } else {
            this.registry(form, reConfirm);
        }


    }

    registry(form, reConfirm) {
        this.openCenterService.registry(form).pipe(takeUntil(this._unsubscribeAll)).subscribe(
            res => {
                this.usernameContent = form.mobile;
                this.passwordContent = res.password;
                this.dialog.open(reConfirm, {width: '500px', hasBackdrop: false}).afterClosed().subscribe(
                    res1 => {
                        this.registerIng = false;
                    }
                );
            }
        );
    }


    // 判断手机号码
    VerMobile(va_) {
        const value = va_.replace(/\s+/g, '');
        if (value.length !== 11) {
            return false;
        }
        const regMb = /^1(3|4|5|6|7|8|9)\d{9}$/;
        if (regMb.test(value)) {
            return true;
        }
        return false;
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
