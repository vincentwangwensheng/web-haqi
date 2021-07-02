import { Injectable } from '@angular/core';
import {Utils} from '../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class PortraitServiceService {

  constructor(
      private http: HttpClient ,
      private utils: Utils
  ) { }

   // 获取常旅客来源
    customSource(): Observable<any> {
        return this.http.get( sessionStorage.getItem('baseUrl') + environment.customSource
            , {observe: 'response'});
    }

    // 获取一级业态
    customGetTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.customGetTypeList);
    }

    // 二级业态
    customGetSecondTypeList() {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.customGetSecondTypeList);
    }

    getMemberProfile(para){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getMemberProfile + para);
    }



}



export class Portrait {
  
}