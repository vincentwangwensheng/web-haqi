
export const ReportMain: any = {
    memberBirthday: 'backend/api/report/member/birthday', // 会员生日报表

    memberConsume: 'backend/api/report/member/consume', // 会员消费明细报表

    memberException: 'backend/api/report/member/exception', // 会员积分异常报表

    memberReplenish: 'backend/api/report/member/replenish', // 会员积分补录报表

    five: 'terminal/api/get-brand-list' , // 车辆类型


    /**  导出  -=============  **/
    oneExport: 'report/api/battery-fault-export', // 故障情况记录导出

    twoExport: 'report/api/car-statistics-export', // 车辆信息汇总导出

    threeExport: 'report/api/change-battery-detail-export', // 换电明细报表导出

    fourExport: 'report/api/site-statistics-export' , // 站点交易耗电情况导出

    fiveExport: 'report/api/site-status-change-export' , // 站点状态变更记录导出

    getAuth: 'auth/api/account/role/',

    /** 获取集团、商场列表**/
    getBlocList: 'backend/api/get-bloc-list', // 集团

    getMallList: 'backend/api/get-mall-list', // 商场

};
