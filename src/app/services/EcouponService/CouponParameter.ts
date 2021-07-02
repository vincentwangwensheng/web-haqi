export class CouponParameter {
    /**
     * 券来源，CRM3.0
     * @type {string}
     */
    static BCIA_TT_CRM = 'BCIA_TT_CRM_30'; // BCIA_TT_CRM_30
    /**
     * 精准营销
     */
    static  DEFAULT = 'DEFAULT';
    /**
     * 满减券
     * **/
    static FULL_BREAK_DISCOUNT = 'FULL_BREAK_DISCOUNT';
    /***
     * 现金券
     * @type {string}
     */
    static CASH = 'CASH';
    /**
     *商品券
     */
    static COUPON_OF_GOODS = 'COUPON_OF_GOODS';
    /***
     * 领取限制  每日限领一次
     */
    static PICKUPRULEONCEEVERYDAY = 'ONCEEVERYDAY';
    /***
     * 领取限制  核销再领
     */
    static PICKUPRULEREPICKUPAFTERCLEAR = 'REPICKUPAFTERCLEAR';
    /***
     * 领取限制  一次领取
     */
    static PICKUPRULEONLYONCE = 'ONLYONCE';
    /***
     * 领取限制  第三方限制
     */
    static PICKUPRULEDEFAULT = 'DEFAULT';
    /***
     * 从券批次传过去的内定ID
     */
    static COUPONLOTID = 'COUPONLOTID_ZERO';
    /***
     * 从券规则传过去的ID
     */
    static COUPONRULE_DETAIL = 'COUPONLOTID_RULE_Detail';
    /***
     * 券批次添加传过去的ID
     */
    static COUPONLOTADD_ID = 'ADD_ID';
    /***
     *根据此参数去判断当前详情页是编辑还是取消编辑
     */
    static C_Frist = 'ONE'; // 开始的详情页
    /***
     * 显示的编辑
     */
    static COUPONRULE_EDITBTU = 'COUPONLOTID_RULE_EDITB';
    /***
     * 显示的保存
     */
    static COUPONRULE_SAVETU = 'COUPONLOTID_RULE_SAVE';
    /***
     * 点击保存--编辑页面
     */
    static COUPONRULE_REALSAVE = 'COUPONLOTID_RULE_TOSAVE';
    /***
     * 点击保存--新增页面
     */
    static COUPONRULE_ADDTOSAVE = 'COUPONLOTID_RULE_ADDTOSAVE';
    /***
     * 券规则添加的ID
     */
   static COUPONRULE_ADDTU = 'COUPONLOTID_RULE_ADD';
    /***
     * 券批次选择的时候，券规则的ID会变化，给它赋值，捕捉这个变化
     */
   static CouponMaintainID_Change = 'CouponMaintainID_Change';
    /***
     * 固定周期
     */
   static PERIOD = 'PERIOD';
    /***
     * 领取后XX时内生效
     */
    static  expireRule_MANYMINUTE = 'MANYMINUTE';
    /***
     * 【领取后XX日内生效】
     */
    static  expireRule_MANYDAYS = 'MANYDAYS';
    /***
     * other
     */
    static OTHER = 'OTHER';

    /***
     * 成员列表区分是新增还是列表页
     */
   static Member_ID = 'M_ADD';  // 列表

   static Rule_CONSUME = 'CONSUME'; // 消费积分
   static Rule_INTERACT = 'INTERACT'; // 互动积分
   static ADD_Rule_CONSUME = 'ADD_CONSUME'; // 消费积分
   static ADD_Rule_INTERACT = 'ADD_INTERACT'; // 互动积分
    // 每种积分类型
   static RULE_CHECK_IN = 'CHECK_IN';      // 签到奖励积分
   static RULE_REGISTERED = 'REGISTERED';  // 注册奖励积分
   static RULE_COUPON = 'COUPON';  // 领劵奖励积分
   static RULE_COMMENT = 'COMMENT';  // 评论奖励积分
   static RULE_SHARE = 'SHARE';  // 分享奖励积分
    // 日期类型
   static  RULE_ONCE =   'ONCE'; // 一次
   static  RULE_DAY =    'DAY'; // 日
   static  RULE_WEEK =   'WEEK'; // 周
   static  RULE_MONTH =  'MONTH'; // 月

    // 认证
    static OAUTH2 = 'oauth2.0';


    // input的Type
    static INPUT_PASSWORD = 'password';
    static INPUT_TEXT = 'text';

}

