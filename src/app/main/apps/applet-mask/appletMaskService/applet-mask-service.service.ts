import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class AppletMaskServiceService {

  constructor(
      private  http: HttpClient,
      private utils: Utils
  ) { }


    // 列表
    searchPopupInfos(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.PopupInfoShow
            + searchApi , {observe: 'response'});
    }

    // 列表页数量
    getPopupInfoCount(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPopup_infoCount) ;
    }

    // 新增
    CreatPopupInfo(popupInfo){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.PopupInfo_list_add_update, popupInfo);
    }

    // 修改
    UpdatePopupInfo(popupInfo){

        return this.http.put(sessionStorage.getItem('baseUrl') + environment.PopupInfo_list_add_update, popupInfo);
    }

    // 详情
    getPopupInfo(id): Observable<PopupInfo>{
        return this.http.get<PopupInfo>(sessionStorage.getItem('baseUrl') + environment.PopupInfo_list_add_update + '/' + id) ;
    }


    // 上架  -- 》 设置为不可用  activityPopup
    setActivityPopup(id, mallId): Observable<any>{
        const popV =  {
            mallId: mallId,
            popupId: id
        };
        // @ts-ignore
        return this.http.put<any>(sessionStorage.getItem('baseUrl') + environment.putPopupConfigurations, popV, {responseType: 'text'}) ;
    }

    // 下架 传的是当前条活跃蒙屏的ID
    putPopupConfigurations(mallId): Observable<any>{
        const popV =  {
            mallId: mallId,
            popupId: null
        };
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.putPopupConfigurations, popV , {responseType: 'text'});
    }


    // 查出当前条蒙屏的活跃状态 蒙屏列表的ID
    getPopupConfigurations(id){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPopupConfigurations + '/' + id , {responseType: 'text'}) ;
    }

    // 查出当前所有可用的蒙屏的列表
    getPopupConfigurationsList():  Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getPopupConfigurations ) ;
    }



    // 上传图片
    CouponFileUpload(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text', reportProgress: true, observe: 'events'});
    }

    // 预览图片
    CouponShowImg(saveid): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + saveid, {responseType: 'blob'});
    }


    // 根据参数获取分组活动数据
    getCouponGroupsData(id) {
        const param = '?activityId.equals=' + id  + '&sort=name';
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.createCouponGroupsData + param, {observe: 'response'});
    }

    // 获取营销列表详情
    searchActivityListById(param) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.searchMarketingManageList + '/' + param, {observe: 'response'});
    }

    // 获取电子券列表的接口
    getCouponList(ac_id){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getCouponList + '?activityId=' + ac_id, {observe: 'response'});
    }

    // 商场autoSelect列表
    getMallList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
    }

}


export class PopupInfo {
    id: number;
    popupId: string;
    popupName:  string;
    mallName?: string;
    mallId?: string;
    popupStartTime:  string;
    popupEndTime:  string;
    popupType:  string;
    popupPattern: string;
    popupLink:  string;
    outLink:  boolean;
    popupStatus: string;
    popupActivityId:  string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}
