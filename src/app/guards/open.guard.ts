import {Injectable} from '@angular/core';
import {CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {LogoutService} from '../services/logout.service';
import {TranslateService} from '@ngx-translate/core';
import {NotifyAsynService} from '../services/notify-asyn.service';
import {LayoutControlService} from '../services/layout-control.service';
import {AccountService} from '../services/accountService/account.service';
import {MatSnackBar} from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class OpenGuard implements CanActivateChild {

    constructor(private logout: LogoutService,
                private translate: TranslateService,
                private userNotify: NotifyAsynService,
                private layout: LayoutControlService,
                private account: AccountService,
                private notify: NotifyAsynService,
                private router: Router,
                private snackBar: MatSnackBar) {
    }

    canActivateChild(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.userCacheLost(state) && this.checkReleaseUrls(state);
    }


    // 检查放行url列表
    checkReleaseUrls(state: RouterStateSnapshot) {
        let cacheReleaseUrls = [];
        if (sessionStorage.getItem('releaseUrls')) {
            cacheReleaseUrls = JSON.parse(sessionStorage.getItem('releaseUrls'));
        }
        const releaseUrls = cacheReleaseUrls;
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
            this.logout.logout('open').then(() => {
                this.snackBar.open(this.translate.instant('auth.userCacheLost'), '✖');
            });
            return false;
        } else {
            return true;
        }
    }

}
