import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment.hmr';
import {HttpClient} from '@angular/common/http';
import {Utils} from '../../../../services/utils';

@Injectable({
  providedIn: 'root'
})
export class WriteIdeaServiceService {

  constructor(
      private http: HttpClient ,
      private utils: Utils
  ) { }


    searchMemberCardList(): Observable<any> {
        return this.http.get( sessionStorage.getItem('baseUrl') + environment.memberLevel
            , {observe: 'response'});
    }

    // 评论列表  baseUrl_hx
    getCommentList(page, size, sort, search? , filter?): Observable<any>{
        const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
        return this.http.get(sessionStorage.getItem('baseUrl')  + environment.getCommentList
            + searchApi , {observe: 'response'});
    }

    // 评论详情  baseUrl_hx
    getCommentById(id){
        return this.http.get<CommentEntity>(sessionStorage.getItem('baseUrl') + environment.getCommentById + '?id=' + id);
    }

    // 评论  更新 baseUrl_hx
    updateComments(com){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateComments, com,
            {observe: 'response'});
    }

    // baseUrl_hx
    createComment(com){
        return this.http.post(sessionStorage.getItem('baseUrl') + 'comment/api/create-comment', com,
            {observe: 'response'});
    }



    // 获取当前评论对应的商户详情信息[根据商户ID]
    getComStoreByStoreId(storeId){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoreByStoreId + '?storeId=' + storeId);
    }

    // 获取当前对应的文章的详情信息 【ID】
    getComArticleById(articleId){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.articleList + '?articleId.equals=' + articleId);
    }

    // 获取当前对应的评论的会员的信息 【暂定手机号查找】
    getNumberByMobile(mobile){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.membersApi + '?mobile.equals=' + mobile);
    }

    // 获取评论设置 baseUrl_hx
    getSetting(){
        return this.http.get<SettingEntity>(sessionStorage.getItem('baseUrl') + environment.getSetting );
    }

    // 更新评论设置 baseUrl_hx
    updateSetting(set){
        return this.http.put(sessionStorage.getItem('baseUrl') + environment.updateSetting, set,
            {observe: 'response'});
    }

    // 获取当前评论量  baseUrl_hx
    getCommentCount(commentId){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCommentCount + '?commentId.equals=' + commentId);
    }


   // 敏感词汇 列表 baseUrl_hx
    getWordList(page, size, sort, search?): Observable<any>{
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.http.get(sessionStorage.getItem('baseUrl')  + environment.getWordList
            + searchApi , {observe: 'response'});
    }

    // 敏感词汇 新建  baseUrl_hx
    createWord(word){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.createWord, word,
            {observe: 'response'});
    }

    // 敏感词汇 编辑 baseUrl_hx
    updateWord(word){
        return this.http.post(sessionStorage.getItem('baseUrl') + environment.updateWord, word,
            {observe: 'response'});
    }

    // 获取点赞数 baseUrl_hx
    getGiveCount(commentId){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getGiveCount + '?commentId.equals=' + commentId);
    }

    // 获取异常评论信息 baseUrl_hx
    getExceptionComm(){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCommentList
                                   + '?exception.equals=' + false   );
    }

    // 获取异常评论查询信息 baseUrl_hx
    getExceptionCommSearch(comment , type){
         let search = '';
         if (comment !== '') {
             search = search + '&comment.contains=' + comment ;
         }
         if (type !== 'all') {
             search = search +  '&type.equals=' + type ;
         }
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCommentList
            + '?exception.equals=' + false  + search);
    }


    // 舆情监控  列表 baseUrl_hx
    getCommentListVM(): Observable<any>{
        return this.http.get<CommentControl>(sessionStorage.getItem('baseUrl')  + environment.getCommentListVM  , {observe: 'response'});
    }

    // 根据storeID获取相关异常评论列表
    getExceptionCommByStoreID(storeId){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCommentList
            + '?storeId.equals=' + storeId );
    }



    // 根据articleId获取相关异常评论列表
    getExceptionCommByArticleId(articleId){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getCommentList
             + '?articleId.equals=' + articleId );
    }



    creatSH(sh){
        return this.http.post(sessionStorage.getItem('baseUrl') + 'terminal/api/create-store', sh,
            {observe: 'response'});
    }

    /*********意见反馈*******/
    // 意見反馈--列表(get)
    searchOpinionList(page, size, sort, search? , filter?): Observable<any>{
        const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
        return this.http.get(sessionStorage.getItem('baseUrl')  + environment.searchOpinionList
            + searchApi , {observe: 'response'});
    }

    // 意見反馈--详情(get)
    getOpinionDetailById(id){
        return this.http.get<any>(sessionStorage.getItem('baseUrl') + environment.getOpinionDetailById + id);
    }

    // 意見反馈--更新(put)
    updateOpinion(data){
        return this.http.put<any>(sessionStorage.getItem('baseUrl') + environment.updateOpinion, data, {observe: 'response'});
    }
}
 // 评论列表
export class CommentEntity {
    commentId: string; // 评论编号
    comment: string; // 评论 内容
    score: number;         // 评分
    type: string;        // 评论区（类型）
    mobile: string;      // 手机
    overhead: boolean;     // 顶置
    images: string;     // 系列展示图片
    time: string;     // 评论时间
    reply: string;  // 回复
    exception: boolean; // 是否异常
    giveCounts: string; // 点赞数
    storeId: string;    // 商户编号（不是数据id）
    articleId: string; // 文章编号（不是数据id）
    enabled: boolean;   // 是否有效
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    id: number;
}


// 评论设置
export class SettingEntity {
    memberLimit: boolean;    // 会员限制
    classLimit: number;    // 等级限制
    picture: boolean;      // 图片评论
    commentGive: boolean;     // 评论点赞
    exceptionGive: string;   // 异常点赞次数
    exceptionComment: string; // 评分低于为异常
    violation: string;   // 评论违规
    enabled: boolean;   // 是否有效
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}

// 敏感词汇
export class Word{
    word: string;
    enabled: boolean;    // 是否有效
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
}
 // 点赞？？？
export class Give {
    mobile: string;  // 手机号
    commentId: string; // 评论编号
    enabled: boolean;     // 是否有效
    createdBy: string;
    createdDate: string;
}

 // 舆情监控
export class CommentControl {
    articleId: string;
    list: CommentEntity[];
    storeId: string;
    commentCount: number;
    reading: string;
    score: number;
}
