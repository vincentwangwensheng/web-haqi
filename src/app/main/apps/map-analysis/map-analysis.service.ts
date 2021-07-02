import {Injectable} from '@angular/core';
import {Utils} from '../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapAnalysisService {
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
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBlocList + searchApi);
    }

    // 商场autoSelect列表
    getMallList(page, size, sort, search?, filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMallList + searchApi);
    }

    // 街区列表
    getTerminalList(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchTerminalList + searchApi);
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
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchStoreLists + searchApi);
    }

    // 获取单元号
    getAreaHot(terminalNo) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getAreaHot + '?terminalNo=' + terminalNo);
    }

    // 获取商户销售数据
    getSaikuData(param) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchSaikuData + '?param=' + param);
    }

    // 获取摄像头热力数据
    getCameraHot(date, terminalNo) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCameraByTerminalNO + '?date=' + date + '&terminalNo=' + terminalNo);

    }

}
