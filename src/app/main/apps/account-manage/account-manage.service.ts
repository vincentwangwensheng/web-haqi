import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.hmr';
import {Utils} from '../../../services/utils';

@Injectable({
    providedIn: 'root'
})
export class AccountManageService {

    constructor(private http: HttpClient,
                private utils: Utils) {
    }

    getAccountList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        // return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.account + searchApi, {observe: 'response'});
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + 'backend/api/account' + searchApi, {observe: 'response'});
    }

    createAccount(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.account, data);
    }

    updateAccount(data) {
        return this.http.put<any>(sessionStorage.getItem('baseUrl') + environment.account, data);
    }

    getAccountByUsername(username) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.account + '/' + username);
    }

    // 集团autoSelect
    getBlocList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBlocBasicsList + searchApi);
    }

    // 获取集团
    getBlocById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBlocById + '?id=' + id);
    }

    getBlocByBlocId(blocId) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBlocByBlocId + '?blocId=' + blocId);
    }

    // 商场autoSelect列表
    getMallList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

    // 获取商场
    getMallById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMallById + '?id=' + id);
    }

    getMallByMallId(mallId) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMallByMallId + '?mallId=' + mallId);
    }

    // 街区列表
    getTerminalList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchBasicsTerminalList + searchApi);
    }

    // 获取街区
    getTerminalById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTerminalById + '?id=' + id);
    }

    getTerminalByTerminalId(terminalId) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTerminalByTerminalId + '?terminalId=' + terminalId);
    }


    searchStores(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchStoreLists + searchApi);
    }

    getStoreByStoreId(storeId) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoreByStoreId + '?storeId=' + storeId);
    }
}
