import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {environment} from '../../../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(
      private http: HttpClient ,
      private utils: Utils
  ) { }


    // 事件列表
    getIncidentList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getIncidentList
            + searchApi , {observe: 'response'});
    }

    // 新增
    incidents(incident){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.incidents, incident);
    }

    // 修改
    updateIncident(incident){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateIncident, incident);
    }

    // 详情
    getIncidentById(id): Observable<Incident>{
        return this.http.get<Incident>(sessionStorage.getItem('baseUrl') + environment.getIncidentById + '?id=' + id) ;
    }

    // 申请列表
    getApplyList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getApplyList
            + searchApi , {observe: 'response'});
    }

    // 申请状态
    getApplyStatus(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getApplyStatus ) ;
    }

    // 后台提交审核
    applies(apply){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateApply, apply);
    }

    // 后台提交履约
    performance(applyId , mobile){
        const vm = {applyId: applyId , mobile: mobile};
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.appointmentApp1y + '?applyId=' + applyId + '&mobile=' + mobile , vm);
    }

    // 后台根据ID获取详情
    getApplyById(id){
        return this.http.get<Apply>(sessionStorage.getItem('baseUrl') + environment.getApplyById + '?id=' + id) ;
    }

    // 上传不返回进度
    FileUploadNotBar(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text'});
    }



    // 预约类型
    getIncidentType(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getIncidentType ) ;
    }

    // 图片上传 返回进度
    CouponFileUpload(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text', reportProgress: true, observe: 'events'});
    }

    // 图片预览
    ShowImg(saveid): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + saveid, {responseType: 'blob'});
    }

    // 新建事件----获取报名方式类型
    getApplyType(){
      return this.http.get(sessionStorage.getItem('baseUrl') + environment.getApplyType)
    }

}


export class Incident {
    incidentId: string; // 预约事件编号
    incidentName: string; // 预约事件名称
    type: string; // 类型 （场地预约/服务预约/活动报名）
    desc: string;
    beginTime: string;
    endTime: string;
    image: string; // 上传的图片
    membersLimit: string;  // 会员限制（用逗号分割）
    paidRegistration: boolean; // 付费报名
    paidAmount: number; // 付费金额
    paymentProvider: string; // 支付供应商
    automatic: boolean; // 自动确认
    sms: boolean;   // 短信
    reception: boolean;  // 接待限制
    receptionCount: number; // 接待数量
    sponsor: string; // 主办方
    sitLocation: string; // 地点位置
    mallId: string; // 商场ID
    mallName: string; // 商场名称
    enabled: boolean; // 是否有效
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: number;
}

export class Apply {
    id: number;
    applyId: string; // 申请编号
    applyMobile: string; // 申请人 （电话）
    applyName: string;  // 申请人 昵称
    automatic: boolean;  // 自动确认
    beginTime: string;
    endTime: string;
    remainCount: string; // 预约限制  -1为无限制，其他数字为限制次数
    incidentId: string;  // 申请事件编号
    incidentName: string;   // 申请事件名称
    type: string; // 事件类型
    reject: string;  // 驳回理由
    status: string;  // 状态
    enabled: boolean; // 是否有效
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

export class ApplyStruts {
    key: string;
    value: string;
}
