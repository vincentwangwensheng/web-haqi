import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.hmr';
import {Utils} from '../../../services/utils';

@Injectable({
    providedIn: 'root'
})
export class StoreManageService {

    constructor(private  http: HttpClient,
                private utils: Utils) {
    }


    getStoreList(PageIndex_, pageRows): Observable<StoreList[]> {
        return this.http.get<StoreList[]>(sessionStorage.getItem('baseUrl') + environment.getStoreList + '?page=' + PageIndex_ + '&size=' + pageRows);
    }

    getStoreTotalList(): Observable<StoreList[]> {
        return this.http.get<StoreList[]>(sessionStorage.getItem('baseUrl') + environment.getStoreList);
    }

    getStoreListByCondition(Condition): Observable<StoreList[]> {
        return this.http.get<StoreList[]>(sessionStorage.getItem('baseUrl') + environment.searchStoreLists + Condition);
    }

    getStoreListById(id): Observable<StoreList> {
        return this.http.get<StoreList>(sessionStorage.getItem('baseUrl') + environment.getStoreListById + '?id=' + id);
    }

    // 解冻冻结
    updateStoreFrozen(enabledVM) {

        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateStoreFrozen, enabledVM,
            {observe: 'response'});
    }

    // 获取航站楼列表
    searchTerminalList(page, size, sort): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchTerminalList +
            '?page=' + page + '&size=' + size + '&sort=' + sort);
    }

    // 多条件查询
    multiSearchStoreLists(page, size, sort, search? , filter? , popUpYes?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
        let url = environment.searchStoreLists;
        if (popUpYes){
            url = environment.searchBasicsStoreLists;
        }
        return this.http.get(sessionStorage.getItem('baseUrl') + url + searchApi
        );
    }

    // 更新商户列表
    updateStore(enabledVM) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateStore, enabledVM,
            {observe: 'response'});
    }

    // 获取单元号列表
    getAreaList(page, size, sort): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getAreaList +
            '?page=' + page + '&size=' + size + '&sort=' + sort);
    }

    // 上传Logo
    uploadLogo(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.uploadLogo, formData, {responseType: 'text'});
    }

    // 获取业态列表
    getTypeList(): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTypeList);
    }

    // 商户--获取标签列表
    searchLabelList(page?, size?, sort?): Observable<any> {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchLabelList +
            '?page=' + page + '&size=' + size + '&sort=' + sort);
    }



    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

}


export class HeaderEntity {
    idNumber: string;
    areaNo: string;  // 单元号
    brandCN: string; // 品牌中文名
    brandEN: string; // 品牌英文名
    businessType: string;  // 业态
    floor: string; // 楼层
    lastModifiedBy: string; // 修改人
    lastModifiedDate: string; // 修改时间
    showName: string;  // 显示名称
    storeName: string; // pos商户名称
    storeNo: string;  // pos商户编号
    terminalName: string; // 航站楼
    enabled_: string;  // 是否有效
    dataDetail: string; // 详情。不算进表中
    constructor() {
    }
}

// 商户列表
export class StoreList {
    id: string;
    idNumber: number;
    areaNo: string;  // 单元号
    brandCN: string; // 品牌中文名
    brandEN: string; // 品牌英文名
    businessType: string;  // 业态
    floor: string; // 楼层
    lastModifiedBy: string; // 修改人
    lastModifiedDate: string; // 修改时间
    showName: string;  // 显示名称
    searchName: string; // 搜索别名
    storeName: string; // pos商户名称
    storeNo: string;  // pos商户编号
    terminalName: string; // 航站楼
    labels: StoreLabel[]; // 当前对应的标签
    terminalNo: string; // 航站楼编号
    createdBy: string;  // 创建人
    createdDate: string; // 创建时间
    enabled: boolean;  // 是否有效
    enabled_: string;  // 是否有效
    logo: string;       // logo
    source: string;  // 来源
    desc: string; // 描述
    mallId: number; // 商场编号
    mallName: string; // 商场名称
    dataDetail: string; // 详情。不算进表中

    constructor() {
    }
}

// 商户列表用到的标签或详情
export class StoreLabelList {
    id: string;
    name: string;
    storeNumber: string;
    desc: string;
    enabled: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    MerchantsChecked: boolean;

    constructor() {
    }
}

// 商户列表用到的标签或详情
export class StoreLabel {
    id: string;
    name: string;
    desc: string;
    enabled: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;

    constructor() {
    }
}


