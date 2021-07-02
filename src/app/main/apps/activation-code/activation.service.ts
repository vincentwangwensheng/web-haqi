import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class ActivationService {

    constructor(private http: HttpClient,
                private utils: Utils) {
    }

    // 列表查询
    getCodeList(page, size, sort, multiSearch?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, multiSearch);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getCodeList + searchApi);
    }

    // 生成激活码
    createCode(codeVm) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createCode, codeVm);
    }

    // 冻结解冻
    changeStatus(validityVm) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.changeStatus, validityVm);
    }
}
