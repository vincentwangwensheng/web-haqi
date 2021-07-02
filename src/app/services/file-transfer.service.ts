import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment.hmr';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileTransferService {

  constructor(public http: HttpClient) { }

  // 文件预览
  previewFile(saveId): Observable<any> {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + saveId , {responseType: 'blob'} );
  }

  // 文件上传
  uploadFile(formData): Observable<any> {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData, {responseType: 'text' , reportProgress: true , observe: 'events'});
  }

  uploadFileNotBar(formData): Observable<any>{
      return this.http.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
          {responseType: 'text'});
  }


}
