import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class LoopInfoService {

  constructor(private http: HttpClient) { }

  // 查询列表
  searchLoopList(param) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.loopInfo + param, {observe: 'response'});
  }
  // 新增数据
  createLoopData (param) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.loopInfo, param, {observe: 'response'});
  }

  // 删除数据
  deleteLoopData(id){
    return this.http.delete(sessionStorage.getItem('baseUrl') + environment.loopInfo + '/' + id , {observe: 'response'});
  }

  // 更新数据
  updateLoopData (param) {
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.loopInfo, param, {observe: 'response'});
  }

  //  批量新增或修改数据
  batchHandleData(param) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.batchHandleLoopInfo, param, {observe: 'response'});
  }



}
