import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {GameDetailApi} from './game-detail.api';

@Injectable({
    providedIn: 'root'
})
export class GameDetailService {

    constructor(private http: HttpClient) {
    }

    postGame(data) {
        return this.http.post(sessionStorage.getItem('baseUrl') + GameDetailApi.game, data);
    }


    putGame(data) {
        return this.http.put(sessionStorage.getItem('baseUrl') + GameDetailApi.game, data);
    }

    getGameById(id) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + GameDetailApi.game + '/' + id);
    }


    getMallByMallId(mallId) {
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + GameDetailApi.getMallByMallId + '?mallId=' + mallId);
    }

}
