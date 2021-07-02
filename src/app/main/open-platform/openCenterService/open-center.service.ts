import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Utils} from '../../../services/utils';

@Injectable({
  providedIn: 'root'
})
export class OpenCenterService {

  constructor(
      private  http: HttpClient,
      private  utils: Utils
  ) { }


    // 上传图片
    FileUpload(formData): Observable<any> {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text'});
    }

    // 文件预览
    previewFile(saveId): Observable<any> {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + saveId , {responseType: 'blob'} );
    }

    // swagger API 接口 获取 urls参数
    swaggerResources(): Observable<any>{
        const corsHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Methods': 'GET,PUT,POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': 'http://localhost:4200/open/openSwagger'
        });
        return this.http.get<any>(sessionStorage.getItem('swaggerUrl') + environment.swaggerResources
            , {headers: corsHeaders});
    }

    // 获取对应的 docs 文件
    apiDocs(): Observable<any>{
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.apiDocs + '?group=openapi' );
    }

    //  暂时没有获取到
    swaggerInfo(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('swaggerUrl') + environment.swaggerInfo );
    }

    // 登陆获取 api 的 tocken
    apiGetToken(): Observable<any> {
        const corsHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Methods': 'GET,PUT,POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Origin': '*'
        });
        const login = {username: 'admin', password: 'admin', rememberMe: false};
        return this.http.post(sessionStorage.getItem('swaggerUrl') + environment.apiGetToken , login , {headers: corsHeaders});
    }




    // 开发者列表
    getAttestReview(page, size, sort, search? , filter?): Observable<any>{
        const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
        return this.http.get(sessionStorage.getItem('baseUrl')  + environment.attestReview
            + searchApi , {observe: 'response'});
    }

    // 当前申请
    attestDetail(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.attestDetail );
    }

    // 判断是否有未审核认证请求
    attestExist(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.attestExist );
    }

    // 提交身份认证申请
    attest(attestValue): Observable<any>{
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.attest, attestValue);
    }

    // 身份认证审核
    Examine(attestValue): Observable<any>{
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.attestReview, attestValue);
    }

    // 开放平台发送验证码
    captcha(p): Observable<any>{
        const attestValue = {  'mobile': p };
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.captcha, attestValue);
    }

    // 注册
    registry(registryVM): Observable<any>{
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.registry, registryVM);
    }


    // 开发者资料
    InterfaceOpenApi(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.InterfaceOpenApi );
    }

    // 提交接口申请
    openapiSubmit(submitVM){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.openapiSubmit, submitVM);
    }

    // 申请接口  待审核列表
    openapiReview(page, size, sort, search? , filter?): Observable<any>{
        const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.openapiReview
            + searchApi , {observe: 'response'});
    }

    // 申请接口  拿到tocken
    openapiToken(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.openapiToken );
    }

    // 申清接口 审核
    openapiExamine(reviewVM){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.openapiReview, reviewVM);
    }

    // 当前接口申请
    openapiDetail(): Observable<any>{
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.openapiDetail );
    }


}
