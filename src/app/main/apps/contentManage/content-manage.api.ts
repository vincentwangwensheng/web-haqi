export const ContentManageApi: any = {
    // 商户反馈
    // feedbackStoresList: 'feedback/api/feedback-stores', // 商户反馈列表（get）
    feedbackStoresList: 'backend/api/feedback-stores', // 商户反馈列表（get）
    updateFeedbackStores: 'feedback/api/feedback-stores', // 商户反馈编辑保存（put）
    updateFeedbackStoresReplyed: 'feedback/api/feedreply-stores', // 商户反馈编辑保存(已经回复过）（put）
    // 常见问题
    questionsList: 'backend/api/questions', // 常见问题（get）
    addQuestions: 'feedback/api/questions', // 常见问题编辑保存（post）
    updateQuestions: 'feedback/api/questions', // 常见问题编辑保存（put）
    // 会员反馈
    // feedbacksList: 'feedback/api/feedbacks', // 会员反馈列表（get）
    feedbacksList: 'backend/api/feedbacks', // 会员反馈列表（get）
    updateFeedbacks: 'feedback/api/feedbacks', // 会员反馈编辑保存（put）
    updateFeedbacksReplyed: 'feedback/api/feedreplies', // 会员反馈编辑保存(已经回复过）（put）
    // 商户公告
    informsList: 'backend/api/informs', // 商户公告列表（get）
    addInforms: 'feedback/api/informs', // 商户公告新增（post）
    updateInforms: 'feedback/api/informs', // 商户公告编辑保存（put）


    getMallList: 'backend/api/get-mall-list', // 获取商场列表
    searchStoreLists: 'backend/api/search-store-lists', // 获取商户列表
};
