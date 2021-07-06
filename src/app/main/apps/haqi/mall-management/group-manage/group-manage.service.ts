import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../../services/utils';
import {environment} from '../../../../../../environments/environment.hmr';
import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GroupManageService {

    constructor(
        private http: HttpClient,
        private utils: Utils
    ) {
    }

    getBlocList(page, size, sort, search? , popUpYes?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        let url = environment.getBlocList;
        if (popUpYes){
            url = environment.getBlocBasicsList;
        }
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + url + searchApi);
    }

    createBloc(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createBloc, data);
    }

    updateBloc(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateBloc, data);
    }

    getBlocById(id) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getBlocById + '?id=' + id);
    }

}
