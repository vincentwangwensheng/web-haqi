import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../services/utils';
import {AppletGameApi} from './applet-game.api';

@Injectable({
    providedIn: 'root'
})
export class AppletGameService {

    constructor(
        private http: HttpClient,
        private utils: Utils
    ) {
    }

    searchGames(page, size, sort, search?, filter?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search, filter);
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + AppletGameApi.game + searchApi, {observe: 'response'});
    }
}
