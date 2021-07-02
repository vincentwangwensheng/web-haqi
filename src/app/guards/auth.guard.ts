import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivateChild, Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {LogoutService} from '../services/logout.service';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {NotifyAsynService} from '../services/notify-asyn.service';
import {AccountService} from '../services/accountService/account.service';
import {LayoutControlService} from '../services/layout-control.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
    private thirdLogin = new Subject();
    // 例外列表，新开发的功能可暂放至此
    extraUrls = ['Analysis' , 'activityAnalysis'];
    constructor(private logout: LogoutService,
                private translate: TranslateService,
                private userNotify: NotifyAsynService,
                private layout: LayoutControlService,
                private account: AccountService,
                private notify: NotifyAsynService,
                private router: Router,
                private snackBar: MatSnackBar) {
        this.thirdLogin.subscribe(res => {
            if (!res) {
                this.logout.logout().then();
            }
        });
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.thirdPartyLoginOrNot(childRoute, state);
    }

    // 第三方直接登录
    thirdPartyLoginOrNot(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | boolean {
        if (childRoute.queryParamMap.has('code') && childRoute.queryParamMap.has('state') && !sessionStorage.getItem('token')) {
            const code = childRoute.queryParamMap.get('code');
            const states = childRoute.queryParamMap.get('state');
            this.account.thirdPartyLogin(code, states).subscribe(res => {
                if (res.headers.has('Authorization')) {
                    const token = res.headers.get('Authorization');
                    sessionStorage.setItem('token', token);
                    const user = JSON.parse(window.atob(token.split('.')[1])).sub;
                    console.log(user);
                    sessionStorage.setItem('username', user);
                    this.userNotify.usernameChange.emit(user);
                }
                this.thirdLogin.next(true);
            }, error1 => {
                this.thirdLogin.next(false);
            });
            return this.thirdLogin.asObservable();
        } else {
            this.layout.showLayout();
            return this.userCacheLost(state)
                && this.checkReleaseUrls(state);
        }
    }

    // 检查放行url列表
    checkReleaseUrls(state: RouterStateSnapshot) {
        let cacheReleaseUrls = [];
        if (sessionStorage.getItem('releaseUrls')) {
            cacheReleaseUrls = JSON.parse(sessionStorage.getItem('releaseUrls'));
        }
        const releaseUrls = cacheReleaseUrls.concat(this.extraUrls);
        const flag = !!releaseUrls.find(item => state.url.includes(item));
        if (!flag) {
            this.router.navigate([releaseUrls[0]]).then(() => {
                this.snackBar.open(this.translate.instant('auth.haveNoAuth'), '✖');
            });
        }
        return flag;
    }

    // 用户未登录或缓存被清除
    userCacheLost(state: RouterStateSnapshot): boolean {
        // 用户名不存在并且非图表页面
        if (!sessionStorage.getItem('username') && !state.url.includes('Analysis')) {
            this.logout.logout().then(() => {
                this.snackBar.open(this.translate.instant('auth.userCacheLost'), '✖');
            });
            return false;
        } else {
            return true;
        }
    }
}
