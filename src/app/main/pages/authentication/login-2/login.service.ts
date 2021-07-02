import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    constructor(private http: HttpClient) {
    }

    // 用户登录
    authLogin(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.login, data, {observe: 'response'});
    }
}
