import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(
        private http: HttpClient
    ) {
    }

    // 暂用获取令牌
    getToken(username) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getToken + '?username=' + username, {
            observe: 'response',
            responseType: 'text'
        });
    }

    // keyCloak登录
    thirdPartyLogin(code: string, state: string) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.thirdPartyLogin + '?state=' + state + '&code=' + code, {observe: 'response'});
    }
}
