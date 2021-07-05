import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {Utils} from '../utils';
import {HttpClient} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TagManagementService {

    constructor(private  http: HttpClient,
                private utils: Utils) {
    }


    // 获取标签列表
    searchTagList(page, size, sort, search?, filter?): Observable<any> {
        // const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        // return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchLabelList + searchApi, {observe: 'response'});
        return this.http.get('configData/tag-management/searchLabelList.json');
    }

    // 获取标签详情
    getLabelById(id): Observable<any> {
        // return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchLabelList + '?id.equals=' + id);
        return this.http.get('configData/tag-management/searchLabelListById.json');
    }

    // 新增商户标签数据
    createMerchantTagList(param): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createMerchantTagList, param);
    }

    // 更新商户标签内容
    updateMerchantTag(param): Observable<any> {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.updateMerchantTag, param);
    }
}


// 商户标签数组
export interface MerchantsTagManagementEntity {
    id: string;
    name: string;
    storeNumber: string;
    desc: string;
    enabled: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    first: string;
    second: string;
}

export class Tags {
    id: string;
    tagName: string; // 标签名称
    firstLevel: string; // 一级标签
    secondLevel: string; // 二级标签
    tagRemarks: string; // 说明
    tagType: string; // 类型
    tagSource: string; // 来源
    memberTags: string;
    memberStoreTags: string;
    memberActivityTags: string;
}
