import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {Utils} from '../utils';

@Injectable({
    providedIn: 'root'
})
export class TerminalService {

    constructor(
        private utils: Utils,
        private http: HttpClient
    ) {
    }

    /** 航站楼地图数据相关接口*/
    // 航站楼信息
    // 新增航站楼
    createTerminal(terminalDTO): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createTerminal, terminalDTO, {observe: 'response'});
    }

    // 删除航站楼
    deleteTerminal(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deleteTerminal + '?id=' + id);
    }

    // 根据id获取航站楼基础数据
    getTerminalByNo(no) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTerminalByNo + '?terminalNo=' + no);
    }

    // 根据编号获取航站楼基础数据
    getTerminalById(id) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTerminalById + '?id=' + id);
    }

    // 获取航站楼列表
    searchTerminalList(page, size, sort): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchBasicsTerminalList +
            '?page=' + page + '&size=' + size + '&sort=' + sort);
    }

    // 更新航站楼信息
    updateTerminal(terminalDTO) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateTerminal, terminalDTO, {observe: 'response'});
    }

    // 批量单元号
    importArea(areaNos) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.importArea, areaNos);
    }

    // 文件管理

    // 批量下载历史svg地图
    downloadHistorySvgZip(vm) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.downloadHistorySvgZip, vm, {responseType: 'blob'});
    }

    // svg历史列表
    historySvgList(mallId, terminalNo): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.historySvgList + '?terminalNo=' + terminalNo + '&mallId=' + mallId);
    }

    // svg批量上传
    uploadSVGs(formData) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.uploadSVGs, formData);
    }

    // svg初始化下载
    initTerminal() {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.initTerminal, {responseType: 'blob'});
    }

    // 商户数据查询
    searchStoreLists(terminalNo, page, size, sort, search?, input?): Observable<any> {
        const tSearch = terminalNo ? 'terminalNo.contains=' + terminalNo + '&' : '';
        const pSearch = 'page=' + page + '&';
        const sSearch = 'size=' + size + '&';
        const sortSearch = sort ? 'sort=' + sort : '';
        const itemSearch = search ? '&' + search + '.contains=' + input : '';
        const searchApi = '?' +
            tSearch
            + pSearch
            + sSearch
            + sortSearch
            + itemSearch
        ;
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchBasicsStoreLists + searchApi
        );
    }

    // 根据商户编号获取商户
    getStoreByNo(storeNo): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getStoreByNo + '?storeNo=' + storeNo);
    }

    // 更新商户
    updateStore(storeDTO): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateStore, storeDTO, {observe: 'response'});
    }

    // 单元号-商户 关联/解除
    relationStore(relationStoreVm): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.relationStore, relationStoreVm, {observe: 'response'});
    }

    // 上传商户logo
    uploadStoreLogo(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.uploadLogo, formData, {responseType: 'text'});
    }

    // 获取业态列表
    getTypeList(): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTypeList);
    }

    // 获取业态列表
    getTypeListSearch(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTypeLists + searchApi , {observe: 'response'});
    }


    // 创建业态
    createType(businessType): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createType, businessType, {observe: 'response'});
    }

    // 更新业态
    updateType(businessType): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateType, businessType, {observe: 'response'});
    }

    // 删除业态
    deleteType(id): Observable<any> {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deleteType + '?id=' + id, {observe: 'response'});
    }


}
