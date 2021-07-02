import {Injectable} from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {LogoutService} from './logout.service';
import {catchError} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {FuseProgressBarService} from '../../@fuse/components/progress-bar/progress-bar.service';

// 配置拦截器
@Injectable()
export class InterceptServiceProvider implements HttpInterceptor {
    exceptionUrls = [
        'auth/api/login',
        'api/svg-init'
    ]; // 通用出错处理例外接口列表

    constructor(public router: Router,
                private snackBar: MatSnackBar,
                private logout: LogoutService,
                private loading: FuseProgressBarService,
                private translate: TranslateService
    ) {
    }


    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = sessionStorage.getItem('token');
        let newReq;
        if (token) { // 如果令牌存在
            newReq = req.clone({
                setHeaders: {
                    authorization: token
                }
            });
        } else {
            newReq = req;
        }
        return next.handle(newReq).pipe(catchError((error) => {
                console.log(error);
                this.loading.hide(); // 出现错误时进度条直接置为false
                // 例外列表不做通用异常处理
                if (this.exceptionUrls.find(item => newReq.url.includes(item))) {
                    return new Observable<HttpEvent<any>>(subscriber => subscriber.error(error));
                }
                if (error.status === 401) { // 权限401 令牌失效
                    this.snackBar.open(this.translate.instant('status.401'), '✖');
                    this.logout.logout().then();
                } else if (error.status === 400) {
                    this.onMessageOrDetail(error).then(() => this.snackBar.open(this.translate.instant('status.400'), '✖'));
                } else if (error.status === 404) {
                    this.snackBar.open(this.translate.instant('status.404'), '✖');
                } else if (error.status === 500) {
                    this.onMessageOrDetail(error).then(() => this.snackBar.open(this.translate.instant('status.500')));
                } else if (error.status === 502) {
                    this.onMessageOrDetail(error).then(() => this.snackBar.open(this.translate.instant('status.502')));
                } else if (error.status === 504) {
                    this.snackBar.open(this.translate.instant('status.504'), '✖');
                } else {
                    this.onMessageOrDetail(error).then(() => this.snackBar.open(this.translate.instant('status.error')));
                }
                return new Observable<HttpEvent<any>>(subscriber => subscriber.error(error));
            }
        ));
    }

    // 中台返回的通常处理和例外处理
    onMessageOrDetail(error) {
        return new Promise<any>(resolve => {
                console.log(error);
                if ((error.error && error.error.message) || (error.error && error.error.detail)) {
                    // const totalMessage = (error.error.message ? error.error.message + ' ' : '') + (error.error.detail ? error.error.detail : '');
                    const totalMessage = (error.error.detail ? error.error.detail : '') || (error.error.message ? error.error.message + ' ' : '');
                    this.snackBar.open(totalMessage, '✖');
                } else {
                    resolve();
                }
            }
        );
    }
}
