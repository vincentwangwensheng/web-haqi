import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {ActivityAnalysisAPI} from './ActivityAnalysisAPI';

@Injectable({
  providedIn: 'root'
})
export class ActivityAnalysisService {

  constructor(private  http: HttpClient, private utils: Utils) { }



    activityBrowse(acId){
        return this.http.get(sessionStorage.getItem('baseUrl') + ActivityAnalysisAPI.activityBrowse + '?activityId=' + acId );
    }


    getActivityList(page, size, sort, search?, filter?){
        filter = [{name: 'reviewResult', value: true} , {name: 'reviewStatus', value: true}];
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get(sessionStorage.getItem('baseUrl') + ActivityAnalysisAPI.activityList + searchApi , {observe: 'response'});
    }


    activityShare(acId){
        return this.http.get(sessionStorage.getItem('baseUrl') + ActivityAnalysisAPI.activityShare + '?activityId=' + acId );
    }

    activityCouPo(acId){
        return this.http.get(sessionStorage.getItem('baseUrl') + ActivityAnalysisAPI.activityCouPo + '?activityId=' + acId );
    }

    codeClear(activityNumber){
        return this.http.get(sessionStorage.getItem('baseUrl') + ActivityAnalysisAPI.codeClear + '?activityNumber=' + activityNumber );
    }

    storeCodeClear(activityNumber){
        return this.http.get(sessionStorage.getItem('baseUrl') + ActivityAnalysisAPI.storeCodeClear + '?activityNumber=' + activityNumber );
    }

}
