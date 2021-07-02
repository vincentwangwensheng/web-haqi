export const environment = {
    production: true,
    hmr: true,


    /**业态**/
    // 一级业态
    searchTypes: 'terminal/api/get-type-lists',
    getTypeById: 'terminal/api/get-type-by-id',
    postType: 'terminal/api/create-business-type',
    putType: 'terminal/api/update-business-type',
    deleteBType: 'terminal/api/delete-type-by-id',
    // 二级业态
    secondType: 'terminal/api/second-types',

    /**账户相关*/
    login: 'auth/api/login',
    changeSelfPassword: 'auth/api/account/change-self-password',
    changePassword: 'auth/api/account/change-password',
    forceChangePassword: 'auth/api/account/force-change-password',
    account: 'auth/api/account',
    role: 'auth/api/role',
    authority: 'auth/api/authority',
    roleList: 'backend/api/role',

    /**Saiku报表*/
    searchSaikuData: 'backend/api/get-screen-data',

    getServersLastMonth: 'backend/api/get-servers-last-month',

    /**keyCloak登录*/
    thirdPartyLogin: 'backend/api/jwt',

    /**集团管理*/
    createBloc: 'terminal/api/create-blocs',
    getBlocById: 'terminal/api/get-bloc-detail-by-id',
    getBlocByBlocId: 'terminal/api/get-bloc-detail-by-blocId',
    // getBlocList: 'terminal/api/get-bloc-list',
    getBlocList: 'backend/api/get-bloc-list',
    updateBloc: 'terminal/api/update-bloc',
    getBlocBasicsList: 'backend/api/basics/get-bloc-list', // 详情弹框接口

    /**商场管理*/
    createMall: 'terminal/api/create-mall',
    getMallById: 'terminal/api/get-mall-detail-by-id',
    getMallByMallId: 'terminal/api/get-mall-detail-by-mallId',
    updateMall: 'terminal/api/update-mall',
    getMallList: 'backend/api/get-mall-list',
    getBasicsMallList: 'backend/api/basics/get-mall-list', // 详情弹框接口

    /**商户管理*/
    createStore: 'terminal/api/create-store',
    getStoreById: 'terminal/api/get-store-by-id',
    setStoreTags: 'tag/api/tags/setStoreTags',
    getStoreTagsById: 'tag/api/tags/getTagsByStoreId',
    getBrandTagsById: 'tag/api/tags/getTagsByBrand',
    // 商户数据查询
    // searchStoreLists: 'terminal/api/search-store-lists',
    searchStoreLists: 'backend/api/search-store-lists',
    searchStoreList: 'terminal/api/search-store-list', // 附业态颜色
    searchBasicsStoreLists: 'backend/api/basics/search-store-lists', // 用于详情弹框接口

    /** 航站楼地图数据相关接口  (街区管理) 带s为带街区的接口 */
    // 楼层相关
    floors: 'terminal/api/floors',
    getFloorList: 'terminal/api/get-floor-list',
    deleteFloor: 'terminal/api/delete-floor',

    // 新增航站楼
    createTerminal: 'terminal/api/create-terminal',
    createTerminals: 'terminal/api/create-terminals',
    // 删除航站楼
    deleteTerminal: 'terminal/api/delete-terminal',
    // 根据id获取航站楼
    getTerminalById: 'terminal/api/get-terminal-by-id',
    getTerminalByTerminalId: 'terminal/api/get-terminals-by-terminalId',
    getTerminalsById: 'terminal/api/get-terminals-by-id',
    // 根据no获取航站楼
    getTerminalByNo: 'terminal/api/get-terminal-by-no',
    getTerminalsByNo: 'terminal/api/get-terminals-by-no',
    // 获取航站楼列表
    // searchTerminalList: 'terminal/api/search-terminal-list',
    searchTerminalList: 'backend/api/search-terminal-list',
    searchBasicsTerminalList: 'backend/api/basics/search-terminal-list',
    // 更新航站楼信息
    updateTerminal: 'terminal/api/update-terminal',
    updateTerminals: 'terminal/api/update-terminals',
    /*单元号数据*/
    // 批量导入单元号
    importArea: 'terminal/api/import-area',
    /*摄像头信息*/
    importCameraNo: 'terminal/api/import-cameraNo',
    getCameraByTerminalNO: 'terminal/api/get-cameraData-by-terminalNo',
    produceCameraData: 'terminal/api/produce-cameraData',
    /*文件管理*/
    // 批量下载历史svg地图
    downloadHistorySvgZip: 'terminal/api/download-svg-history-zip',
    // svg历史列表
    historySvgList: 'terminal/api/get-terminal-svg-history-list',
    // svg批量上传
    uploadSVGs: 'terminal/api/upload-svg-list',
    // svg初始化下载
    initTerminal: 'terminal/api/svg-init',

    // 更新商户
    updateStore: 'terminal/api/update-store',
    // 根据no获取商户
    getStoreByNo: 'terminal/api/get-store-by-no',
    // 单元号、商户关联/解除
    relationStore: 'terminal/api/relation-store',
    relieveStore: 'terminal/api/relieve-store',
    // 上传商户logo
    uploadLogo: 'terminal/api/upload-logo',
    // 获取账户token 暂用
    getToken: 'backend/api/get-user-token',

    /** 营销计划管理*/
    createPlan: 'plan/api/create-marketing',
    deletePlan: 'plan/api/delete-marketing',
    getPlanById: 'plan/api/get-marketing-by-id',
    getPlanListVM: 'plan/api/get-marketing-listVM',
    updatePlan: 'plan/api/update-marketing',


    /**营销策略*/
    processes: 'engine/api/processes',
    processesView: 'engine/api/processes/getAuditProcesses',
    tags: 'tag/api/tags',
    getMemberNode: 'engine/api/node/member',
    getOrderNode: 'engine/api/node/order',

    // 商户--获取商户列表
    getStoreList: 'terminal/api/get-store-list',
    // 商户---根据ID查商户列表
    getStoreListById: 'terminal/api/get-store-by-id',
    // 商户---冻结解冻
    updateStoreFrozen: 'terminal/api/frost-store',
    // 商户---获取航站楼列表
    SearchTerminalList: 'terminal/api/search-terminal-list',
    // 商户----获取单元号列表
    getAreaList: 'terminal/api/search-area-list',
    // 热力数据模拟
    getAreaHot: 'terminal/api/get-area-by-terminalNo',

    /**激活码*/
    getCodeList: 'terminal/api/get-code-list',
    createCode: 'terminal/api/create-code',
    changeStatus: 'terminal/api/change-validity',

    //  常旅客管理 ---获取常旅客列表 加 /id 就是获取详情
    membersApi: 'member/api/members',
    membersApiList: 'backend/api/members',
    // 获取会员基本信息
    getVipDis: 'bridge4crm/api/vipdis/getVipDis',
    getMemberPoints: 'point/api/get-members-point',

    // 电子券---获取电子券列表
    getCouponAllList: 'coupon/api/coupons',
    //  电子券管理--查询券维护【规则】列表所有数量
    getCouponCount: 'coupon/api/coupons/count',
    // 电子券管理---券维护【规则】翻页查询获取列表
    //  getCouponListByPage: 'coupon/api/coupons-pageable', // 被删除了
    // 电子券管理---券维护详情页面
    getCouponDataById: 'coupon/api/coupons/',
    // 电子券管理------券导入
    ImportCrmTicket: 'coupon/api/import-crm-ticket',
    // 电子券管理------券【规则】维护添加
    CreatCouponCodes: 'coupon/api/coupons',
    // 电子券管理-----券维护（券规则）修改
    updateCoupon: 'coupon/api/coupons',
    // 电子券管理--电子券列表
    getAllCouponCodes: 'coupon/api/codeWithCoupon',
    // 电子券管理--电子券列表[在用]
    getAllCouponCodesNow: 'coupon/api/code-with-coupon',
    // 电子券管理---获取电子券数量
    GetcountCouponCodes: 'coupon/api/coupon-codes/count',
    // 券维护【规则】---获取券维护列表
    getCouponMaintainList: 'coupon/api/coupons',
    // 电子券管理-【券规则】电子券券面文件上传
    CouponFileUpload: 'file/api/file/upload',
    // 电子券管理-【券规则】电子券券面预览
    CouponShowImg: 'file/api/file/showImg',
    // 电子券管理----获取券批次列表
    getAllBatches: 'coupon/api/batches',
    // 电子券管理----获取券批次数量
    countBatches: 'coupon/api/batches/count',
    // 电子券管理----获取券批次详情
    getBatch: 'coupon/api/batches/',
    // 电子券管理----储存券批次
    createBatch: 'coupon/api/batches',
    // 电子券管理----导入外部券码 新建券批次
    externalBatches: 'coupon/api/external-batches',
    // 新建事件----获取报名方式类型
    getApplyType: 'reservation/api/get-apply-type',

    // 根据店铺的编号拿到对应的店铺名称
    getStoresNameNO: 'terminal/api/get-storesName',
    // 手动电子券补发
    pickupManual: 'coupon/api/pickup-manual',
    // 核销记录列表
    getWriteOffRecord: 'backend/api/coupon-list',
    // 导出核销记录列表
    exportWriteOffRecord: 'backend/api/export-coupon-list',
    // 电子券 -- 购买记录
    codeWithCouponAndWechat: 'coupon/api/code-with-coupon-and-wechat',
    // 电子券 -- 获取退款原因
    getRefundReason: 'coupon/api/refunds/getRefundByCouponNum',
    // 电子券 - 驳回
    refundsRefuse: 'coupon/api/refunds/refuse',
    // 电子券 - 通过
    refundsPass: 'coupon/api/refunds/pass',

    // 商户数据---获取业态列表一级业态
    getTypeList: 'terminal/api/get-type-list',
    // 创建业态
    createType: 'terminal/api/create-business-type',
    // 更新业态
    updateType: 'terminal/api/update-business-type',
    // 删除业态
    deleteType: 'terminal/api/delete-type-by-id',

    // 二级业态
    getSecondTypeList: 'terminal/api/second-types',
    // 获取一级业态 可分页
    getTypeLists: 'terminal/api/get-type-lists',

    // 获取标签列表
    searchLabelList: 'tag/api/tags',
    // 新增商户标签
    createMerchantTagList: 'tag/api/tags',
    // 更新商户标签内容
    updateMerchantTag: 'tag/api/tags',
    // 营销管理---获取营销列表
    searchMarketingManageList: 'expenses/api/activity',

    getMarketingManageList: 'backend/api/activity',

    // 营销管理 --- 活动阶段数据
    searchActivityStagesList: 'coupon/api/stages',
    // 获取标签详情
    getLabelById: 'terminal/api/get-label-by-id',
    // 营销管理 -- 新增分组活动数据
    createCouponGroupsData: 'coupon/api/coupon-groups',
    // 根据活动识别号设置其所需要的标签
    setActivityTags: 'tag/api/tags/setActivityTags',
    // 根据活动识别号获取其拥有的所有标签
    getTagsByActivity: 'tag/api/tags/getTagsByActivity',
    // 活动审核
    activitiesReview: 'coupon/api/activities',
    // 活动导出对账单
    exportReconciliation: 'backend/api/export-reconciliation',
    // 获取商户详情
    getStoreByIdAC: 'terminal/api/get-store-by-id',

    // 文章列表--新建文章
    createArticle: 'article/api/articles/createArticle',
    // 文章列表--文章列表
    articleList: 'article/api/articles',
    // 根据文章识别号获取所拥有的标签
    getTagsByArticle: 'tag/api/tags/getTagsByArticle',
    // 根据文章识别号设置其所拥有的标签
    setArticleTags: 'tag/api/tags/setArticleTags',
    // 文章审核
    articlesAudited: 'article/api/articles-audited',
    // 文章驳回
    articlesRejected: 'article/api/articles-rejected',

    // 积分联盟 --- 成员列表
    getMemberList: 'point/api/get-member-list',
    // 积分联盟  --- 获取单个成员信息
    getMemberById: 'point/api/get-member-by-id',
    //  积分联盟  --- 成员更新
    updateMember: 'point/api/update-member',
    // 积分联盟 --- 成员添加
    createMember: 'point/api/create-member',
    // 积分联盟 --- 积分规则列表
    getRuleList: 'point/api/get-rule-list',
    // 积分联盟 --- 新增互动积分
    createRule: 'point/api/create-rule',
    // 积分联盟  --- 获取积分规则详情
    getRuleById: 'point/api/get-rule-by-id',
    // 积分联盟  --- 修改积分规则
    updateRule: 'point/api/update-rule',
    // 积分联盟  --- 获取周期列表
    getInteractRulePeriod: 'point/api/get-interact-rule-period',
    // 积分联盟  ---获取已经有规则的店铺的集合
    getRuleStores: 'point/api/stores',

    getBasicRuleByBlockIdAndMallId: 'point/api/basics-rules/bloc/',

    createBasicRule: 'point/api/basics-rules',

    createConsumeRule: 'point/api/consume-rules',

    getConsumeRules: 'point/api/consume-rules',

    deleteConsumeRule: 'point/api/consume-rules/',

    updateInteractRules: 'point/api/interact-rules',

    getInteractRules: 'point/api/interact-rules',

    getPointRuleList: 'point/api/point-rules',

    // 获取商场列表
    // getMallList: 'terminal/api/get-mall-list',

    // 保存积分调整明细
    saveAdjustPoint: 'point/api/adjust-point',
    // 会员积分历史清单
    // getPointHistory: 'point/api/get-point-history',
    getPointHistory: 'backend/api/get-point-history',
    // 会员积分历史清单
    getRuleByStoreNo: 'point/api/get-rule-by-storeNo',
    // 积分调整获取积分供应商列表
    getMemberListPoint: 'point/api/get-member-list',
    // 积分调整获取积分供应商列表
    getMemberPoint: 'point/api/get-member-point',

    // 标签管理--常旅客标签
    passengersTag: 'member/api/tags',
    // 标签管理--营销标签
    marketingTag: 'coupon/api/tags',

    // 常旅客管理--会员积分详情
    integralHistory: 'point/api/get-point-history-by-mobile',


    // 小程序蒙屏管理【新增、修改接口】
    PopupInfo_list_add_update: 'popup/api/popup-infos',
    // 获取列表数量
    getPopup_infoCount: 'popup/api/popup-infos/count',
    // 小程序蒙屏 轮播列表
    getActivity: 'popup/api/getActivity',
    // 小程序蒙屏  蒙屏列表
    PopupInfoShow: 'backend/api/popup-infos-show',
    // 小程序蒙屏  设置蒙屏状态
    activityPopup: 'popup/api/activity-popup',
    // 小程序蒙屏  拿到当前所有活跃状态的蒙屏 /  获取当前蒙屏是否活跃【带参数】
    getPopupConfigurations: 'popup/api/popup-configurations',
    // 小程序蒙屏  设置蒙屏状态【传ID的时候是有效，传null的时候是无效】用作下架
    putPopupConfigurations: 'popup/api/popup-configurations',
    // 小程序蒙屏  拿到对应活动的电子券列表
    getCouponList: 'coupon/api/coupon-list',
    // 小程序蒙屏 轮播图
    allLoopInfo: 'backend/api/loop-infos',
    loopInfo: 'popup/api/loop-infos',
    loopInfoDetailed: 'popup/api/loop-info-detaileds',

    // 广告屏管理 广告列表
    getAdvertisingList: 'backend/api/advertisings',
    getAdvertising: 'popup/api/advertisings',
    // 广告屏管理 商场广告
    getMall: 'popup/api/advertisings/mall',

    // 常旅客管理 -- 会员基础设置
    memberLevel: 'member/api/memberlevels',
    updateMemberLevels: 'member/api/level-pics',
    updateLevelremarks: 'member/api/levelremarks',
    getMemberTemplate: 'backend/api/member-template',
    getMemberImport: 'backend/api/member-import',
    getGroupMembers: 'backend/api/group-members-export/',
    exportMemberList: 'backend/api/member-list-export',

    // 常旅客管理 -- 拍照积分
    selfPoints: 'backend/api/self-points', // 拍照积分列表页
    selfPointsById: 'point/api/self-points/', // 根据id获取拍照积分详情
    selfPointsPass: 'point/api/self-points-adopt', // 拍照积分-通过
    selfPointsRefuse: 'point/api/self-points-refuse', // 拍照积分-驳回
    getAutoAdopt: 'point/api/get-auto-adopt', // 获取是否自动审核状态
    setAutoAdopt: 'point/api/set-auto-adopt', // 设置是否自动审核

    // 常旅客管理 -- 常旅客分群
    getAllMemberCategories: 'backend/api/member-categories', // 获取常旅客分群列表
    createMemberCategory: 'tag/api/member-categories', // 常旅客分群-新增
    updateMemberCategory: 'tag/api/member-categories', // 常旅客分群-更新
    deleteMemberCategory: 'tag/api/member-categories/', // 常旅客分群-删除
    getMemberCategory: 'tag/api/member-categories/', // 根据id获取常旅客分群信息
    getMobilesWithMemberCategory: 'tag/api/tags/getMobilesWithMemberCategory', // 根据页面的relationShip查询复合条件的所有会员价的手机号
    getAllMembersByMobiles: 'member/api/members/getAllMembersByMobilesInAndLike', // 根据mobile模糊查询出所有复合条件的member信息,包括已过滤的member信息
    getTagMemberCategories: 'tag/api/tag-member-categories', // 为成员添加标签
    getAllMembersByMobilesData: 'member/api/members/getAllMembersByMobiles', // 根据mobiles的集合查询出所有符合条件的member信息

    // 常旅客管理关联的全部常旅客标签
    passengerTags: 'tag/api/member-tags',

    // 常旅客关联选择的标签
    passengerSelectedTags: 'tag/api/members/getTagsByMobile',

    // 更新关联的常旅客标签
    updatePassengerTags: 'tag/api/tags/setMobileTags',

    // 积分流水类型
    toPointHistoryType: 'point/api/point-history-type',

    // 新建品牌信息
    createBrandInfo: 'terminal/api/create-brand',
    // 获取品牌列表
    getBrandList: 'terminal/api/get-brand-list',
    // 根据id获取品牌详情
    getBrandDetailById: 'terminal/api/get-brand-by-id',
    // 更新品牌信息
    updateBrandInfo: 'terminal/api/update-brand',
    // 根据品牌识别号获取其拥有的所有标签
    getTagsByBrand: 'tag/api/tags/getTagsByBrand',
    // 根据品牌识别号设置其所需要的标签
    setBrandTags: 'tag/api/tags/setBrandTags',


    // 批量新增或更新轮播图数据
    batchHandleLoopInfo: 'popup/api/loop-infos-saveAll',
    // 短信模板
    messageTemplateList: 'message/api/message-template-infos',
    // 已发短信
    messageHistoryList: 'message/api/message-histories',

    /** 评论管理相关接口 **/
    // 评论管理   ---> 评论列表
    getCommentList: 'comment/api/get-comment-list',

    // 评论管理   ---> 评论列表 详情
    getCommentById: 'comment/api/get-comment-by-id',

    // 评论管理   ---> 评论列表 更新
    updateComments: 'comment/api/update-comments',

    // 评论管理   ---> 评论设置 获取原设置
    getSetting: 'comment/api/get-setting',

    // 评论管理   ---> 评论设置 更新设置
    updateSetting: 'comment/api/update-setting',

    // 评论管理   ---> 评论设置 敏感词汇 新建
    createWord: 'comment/api/create-word',

    // 评论管理   ---> 评论设置 敏感词汇 列表
    getWordList: 'comment/api/get-word-list',

    // 评论管理   ---> 评论设置 敏感词汇 更新
    updateWord: 'comment/api/update-word',

    // 评论管理   ---> 获取评论量
    getCommentCount: 'comment/api/get-comment-count',

    // 评论管理  ----> 获取点赞数
    getGiveCount: 'comment/api/get-give-count',

    // 评论管理  ---->舆情监控
    getCommentListVM: 'comment/api/get-comment-listVM',

    // 评论详情  ---> 获取商户信息
    getStoreByStoreId: 'terminal/api/get-store-by-storeId',

    searchOpinionList: 'comment/api/feedback', // 意見反馈--列表(get)
    getOpinionDetailById: 'comment/api/feedback/', // 意見反馈--详情(get)
    updateOpinion: 'comment/api/feedback', // 意見反馈--更新(put)


    /** 预约报名相关 **/
    // 预约报名  ---> 获取事件列表
    // getIncidentList: 'reservation/api/get-incident-list',
    getIncidentList: 'backend/api/get-incident-list',
    // 预约报名  ---> 根据ID获取预约事件详情
    getIncidentById: 'reservation/api/get-incident-by-id',
    // 预约报名  ---> 新建事件
    incidents: 'reservation/api/incidents',
    // 预约报名  ---> 更新事件
    updateIncident: 'reservation/api/update-incident',
    // 预约报名  ---> 申请列表
    getApplyList: 'backend/api/get-apply-list',
    // 预约报名  ---> 申请状态
    getApplyStatus: 'reservation/api/get-apply-status',
    // 预约报名  ---> 后台审核
    updateApply: 'reservation/api/update-apply',
    // 预约报名  ---> 去履约
    appointmentApp1y: 'reservation/api/appointment-apply',
    // 预约报名 ----> 获取预约类型
    getIncidentType: 'reservation/api/get-incident-type',
    // 预约报名  ---> 根据ID获取数据
    getApplyById: 'reservation/api/get-apply-by-id',

    /** 常旅客画像 **/
    customSource: 'member/api/source',

    // 一级业态
    customGetTypeList: 'terminal/api/get-type-list',

    // 二级业态
    customGetSecondTypeList: 'terminal/api/second-types',

    // 生成画像接口
    getMemberProfile: 'data4bi/api/member/get-member-profile',

    /** 开放中心  API **/
    swaggerResources: 'swagger-resources',

    swaggerInfo: 'management/info',

    apiDocs: 'openapi/v2/api-docs',

    apiGetToken: 'api/authenticate', // 获取tocken

    /** 开放中心  身份认证  **/
    attest: 'openapi/api/attest', // 提交身份认证申请

    attestDetail: 'openapi/api/attest/detail', // 当前申请

    attestReview: 'openapi/api/attest/review', // 身份认证申请列表 / 认证审核post请求

    attestExist: 'openapi/api/attest/exist', // 判断是都存在未审核认证请求


    // 注册 --> 开放平台发送验证码
    captcha: 'openapi/api/captcha',

    // 注册
    registry: 'openapi/api/registry',

    // 接口列表
    InterfaceOpenApi: 'openapi/api/openapi',

    // 接口 待审核列表
    openapiReview: 'openapi/api/openapi/review',

    // 接口提交申请
    openapiSubmit: 'openapi/api/openapi/submit',

    // 查看当前的接口申请
    openapiDetail: 'openapi/api/openapi/detail',

    // 接口提交申请  拿TOCKEN
    openapiToken: 'openapi/api/openapi/token',

    /*********** 渠道管理 ***********/
    // 消息供应商
    getMessageProviderTemplate: 'message/api/message-templates', // 获取消息供应商列表(get)
    getMessageProviderTemplateCount: 'message/api/message-templates/count', // 获取消息供应商列表数量(get)
    getMessageProviderTemplateById: 'message/api/message-templates/', // 根据id获取消息供应商(get)
    addMessageProviderTemplate: 'message/api/message-templates', // 新增消息供应商(post)
    updateMessageProviderTemplate: 'message/api/message-templates', // 更新消息供应商(put)
    weChatTemplateList: 'wechat/api/wechat/getTemplateList', // 微信接口--获取当前帐号下的个人模板列表
    getProviderTypeList: 'message/api/plugin', // 获取消息供应商的类型(get)
    getDictionaries: 'message/api/template/dictionaries', // 获取数据字典(get)
    getQRCodesList: 'popup/api/qr-codes', // 获取带参二维码(get)
    addQRCodesList: 'popup/api/qr-codes', // 新增带参二维码(post)
    getQRCodesTypes: 'popup/api/qr-codes/code-type', // 二维码类型(get)
};
