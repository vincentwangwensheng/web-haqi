import {Injectable} from '@angular/core';
import {Utils} from '../../../services/utils';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class RoleManageService {

    constructor(private utils: Utils,
                private http: HttpClient) {
    }

    getRoleList(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.roleList + searchApi, {observe: 'response'});
    }

    createRole(data) {
        return this.http.post<any>(sessionStorage.getItem('baseUrl') + environment.role, data);
    }

    updateRole(data) {
        return this.http.put<any>(sessionStorage.getItem('baseUrl') + environment.role, data);
    }

    getRoleById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.role + '/' + id);
    }

    // 查询权限列表
    getAuthorityList(page, size, sort) {
        const searchApi = this.utils.getMultiSearch(page, size, sort);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.authority + searchApi);
    }

}
