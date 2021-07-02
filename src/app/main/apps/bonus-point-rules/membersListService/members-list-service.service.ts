import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';

@Injectable({
  providedIn: 'root'
})
export class MembersListServiceService {

  constructor(
      private  http: HttpClient,
      private utils: Utils
  ) { }



    // 成员--->多条件查询
     getMemberList(page, size, sort, search? ): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search );
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getMemberList + searchApi
        , {observe: 'response'} );
    }

    // 成员--->获取单个成员的值
    getMemberById(id){
        return this.http.get<MemberListEntity>(sessionStorage.getItem('baseUrl') + environment.getMemberById + '?id=' + id);
    }

   // 成员--->成员更新
    updateMember(m: MemberListEntity){
      return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateMember , m , {observe: 'response'});
    }

    // 成员--->成员新增
    createMember(m: MemberListEntity){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createMember, m,
            {observe: 'response'});
    }


    // 积分规则 -- 积分列表
    getRuleList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getRuleList + searchApi
        );
    }
   // 积分规则 --- 新增互动积分
    createRule(rule: any){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createRule, rule,
            { observe: 'response', headers: { 'Content-Type' : 'application/json'} });
    }

    // 积分规则 --- 积分规则详情
    getRuleById(id){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getRuleById + '?id=' + id);
    }

    // 积分规则 --- 修改积分规则
    updateRule(rule: any){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateRule, rule,
            { observe: 'response', headers: { 'Content-Type' : 'application/json'} });
    }


    // 获取周期参数
    getInteractRulePeriod(){
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getInteractRulePeriod );
    }

    // 店铺规则集合查询
    getRuleStores(): Observable<any>{
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getRuleStores);
    }

}



export class MemberListEntity {
    id: string;
    memberId: string;
    memberName: string;
    authMethod: string;
    url: string;
    username: string;
    password: string;
    appID: string;
    appSecret: string;
    enabled: boolean;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

export class RuleDTO {
    id: string;
    ruleName: string;
    type: string;
    desc: string;
    enabled: boolean;
    amount: string;
    point: number;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

export class InteractRuleDTOS {
    id: string;
    name: string;
    desc: string; // 规则描述
    enabled: boolean;
    app: boolean; // APP
    applet: boolean; // 小程序
    period: string;   // 日期
    upperLimit: number;  // 积分上限
    point: number;  // 积分
    ruleId: string;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

export class StoreDTOS {
    id: string;
    ruleId: string;
    storeName: string;
    storeNo: string;
    disabled: boolean;
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}


export class SysParam {
    authMethodName: string;
    authMethodTypes: any[] = []; // 认证方式
    EditStruts: boolean;        // 是否为编辑状态
    selectAuthMethodStruts: boolean; // 是否为选择框
    pwdType: string;            // 密码输入框的type
    ShowPwd: boolean;           // 控制眼睛是睁开还算关闭
    AppSecretType: string;            // AppSecret输入框的type
    showAppSecret: boolean;        // AppSecret 控制眼睛是睁开还算关闭
    StrutsName = '正常';         // 状态默认
    StrutsSource: Array<{id: number | null | undefined | string | boolean , name: number | null | undefined | string | boolean}>;
}