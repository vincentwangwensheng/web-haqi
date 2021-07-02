import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable()
export class MessageSubscribeService {

  constructor(private  http: HttpClient,
              private utils: Utils) { }

  // 获取消息供应商列表(get)
  getMessageProviderTemplate(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMessageProviderTemplate
        + searchApi , {observe: 'response'});
  }

  // 获取消息供应商列表数量(get)
  getMessageProviderTemplateCount(): Observable<any> {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMessageProviderTemplateCount);
  }

  // 根据id获取消息供应商(get)
  getMessageProviderTemplateById(id){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMessageProviderTemplateById + id) ;
  }

  // 新增消息供应商(post)
  addMessageProviderTemplate(data){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.addMessageProviderTemplate, data);
  }

  // 更新消息供应商(put)
  updateMessageProviderTemplate(data){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.updateMessageProviderTemplate, data);
  }

  // 微信接口--获取当前帐号下的个人模板列表
  weChatTemplateList(){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.weChatTemplateList) ;
  }

  // 获取消息供应商的类型(get)
  getProviderTypeList(){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getProviderTypeList);
  }

  // 获取数据字典(get)
  getDictionaries(){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getDictionaries);
  }

  // 获取消息供应商列表(get)
  toGetQRCodesList(page, size, sort, search?, filter?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getQRCodesList
        + searchApi , {observe: 'response'});
  }

  // 新增消息供应商(post)
  toAddQRCodesList(data){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.addQRCodesList, data);
  }

  // 二维码类型(get)
  getQRCodesTypes(){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getQRCodesTypes);
  }

}
