import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class PlanServiceService {

    constructor(private http: HttpClient) {
    }

    createPlan(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createPlan, data);
    }

    updatePlan(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updatePlan, data);
    }

    deletePlan(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deletePlan + '?id=' + id);
    }

    getPlanById(id) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPlanById + '?id=' + id);
    }

    getPlanList(page, size, sort, search?) {
        const searchApi = '?page=' + page + '&size=' + size + '&sort' + sort + (search ? search : '');
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getPlanListVM + searchApi);
    }
}
