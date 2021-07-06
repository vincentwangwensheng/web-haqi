import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../../environments/environment.hmr';
import {Utils} from '../../../../../services/utils';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class EditStoreService {

    constructor(private http: HttpClient,
                private utils: Utils) {
    }

    // 品牌列表
    getBrandList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBrandList + searchApi);
    }

    // 商场列表
    getMallList(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

    // 街区列表
    getTerminalList(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchBasicsTerminalList + searchApi);
    }

    // 单元号列表（临时
    getAreaList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getAreaList + searchApi);

    }

    // 根据mallId获取mall的业态
    getMallByMallId(mallId) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMallByMallId + '?mallId=' + mallId);
    }

    // 一级业态
    getTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTypeList);
    }

    // 二级业态
    getSecondTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getSecondTypeList);
    }

    createStore(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.createStore, data);
    }

    updateStore(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateStore, data);
    }

    getStoreById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoreById + '?id=' + id);
    }


    /**标签相关*/
    getStoreTagsById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoreTagsById + '?storeId=' + id);
    }

    setStoreTags(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.setStoreTags, data);
    }

    getBrandTagsById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBrandTagsById + '?brandId=' + id);
    }
}
