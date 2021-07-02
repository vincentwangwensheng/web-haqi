import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material';

@Injectable({
    providedIn: 'root'
})
export class LogoutService {

    constructor(
        private router: Router,
        private dialog: MatDialog,
    ) {
    }

    logout(type?): Promise<any> {
        return new Promise<any>(resolve => {
            // 区分登出时的不同系统
            if (sessionStorage.getItem('currentSystem') === 'open' || type === 'open') {
                this.router.navigate(['openLogin']).then(() => {
                    sessionStorage.clear();
                });
            } else {
                this.router.navigate(['manageLogin']).then(() => {
                    sessionStorage.clear();
                });
            }
            this.dialog.closeAll();
            resolve();
        });
    }
}
