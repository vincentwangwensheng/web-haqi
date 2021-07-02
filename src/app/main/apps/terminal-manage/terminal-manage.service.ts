import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TerminalManageService {

    constructor(
        private http: HttpClient,
        private utils: Utils
    ) {
    }

    // 商场autoSelect列表
    getMallList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

    // 街区列表
    getTerminalList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchTerminalList + searchApi);
    }

    createTerminalWithFloors(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createTerminals, data);
    }

    createTerminal(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createTerminal, data);
    }

    updateTerminal(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateTerminal, data);
    }

    getTerminalById(id) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTerminalById + '?id=' + id);
    }


    updateTerminalWithFloors(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateTerminals, data);
    }

    getTerminalWithFloorsById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTerminalsById + '?id=' + id);
    }

    // 获取楼层
    getFloors(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getFloorList + searchApi);
    }

    deleteFloor(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deleteFloor + '?id=' + id);
    }


    /**早期航站楼接口*/
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
    historySvgList(terminalNo): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.historySvgList + '?terminalNo=' + terminalNo);
    }

    // svg批量上传
    uploadSVGs(formData) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.uploadSVGs, formData);
    }

    // svg初始化下载
    svgInit(mallId, terminalNo) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.initTerminal + '?mallId=' + mallId + '&terminalNo=' + terminalNo, {responseType: 'blob'});
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
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTypeList + searchApi);
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

    // 导入摄像头
    importCameraNos(nos) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.importCameraNo, nos);
    }

    // 生成数据
    produceCameraNos(date, terminalNo) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.produceCameraData + '?date=' + date + '&terminalNo=' + terminalNo);
    }

}
