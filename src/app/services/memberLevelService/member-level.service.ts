import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {Utils} from '../utils';
import {CouponEntity} from '../EcouponService/ecoupon-service.service';

@Injectable({
  providedIn: 'root'
})
export class MemberLevelService {

  constructor(private http: HttpClient, private utils: Utils) { }

  searchMemberLevelList(param?){
    if (param) {
      return this.http.get(sessionStorage.getItem('baseUrl') + environment.memberLevel + param, {observe: 'response'});
    } else {
      return this.http.get(sessionStorage.getItem('baseUrl') + environment.memberLevel, {observe: 'response'});
    }
  }

  // 新增会员卡
  createMemberLevel(param){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.memberLevel, param, {observe: 'response'});
  }

  // 编辑更新会员卡
  updateMemberLevelData(param){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.memberLevel, param, {observe: 'response'});
  }

  // 编辑更新多张会员卡
  updateMemberLevels(param){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.updateMemberLevels, param, {observe: 'response'});
  }

  // 编辑更新多张会员卡权益
  updateLevelremarks(param){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.updateLevelremarks, param, {observe: 'response'});
  }

  deleteMemberLevelData(id) {
    return this.http.delete(sessionStorage.getItem('baseUrl') + environment.memberLevel + '/' + id,
        {observe: 'response'});
  }

  searchMemberCardList(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.memberLevel + searchApi
        , {observe: 'response'});
  }

  // 导出会员列表
  toExportMemberList(page, size, sort, search?) {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.exportMemberList + searchApi,
        {observe: 'response', responseType: 'blob'});
  }

  // 获取会员导入模板
  toGetMemberTemplate() {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMemberTemplate,
        {observe: 'response', responseType: 'blob'});
  }

  toGetGroupMembers(id) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getGroupMembers + id,
        {observe: 'response', responseType: 'blob'});
  }


  // 导入会员
  toGetMemberImport(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.getMemberImport, data,
        { reportProgress: true, observe: 'events'});
  }

  /********************** 拍照积分 **********************/
  // 获取拍照积分列表
  searchSelfPointsList(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.selfPoints + searchApi
        , {observe: 'response'});
  }

  // 根据id获取拍照积分详情
  getSelfPointDetailById(id){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.selfPointsById + id);
  }

  // 拍照积分-通过
  getSelfPointPass(data){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.selfPointsPass, data);
  }

  // 拍照积分-驳回
  getSelfPointRefuses(data){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.selfPointsRefuse, data);
  }

  // 获取是否自动审核状态
  toGetAutoAdopt(){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getAutoAdopt);
  }

  // 设置是否自动审核
  toSetAutoAdopt(isAutoAdopt){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.setAutoAdopt + '?isAutoAdopt=' + isAutoAdopt);
  }

  /********************** 常旅客分群 **********************/
  // 获取常旅客分群列表
  searchMemberGroupList(page, size, sort, search?): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search);
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getAllMemberCategories + searchApi
        , {observe: 'response'});
  }

  // 常旅客分群-新增
  toCreateMemberCategory(data){
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.createMemberCategory, data);
  }

  // 常旅客分群-更新
  toUpdateMemberCategory(data){
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.updateMemberCategory, data);
  }

  // 常旅客分群-删除
  toDeleteMemberCategory(id){
    return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deleteMemberCategory + id);
  }

  // 根据id获取常旅客分群信息
  toGetMemberCategory(id){
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMemberCategory + id);
  }

  // 根据页面的relationShip查询复合条件的所有会员价的手机号
  toGetMobilesWithMemberCategory(data){
    return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.getMobilesWithMemberCategory, data);
  }

  // 根据一堆mobiles查询出所有信息
  toGetAllMembersByMobiles(page, size, sort, mobiles): Observable<any> {
    const searchApi = this.utils.getMultiSearch(page, size, sort);
    return this.http.post<CouponEntity[]>(sessionStorage.getItem('baseUrl')  + environment.getAllMembersByMobiles + searchApi, mobiles, {observe: 'response'});
  }

  toGetAllMembersByMobilesData(page, size, sort, mobiles) {
    const searchApi = this.utils.getMultiSearch(page, size, sort);
    return this.http.post(sessionStorage.getItem('baseUrl')  + 'member/api/members/getAllMembersByMobiles' + searchApi, mobiles, {observe: 'body'});
  }



  // 商场autoSelect列表
  getMallList(page, size, sort, search?, filter?) {
    const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
    return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getBasicsMallList + searchApi);
  }

  // 为成员添加标签
  toGetTagMemberCategories(categoryId): Observable<any> {
    return this.http.get<CouponEntity[]>(sessionStorage.getItem('baseUrl')  + environment.getTagMemberCategories + '?categoryId=' + categoryId);
  }
}
