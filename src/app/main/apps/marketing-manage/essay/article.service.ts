import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';
import {Utils} from '../../../../services/utils';

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    constructor(public http: HttpClient, private utils: Utils) {
    }

    // 新增文章接口
    createArticle(param) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.articleList, param, {observe: 'response'});
    }

    // 文章列表
    searchArticleList(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.articleList + searchApi
            , {observe: 'response'});
    }

    // 文章详情id
    searchArticleById(id) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.articleList + '/' + id
            , {observe: 'response'});
    }

    // 文章update
    updateArticle(param) {
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.articleList, param
            , {observe: 'response'});
    }

    // 根据活动识别号获取其拥有的所有标签
    getTagsByActivity(acId) {
        return this.http.get(sessionStorage.getItem('baseUrl') + environment.getTagsByArticle + '?articleId=' + acId);
    }

    // 根据活动识别号设置其所需要的标签
    setArticleTags(activityTagVM) {
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.setArticleTags, activityTagVM, {observe: 'response'});
    }


    // 文章审核
    articlesAudited(id) {
        const param =  {id : id};
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.articlesAudited + '?id=' + id ,  null);
    }

    // 文章驳回
    articlesRejected(id) {
        const param =  {id : id};
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.articlesRejected + '?id=' + id ,  null);
    }

}
