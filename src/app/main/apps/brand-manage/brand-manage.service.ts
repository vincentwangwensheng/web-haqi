import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class BrandManageService {

  constructor(public http: HttpClient, private utils: Utils) { }

  //  新建品牌信息
  createBrandInfo(model) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.createBrandInfo, model, {observe: 'response'});
  }

  //  获取品牌列表
  multiSearchBrandLists(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBrandList + searchApi
        , {observe: 'response'});
  }

  //  根据id获取品牌详情
  getBrandDetailById(id){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBrandDetailById + '?id=' + id);
  }

  // 更新品牌信息
  updateBrandInfo(model){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateBrandInfo, model, {observe: 'response'});
  }


   // 获取对应的品牌标签
    getTagsByBrand(brandId){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTagsByBrand + '?brandId=' + brandId);
    }

    // 根据品牌识别号设置其所需要的标签
    setBrandTags(brandTags){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.setBrandTags, brandTags, {observe: 'response'});
    }

    // 上传不返回进度
    FileUploadNotBar(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text'});
    }
}


export class BrandTag {
    brandId: string;
    tagList: [];
}