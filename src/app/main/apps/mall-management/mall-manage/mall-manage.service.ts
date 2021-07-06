import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {environment} from '../../../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MallManageService {

    constructor(
        private http: HttpClient,
        private utils: Utils
    ) {
    }

    getMallList(page, size, sort, search? , popUpYes? ): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        let url = environment.getMallList;
        if (popUpYes){
            url = environment.getBasicsMallList;
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + url + searchApi);
    }

    getMallById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMallById + '?id=' + id);
    }

    createMall(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createMall, data);
    }

    updateMall(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateMall, data);
    }

    // 一级业态
    getTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTypeList);
    }

    // 二级业态
    getSecondTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getSecondTypeList);
    }
}
