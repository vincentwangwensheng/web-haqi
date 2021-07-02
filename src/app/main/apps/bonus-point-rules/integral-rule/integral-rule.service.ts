import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';
import {environment} from '../../../../../environments/environment.hmr';

@Injectable({
  providedIn: 'root'
})
export class IntegralRuleService {

  constructor(
      private http: HttpClient,
      private utils: Utils
  ) {
  }


  getBasicRuleByBlocIdAndMallId(blockId, mallId) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBasicRuleByBlockIdAndMallId + blockId + '/mall/' + mallId);
  }

  createBasicRule(basicRule) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.createBasicRule, basicRule);
  }

  createConsumeRule(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.createConsumeRule, data);
  }

  getConsumeRules () {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getConsumeRules);
  }

  deleteConsumeRule(id){
    return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deleteConsumeRule + id);
  }

  getInteractRules() {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getInteractRules);
  }

  updateInteractRules(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.getInteractRules, data);
  }


  createIntegralRule(data) {
    return this.http.post(sessionStorage.getItem('baseUrl') + environment.getPointRuleList, data);
  }

  getIntegralRuleDetail(id) {
    return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPointRuleList + '/' + id);
  }

  modifyIntegralRule(data) {
    return this.http.put(sessionStorage.getItem('baseUrl') + environment.getPointRuleList, data);
  }

}
