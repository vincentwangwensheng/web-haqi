import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {Utils} from '../../services/utils';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UploadAndReviewService {

  constructor(private utils: Utils,
              private http: HttpClient) { }

  // 文件预览
  previewFile(saveId): Observable<any> {
    return this.http.get(sessionStorage.getItem('baseUrl') + 'file/api/file/showImg' + '?saveId=' + saveId, {responseType: 'blob'});
  }

  // 文件上传接口
  uploadFile(formData): Observable<any> {
    return this.http.post(sessionStorage.getItem('baseUrl') + 'file/api/file/upload', formData, {
      responseType: 'text',
      reportProgress: true,
      observe: 'events'
    });
  }
}
