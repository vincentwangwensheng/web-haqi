import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';
import {Utils} from '../../../../services/utils';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TerminalMapService {

    constructor(private utils: Utils,
                private http: HttpClient) {
    }

    // 品牌autoSelect
    getBrandList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBrandList + searchApi);
    }

    // 根据id查询品牌标签
    getBrandTagsById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBrandTagsById + '?brandId=' + id);
    }

    // 设置商户的标签
    setStoreTags(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.setStoreTags, data);
    }

    // 二级业态
    getSecondTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getSecondTypeList);
    }

    // 根据商户id获取标签
    getStoreTagsById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoreTagsById + '?storeId=' + id);
    }

    // 集团autoSelect
    getBlocList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBlocBasicsList + searchApi);
    }

    // 商场autoSelect列表
    getMallList(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

    // 街区列表
    getTerminalList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchBasicsTerminalList + searchApi);
    }

    // 根据id获取带楼层的街区
    getTerminalWithFloorsById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTerminalsById + '?id=' + id);
    }

    // 根据terminalNo获取街区和楼层信息
    getTerminalWithFloorsByNo(no) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTerminalsByNo + '?terminalNo=' + no);
    }

    // svg初始化下载
    svgInit(mallId, terminalNo) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.initTerminal + '?mallId=' + mallId + '&terminalNo=' + terminalNo, {responseType: 'blob'});
    }

    // 查询商户包括业态
    searchStoreList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchStoreList + searchApi);
    }

    // 商户数据查询
    searchStoreLists(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchBasicsStoreLists + searchApi);
    }

    // 关联商户单元号
    relationStore(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.relationStore, data, {observe: 'response'});
    }

    // 删除商户单元号关联
    deleteRelation(areaNo, storeNo) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.relieveStore + '?areaNo=' + areaNo + '&storeNo=' + storeNo, {observe: 'response'});
    }


}
