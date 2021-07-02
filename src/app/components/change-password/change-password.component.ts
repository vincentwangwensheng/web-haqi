import {AfterViewInit, Component, Inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatSnackBar} from '@angular/material';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {FuseProgressBarService} from '../../../@fuse/components/progress-bar/progress-bar.service';

@Component({
    selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, AfterViewInit {
    passwordForm: FormGroup;
    repeatPassword: FormControl;

    oldType = {type: ''};
    newType = {type: ''};
    repeatType = {type: ''};

    newPwStamp;
    newRepeatStamp;
    repeatStamp;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        private http: HttpClient,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar
    ) {
        this.passwordForm = this.data.passwordForm;
        this.repeatPassword = this.data.repeatPassword;
        this.oldType = this.data.oldType;
        this.newType = this.data.newType;
        this.repeatType = this.data.repeatType;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        if (this.passwordForm && this.repeatPassword) {
            this.loadLast();
        }
    }

    // 继承上次操作
    loadLast() {
        if (this.passwordForm.get('newPassword').value) {
            this.checkOldAndNew('oldPassword', 'newPassword', this.passwordForm.get('newPassword').value);
            this.checkTheSameOfNewPw(this.passwordForm.get('newPassword').value);
            this.passwordForm.get('newPassword').markAsTouched();
        }
        if (this.passwordForm.get('oldPassword').value) {
            this.checkOldAndNew('newPassword', 'oldPassword', this.passwordForm.get('oldPassword').value);
            this.passwordForm.get('oldPassword').markAsTouched();
        }
        if (this.repeatPassword.value) {
            this.checkTheSameOfRepeat(this.repeatPassword.value);
            this.repeatPassword.markAsTouched();
        }
    }


    /**校验方法*/
    checkTheSame(event, controlId, selfId) {
        if (selfId === 'newPassword') {
            if (this.newRepeatStamp) { // 确认密码相同校验
                clearTimeout(this.newRepeatStamp);
            }
            this.newRepeatStamp = setTimeout(() => {
                this.checkTheSameOfNewPw(event.target.value).then(() => this.passwordForm.get('newPassword').markAsTouched);
            }, 200);
        }
        if (this.newPwStamp) {  // 新旧密码不相同校验
            clearTimeout(this.newPwStamp);
        }
        this.newPwStamp = setTimeout(() => {
            this.checkOldAndNew(controlId, selfId, event.target.value).then(() => this.passwordForm.get(selfId).markAsTouched);
        }, 200);
    }

    // 新密码和确认密码不相同
    checkTheSameOfNewPw(value) {
        return new Promise<any>(resolve => {
            const newPassword = this.passwordForm.get('newPassword');
            if (this.repeatPassword.value && this.repeatPassword.value !== value) {
                let errors = newPassword.errors;
                if (!errors) {
                    errors = {notTheSame: true};
                    newPassword.setErrors(errors);
                    resolve(errors);
                }
            } else {
                if (this.repeatPassword.hasError('notTheSame')) {
                    const errors = this.repeatPassword.errors;
                    delete errors.notTheSame;
                    if (Object.values(errors).length > 0) {
                        this.repeatPassword.setErrors(errors);
                    } else {
                        this.repeatPassword.setErrors(null);
                    }

                }
            }
        });
    }

    // 新旧密码不相同校验
    checkOldAndNew(controlId, selfId, value) {
        return new Promise<any>(resolve => {
            const control = this.passwordForm.get(controlId);
            const self = this.passwordForm.get(selfId);
            if (control.value && control.value === value) {
                let errors = self.errors;
                if (!errors) { // 默认机制改变时errors会被重置 所以不用手动删除
                    errors = {isSame: true};
                    self.setErrors(errors);
                    resolve(errors);
                }
            } else {
                if (control.hasError('isSame')) {
                    const errors = control.errors;
                    delete errors.isSame;
                    if (Object.values(errors).length > 0) {
                        control.setErrors(errors);
                    } else {
                        control.setErrors(null);
                    }
                }
            }
        });
    }

    // 确认密码和新密码不相同
    checkRepeatSame(event) {
        if (this.repeatStamp) {
            clearTimeout(this.repeatStamp);
        }
        this.repeatStamp = setTimeout(() => {
            this.checkTheSameOfRepeat(event.target.value).then(() => {
                this.repeatPassword.markAsTouched();
            });
        }, 200);
    }

    // 确认密码和新密码不相同校验
    checkTheSameOfRepeat(value) {
        return new Promise<any>(resolve => {
            const newPassword = this.passwordForm.get('newPassword');
            if (newPassword.value && newPassword.value !== value) {
                let errors = this.repeatPassword.errors;
                if (!errors) {
                    errors = {notTheSame: true};
                    this.repeatPassword.setErrors(errors);
                    resolve(errors);
                }
            } else {
                if (newPassword.hasError('notTheSame')) {
                    const errors = newPassword.errors;
                    delete errors.notTheSame;
                    if (Object.values(errors).length > 0) {
                        newPassword.setErrors(errors);
                    } else {
                        newPassword.setErrors(null);
                    }
                }
            }
        });
    }

    // 修改任意用户的密码（管理员操作）
    changePassword(data) {
        return new Promise<any>((resolve, reject) => {
            this.loading.show();
            this.http.post(sessionStorage.getItem('baseUrl') + environment.changePassword, data).subscribe(res => {
                this.loading.hide();
                resolve(data);
            }, error1 => {
                this.loading.hide();
                reject(error1);
            });
        });
    }

    // 修改当前用户的密码
    changeSelfPassword(data) {
        return new Promise<any>((resolve, reject) => {
            this.loading.show();
            this.http.post(sessionStorage.getItem('baseUrl') + environment.changeSelfPassword, data).subscribe(res => {
                this.loading.hide();
                resolve(data);
            }, error1 => {
                this.loading.hide();
                reject(error1);
            });
        });
    }

    // 长期未修改密码强制修改密码
    forceChangePassword(data) {
        return new Promise<any>((resolve, reject) => {
            this.loading.show();
            this.http.post(sessionStorage.getItem('baseUrl') + environment.forceChangePassword, data).subscribe(res => {
                this.loading.hide();
                resolve(data);
            }, error1 => {
                this.loading.hide();
                reject(error1);
            });
        });
    }

}
