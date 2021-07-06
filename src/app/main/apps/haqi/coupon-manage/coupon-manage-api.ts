export const couponManageApi: any = {
    /*******优惠券列表*****/
    // getCouponList: 'expenses/api/code', // 获取优惠券列表
    getCouponList: 'backend/api/code', // 获取优惠券列表
    exportCouponList: 'backend/api/code-list-export', // 导出优惠券列表

    /*******优惠券批次*****/
    getCouponBatchList: 'backend/api/batches', // 获取优惠券批次列表
    createCouponBatch: 'expenses/api/batch', // 新建优惠券批次(post)
    getCouponBatchDetailById: 'expenses/api/batch/', // 根据id获取优惠券批次详情(get)
    closeOpenEnabled: 'expenses/api/batch/', // 开关优惠券批次(put)
    batchType: 'expenses/api/provider/batch', // 获取优惠券批次类型(get)

    /*******优惠券规则*****/
    getCouponRuleList: 'backend/api/coupon', // 获取优惠券规则列表
    createCouponRule: 'expenses/api/coupon', // 新建优惠券规则(post)
    getCouponRuleDetailById: 'expenses/api/coupon/', // 根据id获取优惠券规则详情(get)
    updateCouponRuleDetailById: 'expenses/api/coupon/', // 根据id更新优惠券规则(put)
    getCouponType: 'expenses/api/provider/coupon', // 优惠券类型(get)
    updateCouponStatus: 'expenses/api/coupon/', // 更新优惠券状态(put)
    getPeriodType: 'expenses/api/provider/period', // 获取核销时间类型(get)

    /*******优惠券发放*****/
    giveCoupon: 'expenses/api/give/coupon', // 优惠券发放
    getCouponPushList: 'expenses/api/code/condition', // 获取优惠券发放列表

    /*******公共接口*****/
    fileUpload: 'file/api/file/upload', // 文件上传接口
    preImg: 'file/api/file/showImg', // 文件预览接口
    carTypes: 'backend/api/car-types',  // 车辆类型
    city: 'backend/api/cities',

    /*********活动接口*********/
    exportActivityList: 'backend/api/activity-list-export', // 导出活动列表
    // getActivityList: 'expenses/api/activity', // 获取活动列表(get)
    getActivityList: 'backend/api/activity', // 获取活动列表(get)
    createActivity: 'expenses/api/activity', // 新增活动(post)
    getActivityDetailById: 'expenses/api/activity/', // 根据id获取活动详情(get)
    updateActivityById: 'expenses/api/activity/', // 根据id更新活动详情(put)
    getActivityTypeList: 'expenses/api/provider/activity', // 活动类型(get)---
    passOrRejectActivity: 'expenses/api/activity/', // 活动/套餐审核（post)--

    searchStoreLists: 'backend/api/search-store-lists',
};
