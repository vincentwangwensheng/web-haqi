import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment.hmr';
import {Observable} from 'rxjs';
import {Utils} from '../utils';
import {CouponParameter} from './CouponParameter';

@Injectable({
    providedIn: 'root'
})
export class ECouponServiceService {

    constructor(private  httpservice: HttpClient, private utils: Utils) {
    }


    // 券维护 获取总列表数量
    getCouponCount(search?) {
        const searchApi = this.utils.getCountSearch(search);
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getCouponCount + searchApi);
    }

    // 券维护 条件查询
    getCouponEntityByCondition(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getCouponAllList
            + searchApi, {observe: 'response'});
    }


    // 券维护（规则）， 查询详情
    getCouponCouponMaintainById(id): Observable<CouponMaintainEntity> {
        if (id !== undefined || id !== 'undefined') {
            return this.httpservice.get<CouponMaintainEntity>(sessionStorage.getItem('baseUrl') + environment.getCouponDataById + id);
        }
    }

    // 券维护根据券编码条件查询获取所有数据
    getCouponMaintainListByNumber(param?) {
        if (param) {
            return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getCouponAllList + param, {observe: 'response'});
        } else {
            return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getCouponAllList, {observe: 'response'});
        }

    }

    // 修改券规则单条数据
    UpdateCouponMaintain(param) {
        return this.httpservice.put(
            sessionStorage.getItem('baseUrl') + environment.updateCoupon, param);
    }

    // 券维护 将券码从crm中导入到我们的数据库
    ImportCrmTicket(source: CouponMaintainEntity) {
        const customParams = {
            desc: source.description,
            picture: source.image,
        }; //
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.ImportCrmTicket
            + '?ticketId=' + source.outId + '&name=' + source.name + '&pickupRule=' + source.pickupRule , customParams);
    }

    // 电子券管理 --- 电子券列表
    getAllCouponCodes(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.httpservice.get<any>(sessionStorage.getItem('baseUrl') + environment.getAllCouponCodesNow + searchApi
            , {observe: 'response'});
    }

    // 电子券列表---获取电子券列表的数量
    GetcountCouponCodes(search?) {
        const searchApi = this.utils.getCountSearch(search);
        return this.httpservice.get<CouponEntity[]>(sessionStorage.getItem('baseUrl') + environment.GetcountCouponCodes + searchApi);
    }


    // 电子券券面预览
    CouponShowImg(saveid): Observable<any> {
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.CouponShowImg + '?saveId=' + saveid, {responseType: 'blob'});
    }

    // 电子券上传 返回进度
    CouponFileUpload(formData): Observable<any> {
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text', reportProgress: true, observe: 'events'});
    }

   // 不反悔进度
    CouponFileUploadNotBar(formData): Observable<any> {
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.CouponFileUpload, formData,
            {responseType: 'text'});
    }

    // 精准营销自有券规则添加
    CreatCouponCodes(coupon: CouponMaintainEntity) {
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.CreatCouponCodes, coupon);
    }

    // 券批次--- 全批次列表
    getAllBatches(page, size, sort, search?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getAllBatches + searchApi, {observe: 'response'});
    }

    // 券批次--- 查询券批次的数量
    countBatches() {
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.countBatches);
    }

    // 券批次， 查询券批次
    getBatch(id): Observable<BatchEntity> {
        return this.httpservice.get<BatchEntity>(sessionStorage.getItem('baseUrl') + environment.getBatch + id);
    }

    // 券批次 ， 储存券批次
    createBatch(enabledVM) {
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.createBatch, enabledVM,
            {observe: 'response'});
    }
    externalBatches(enabledVM){
        return this.httpservice.post(sessionStorage.getItem('baseUrl') + environment.externalBatches, enabledVM,
            {observe: 'response'});
    }

    formatToZoneDateTime(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.toISOString();
        } catch (e) {
            return dateStr;
        }
    }

    formatToZoneDateTime1(dateStr) {
        try {
            const date = new Date(dateStr);
            return date.getFullYear() + ':' + date.getMonth() + ':' + date.getDay() + ':' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        } catch (e) {
            return dateStr;
        }
    }


    // 查询单个商户数据
    getSearchStoreOne(): Observable<any> {
        return this.httpservice.get<any>(sessionStorage.getItem('baseUrl') + environment.searchStoreLists
            + '?page=0&size=149&sort=lastModifiedDate,desc');
    }

    // 查询店铺编号与名称
    getStoresNameNO(storeNos): Observable<any> {
        return this.httpservice.get<any>(sessionStorage.getItem('baseUrl') + environment.getStoresNameNO
            + '?storeNos=' + storeNos);
    }

    // 手动补发电子券
    pickupManual(couponNum, mobile, activity?) {
        let search = '?couponNum=' + couponNum + '&mobile=' + mobile;
        if (activity) {
            search += '&activityId=' + activity.id;
        }
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.pickupManual + search);
    }

    // 电子券补发操作记录
    getReissueHistory(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search) + '&code.force.equals=true';
        return this.httpservice.get<CouponEntity[]>(sessionStorage.getItem('baseUrl') + environment.getAllCouponCodesNow + searchApi, {observe: 'response'});
    }

    // 记录总数据条数
    getReissueHistoryCount(search?) {
        const searchApi = this.utils.getCountSearch(search) + '?code.force.equals=true';
        return this.httpservice.get<CouponEntity[]>(sessionStorage.getItem('baseUrl') + environment.GetcountCouponCodes + searchApi);
    }

    // 核销记录
    getWriteOffRecord(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.getWriteOffRecord + searchApi, {observe: 'response'});
    }

    // 导出核销记录
    exportWriteOffRecord(page, size, sort, search?) {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search);
        return this.httpservice.get(sessionStorage.getItem('baseUrl') + environment.exportWriteOffRecord + searchApi, {responseType: 'blob'});
    }

    // 电子券管理--购买记录-get请求
    getCodeWithCouponAndWechat(page, size, sort, search? , filter?): Observable<any> {
        const searchApi = this.utils.getMultiSearch(page, size, sort, search , filter);
        return this.httpservice.get<any>(sessionStorage.getItem('baseUrl') + environment.codeWithCouponAndWechat + searchApi,
            {observe: 'response'});
    }

    // 电子券管理--获取退款原因
    getRefundReason(data): Observable<any> {
        return this.httpservice.post<any>(sessionStorage.getItem('baseUrl') + environment.getRefundReason, data, {observe: 'response'});
    }

    // 电子券管理--通过
    getRefundsPass(data): Observable<any> {
        return this.httpservice.put<any>(sessionStorage.getItem('baseUrl') + environment.refundsPass
            , data, {observe: 'response'});
    }

    // 电子券管理--驳回
    getRefundsRefuse(data): Observable<any> {
        return this.httpservice.put<any>(sessionStorage.getItem('baseUrl') + environment.refundsRefuse
            , data, {observe: 'response'});
    }


}

// 电子券列表
export class CouponEntity {
    name: string;           //   券名称
    number: number;   // 券批次编号
    rule: string;    // 券类型？？？
    code: string;          //   券编码 ？？
    // timeBegin: string;         // 开始时间
    // timeEnd: string;    //  结束时间
    validity: string; // 有效期
    statusText: string; // 核销状态
    mobile: string;    // 所属常旅客 ？？？
    // enabled?: string;   //    状态（未领取、未核销、已核销）
    receiveTime: string;     //  领取时间
    clearTime: string;  //  核销时间
    couponId: string; // 外部ID
    constructor() {
    }
}

// 券规则实体类
export class CouponMaintainEntity {
    id?: number;
    number?: string; // 内部编码
    batchNo?: string;  // 券批次编号
    name?: string;  // 券名称
    expireRule?: string; // 过期规则 // PERIOD 是【固定周期】，MANYDAYS 是【领取后xxx日内有效】，MANYMINUTE :【领取后xxx分钟内有效】
    expireRuleMinute?: number;  // 领取后xxx
    expireRuleDays: string;     // 当日生效，参数为1
    expireRuleTimeBegin?: string; // 核销开始时间
    expireRuleTimeEnd?: string;  //  核销结束时间
    pickupRule?: string; // 领取规则 一次领取(ONLYONCE),核销再领(REPICKUPAFTERCLEAR),每日领一次ONCEEVERYDAY...第三方限制（DEFAULT） // 暂时没用了，默认DEFAULT
    clearRule?: string;  // 核销规则
    rule?: string;  // 券规则 现金券,满减券....
    source?: string;  // 来源
    timeBegin?: string;  // 领取开始时间
    timeEnd?: string;    // 领取结束时间
    status?: string;           // 状态
    image?: string; // 卡面                     // 文件
    canReturn?: boolean; // 支持回收
    canGift?: boolean; // 支持转送
    returnAfterRefund?: boolean; //  退款退券
    bizType?: string; // 业态
    store?: string;  // 店铺    格式是 商场编号+店铺编号 类似BCIA123445,CY98484
    capacity?: number; // 券数量 -1代表不限量
    alertThreshold?: number; // 预警阀值
    description?: any; // 券说明 description
    outId?: string; // 外部id
    threshold?: string; // 最低消费金额  // 满额
    amount?: number; // 券面额              // 减额
    remarks?: string;
    enabled?: boolean; // 有效?
    showValidity?: number; // 券码有效期
    maxPickupDaily?: string; // 每日最大领取数 单日领取
    limitPerOrder?: string; //  每单限用数量
    maxPickup?: number;  // 单日总量 正确的不知 领取总量
    level?: string; // 限制会员
    createdBy?: string;
    createdDate?: string;
    lastModifiedBy?: string;
    lastModifiedDate?: string;
    canRefund = false;  // 是否可退款退券【目前】 直接false即可  暂时没用到
    constructor() {
    }
}

export class ImportCrmTicketSource {
    ticketId: string;
    name: string;
    pickupRule: string;
    desc: string;
}

export class BatchEntity {
    couponId: string;  // 券规则的ID
    createdBy: string;
    createdDate: string;
    timeBegin: string;
    timeEnd: string;
    description: string;
    balance: string; // 余额
    id: number;
    lastModifiedBy: string;
    lastModifiedDate: string;
    number: string;     /// 编码
    quantity: number;   // 数量
}


// 选择框
export class CheckBoxSelectStruts {
    // ONLYONCE = false; // 领取限制一次领取
    // REPICKUPAFTERCLEAR = false; // 核销再领
    // ONCEEVERYDAY = false;  // 每日领一次
    // DEFAULTReceive = true;  // 第三方限制
    CouponCanGifYes = false; // 支持转送
    CouponCanGifNO = true; // 不支持转送
    CouponCanReturnYes = false; // 支持回收
    CouponCanReturnNo = true;  // 不支持回收
    returnAfterRefundTrue = false; // 支持退款退券
    returnAfterRefundFalse = true; // 只支持退款

}

// 发放后多少天生效---关于天数的自增或自减
export class AfterAdd {
    inputCouponNumber = 1;
    RemoveSetIntervalID: Array<{ value: any }> = [];
    AddSetIntervalID: Array<{ value: any }> = [];
    removeDown_UP_STRUTS: boolean;
    AddDown_UP_STRUTS: boolean;
}

// 上传图片
export class UpImg {
    ProgressLoad: number;  // 上传长度
    notUploading: boolean; // 是否在上传
    UpLoadStatus = false;  // 上传按钮的状态，是否可 用
    FinishStatus = true;   // 完成按钮的状态  是否可用
    limitM: number;       // 上传文件的限制大小
    limitType: string;   // 上传类型限制
    uploadDesc: string; // 上传文件限制描述
    imgSrc: any;
    imgID: string;
    imgLoding = false;
}

export class SystemParameter {
    //  RuleType = 'FULL_BREAK_DISCOUNT';   // 判断券满减相关的类型，控制页面显示, 默认满减券
    timeOrDay = true;  // 判断固定期限的相关类型，控制页面显示 ， 默认为true显示满减券的
    CouponMaintainSource = CouponParameter.BCIA_TT_CRM;                   // 券来源赋值变量
    CouponMaintainOutIdDisabled = true;      // 变量---控制显示隐藏的变量 默认是股份会员，一些功能会灰掉
    CouponMaintainUPIMGisabled = true;  // 设置上传按钮是否为灰掉的状态
    imgShow = false;                 // 控制预览按钮是否可见
    // DisabledDEFAULT = true ; // 默认设置第三方限制的这个选择框为不可点
    Coupon_Rule_ID = CouponParameter.COUPONRULE_DETAIL; // 从券规则详请传过去的初始ID
    CouponEditOK = CouponParameter.COUPONRULE_EDITBTU;
    CouponAdd = false;
    divDisabled = false;
    slideOnOff = false; // 券码有效期控制开关
    slideDisabled = true; // 券码有效期控制是否可用
    bizTypeDis = true;  // 设置业态限制按钮是否可用  业态限制与店铺限制按钮二选一
    StoreDis = true;    // 设置店铺限制按钮是否可用
    ChooseLabelPre: string; // 业态、店铺、会员、预览的文字


}


export class NumberLimitSource {
    //  DefoutString = '钻石会员'; // 会员限制默认展示文字
    data: any;

}


export class TagSource {
    // 会员
    CouponNumberTag = []; // tagName
    NumberLabel = [];  // labelName
    NumberString = '';  // strName
    NumberLabelPre = false;  // butShow

    // 店铺
    StoreNumberTag = [];   // tagName
    StoreLabel = [];   // labelName
    StoreString = '';   // strName
    StoreLabelPre = false;   // butShow

    // 业态
    BusinessNumberTag = [];   // tagName
    BusinessLabel = [];    // labelName
    BusinessString = '';   // strName
    BusinessLabelPre = false;   // butShow
}
