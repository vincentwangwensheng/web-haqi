import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {environment} from '../../../../environments/environment.hmr';

@Injectable({
    providedIn: 'root'
})
export class BsTypeService {

    constructor(private http: HttpClient,
                private utils: Utils) {
    }

    searchTypes(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.searchTypes + searchApi, {observe: 'response'});
    }

    getTypeById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getTypeById + '?id=' + id);
    }

    postType(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.postType, data);
    }

    putType(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.putType, data);
    }

    deleteTypeById(id) {
        return this.http.delete(sessionStorage.getItem('baseUrl') + environment.deleteBType + '?id=' + id);
    }
}
