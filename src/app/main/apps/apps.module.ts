import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { AdvertisingScreenComponent } from './advertising-screen/advertising-screen.component';

const routes: Routes =
    [
        {path: '', redirectTo: 'groupManage', pathMatch: 'full'},
        /** 主数据维护*/
        // 集团管理
        {
            path: 'groupManage',
            loadChildren: () => import('./mall-management/group-manage/group-manage.module').then(m => m.GroupManageModule),
        },
        // 商场管理
        {
            path: 'mallManage',
            loadChildren: () => import('./mall-management/mall-manage/mall-manage.module').then(m => m.MallManageModule)
        },
        {
            path: 'mallManage/create',
            loadChildren: () => import('./mall-management/mall-manage/edit-mall/edit-mall.module').then(m => m.EditMallModule)
        },
        {
            path: 'mallManage/edit/:id',
            loadChildren: () => import('./mall-management/mall-manage/edit-mall/edit-mall.module').then(m => m.EditMallModule)
        },
        // 街区管理
        {
            path: 'terminalManage',
            loadChildren: () => import('./mall-management/terminal-manage/terminal-manage.module').then(m => m.TerminalManageModule)
        },
        {
            path: 'terminalManage/create',
            loadChildren: () => import('./mall-management/terminal-manage/edit-terminal/edit-terminal.module').then(m => m.EditTerminalModule)
        },
        {
            path: 'terminalManage/edit/:id',
            loadChildren: () => import('./mall-management/terminal-manage/edit-terminal/edit-terminal.module').then(m => m.EditTerminalModule)
        },

        // 街区地图
        {
            path: 'terminalMap',
            loadChildren: () => import('./mall-management/terminal-map/terminal-map.module').then(m => m.TerminalMapModule)
        },

        // 商户数据
        {
            path: 'storeManage',
            loadChildren: () => import('./mall-management/store-mange/store-manage.module').then(m => m.StoreManageModule),
        },
        {
            path: 'storeManage/create',
            loadChildren: () => import('./mall-management/store-mange/edit-store/edit-store.module').then(m => m.EditStoreModule)
        },
        {
            path: 'storeManage/edit/:id',
            loadChildren: () => import('./mall-management/store-mange/edit-store/edit-store.module').then(m => m.EditStoreModule)
        },
        // 业态
        {path: 'businessType', loadChildren: () => import('./mall-management/bs-type/bs-type.module').then(m => m.BsTypeModule)},

        {
            path: 'secondType',
            loadChildren: () => import('./mall-management/bs-type/second-type/second-type.module').then(m => m.SecondTypeModule)
        },

        // 地图
        // {
        //     path: 'airport',
        //     // 动态导入 esnext新功能 旧的字符串导入将会淘汰
        //     loadChildren: () => import('./airport-map/airport-map.module').then(m => m.AirportMapModule),
        // },
        // 终端管理 激活码
        {
            path: 'activation',
            loadChildren: () => import('./activation-code/activation-code.module').then(m => m.ActivationCodeModule)
        },
        // {
        //     path: 'bpmn',
        //     loadChildren: () => import('./bpmn/bpmn.module').then(m => m.BpmnModule),
        //     data: {title: 'nav.process.bpmn', module: 'bpmn', parentTitle: 'nav.process.title', parentModule: ''},
        // },
        // 营销管理
        // 营销日历
        {
            path: 'marketingPlan',
            loadChildren: () => import('./marketing-calendar/calendar.module').then(m => m.CalendarModule)
        },
        // 营销策略
        {
            path: 'strategy',
            loadChildren: () => import('./market-strategy/market-strategy.module').then(m => m.MarketStrategyModule),
            data: {title: '营销策略列表'},
        },
        {
            path: 'strategyView',
            loadChildren: () => import('./market-strategy/market-strategy.module').then(m => m.MarketStrategyModule),
            data: {title: '营销策略审核'},
        },
        // 新建流程
        {
            path: 'strategyCreate',
            loadChildren: () => import('./market-strategy/edit-strategy/edit-strategy.module').then(m => m.EditStrategyModule),
        },
        // 编辑流程
        {
            path: 'strategy/edit',
            loadChildren: () => import('./market-strategy/edit-strategy/edit-strategy.module').then(m => m.EditStrategyModule),
        },
        // // 营销数据分析
        // {
        //     path: 'AnalysisOfMarketingData/:id',
        //     loadChildren: () => import('./passengers-analysis/analysis-of-marketing-data/analysis-of-marketing-data.module').then(m => m.AnalysisOfMarketingDataModule)
        // },
        // 商业预测分析
        {
            path: 'businessForecast',
            loadChildren: () => import('./business-forecast/business-forecast.module').then(m => m.BusinessForecastModule)
        },
        // 营销管理
        {
            path: 'marketingManage',
            loadChildren: () => import('./marketing-manage/marketing-manage.module').then(m => m.MarketingManageModule)
        },
        {
            path: 'marketingManage/marketingManageAdd',
            loadChildren: () => import('./marketing-manage/marketing-manage-add/marketing-manage-add.module').then(m => m.MarketingManageAddModule)
        },
        {
            path: 'marketingManage/marketingManageDetail/:id',
            loadChildren: () => import('./marketing-manage/marketing-manage-detail/marketing-manage-detail.module').then(m => m.MarketingManageDetailModule)
        },
        {
            path: 'marketingManage/marketingManageEdit/:id',
            loadChildren: () => import('./marketing-manage/marketing-manage-edit/marketing-manage-edit.module').then(m => m.MarketingManageEditModule)
        },
        {
            path: 'marketingManageComponent/essay',
            loadChildren: () => import('./marketing-manage/essay/essay.module').then(m => m.EssayModule)
        },
        // 文章新建
        {
            path: 'marketingManageComponent/essay/add',
            loadChildren: () => import('./marketing-manage/essay/essay-add/essay-add.module').then(m => m.EssayAddModule),
            data: {operation: 'create'}

        },
        // 文章详情
        {
            path: 'marketingManageComponent/essay/add/:id',
            loadChildren: () => import('./marketing-manage/essay/essay-add/essay-add.module').then(m => m.EssayAddModule),
            data: {operation: 'detail'}

        },
        /******** 内容管理 *********/
        // 商户反馈
        {path: 'merchantFeedback', loadChildren: () => import('./contentManage/merchant-feedback/merchant-feedback.module').then(m => m.MerchantFeedbackModule)},
        // 常见问题
        {path: 'standardQuestion', loadChildren: () => import('./contentManage/standard-question/standard-question.module').then(m => m.StandardQuestionModule)},
        // 会员反馈
        {path: 'memberFeedback', loadChildren: () => import('./contentManage/member-feedback/member-feedback.module').then(m => m.MemberFeedbackModule)},
        // 商户公告
        {path: 'merchantNotice', loadChildren: () => import('./contentManage/merchant-notice/merchant-notice.module').then(m => m.MerchantNoticeModule)},

        // 电子券列表
        {
            path: 'ElectronicVoucherManagement',
            loadChildren: () => import('./ecoupon-list/coupon-list-module.module').then(m => m.CouponListModule)
        },
        // 券规则
        {
            path: 'CouponMaintainComponent',
            loadChildren: () => import('./ecoupon-list/coupon-maintain/coupon-maintain-module.module').then(m => m.CouponMaintainModule)
        },
        // 新增券规则
        {
            path: 'AddSecuritiesRulesComponent',
            loadChildren: () => import( './ecoupon-list/coupon-maintain/add-securities-rules/add-securities-rules-component.module').then(m => m.AddSecuritiesRulesComponentModule)
        },
        // 券规则详情
        {
            path: 'CouponMaintainComponent/EditSecuritiesRulesComponent/:id',
            loadChildren: () => import('./ecoupon-list/coupon-maintain/edit-securities-rules/edit-securities-rules-component.module')
                .then(m => m.EditSecuritiesRulesComponentModule)
        },
        // 券批次列表
        {
            path: 'CouponLotComponent',
            loadChildren: () => import('./coupon-lot/coupon-lot-list/coupon-lot.module').then(m => m.CouponLotModule),
        },
        // 新建券批次
        {
            path: 'CouponLotAddDetailComponent/:id',
            loadChildren: () => import('./coupon-lot/coupon-lot-add-detail/coupon-lot-add-detail.module').then(m => m.CouponLotAddDetailModule),
            data: {operation: 'create'}
        },
        // 券批次详情
        {
            path: 'CouponLotComponent/BatchAddDetailComponent/:id',
            loadChildren: () => import('./coupon-lot/coupon-lot-add-detail/coupon-lot-add-detail.module').then(m => m.CouponLotAddDetailModule),
            /// loadChildren: () => import('./coupon-lot/batch-add-detail/batch-add-detail.module').then(m => m.BatchAddDetailModule),
            data: {operation: 'detail'}
        },
        // 核销记录
        {
            path: 'writeOffRecord',
            loadChildren: () => import('./write-off-record/write-off-record.module').then(m => m.WriteOffRecordModule)
        },
        // 电子券补发
        {
            path: 'couponReissue',
            loadChildren: () => import('./coupon-reissue/coupon-reissue.module').then(m => m.CouponReissueModule)
        },
        // 购买记录
        {
            path: 'purchaseHistory',
            loadChildren: () => import('./purchase-history/purchase-history.module').then(m => m.PurchaseHistoryModule)
        },
        // 标签管理 - 商户标签  品牌标签
        {
            path: 'MerchantsTagManagement',
            loadChildren: () => import('./tag-management/merchants-tag-management/merchants-tag-management.module').then(m => m.MerchantsTagManagementModule)
        },
        // 标签管理 - 商户标签【品牌标签】详情
        {
            path: 'MerchantsTagManagement/TagDetailManagement/:id',
            loadChildren: () => import('./tag-management/merchants-tag-management/tag-detail-management/tag-detail-management.module').then(m => m.TagDetailManagementModule),
            data: {operation: 'detail'}
        },
        // 新增商户标签
        {
            path: 'MerchantsTagManagement/createMerchantsTag',
            loadChildren: () => import('./tag-management/merchants-tag-management/tag-detail-management/tag-detail-management.module').then(m => m.TagDetailManagementModule),
            data: {operation: 'create'}
        },
        // 标签管理 - 常旅客标签
        {
            path: 'PassengersTagManagement',
            loadChildren: () => import('./tag-management/passengers-tag-management/passengers-tag-management.module').then(m => m.PassengersTagManagementModule)
        },
        // 常旅客标签详情
        {
            path: 'PassengersTagManagement/PassengersTagDetail/:id',
            loadChildren: () => import('./tag-management/passengers-tag-management/passengers-tag-detail/passengers-tag-detail.module').then(m => m.PassengersTagDetailModule),
            data: {operation: 'detail'}
        },
        // 常旅客标签新增
        {
            path: 'passengersTagManagement/createPassengersTag',
            loadChildren: () => import('./tag-management/passengers-tag-management/passengers-tag-detail/passengers-tag-detail.module').then(m => m.PassengersTagDetailModule),
            data: {operation: 'create'}
        },
        // 标签管理 - 营销标签
        {
            path: 'MarketingTagManagement',
            loadChildren: () => import('./tag-management/marketing-tag-management/marketing-tag-management.module').then(m => m.MarketingTagManagementModule)
        },
        // 营销标签详情
        {
            path: 'MarketingTagManagement/MarketingTagDetail/:id',
            loadChildren: () => import('./tag-management/marketing-tag-management/marketing-tag-detail/marketing-tag-detail.module').then(m => m.MarketingTagDetailModule),
            data: {operation: 'detail'}
        },
        // 营销标签新增
        {
            path: 'MarketingTagManagement/MarketingTagAdd',
            loadChildren: () => import('./tag-management/marketing-tag-management/marketing-tag-detail/marketing-tag-detail.module').then(m => m.MarketingTagDetailModule),
            data: {operation: 'create'}

        },
        // 积分联盟 --- 成员列表
        {
            path: 'MembersListComponent',
            loadChildren: () => import('./bonus-point-rules/members-list/members-list.module').then(m => m.MembersListModule)
        },
        // 积分联盟 -- 新建成员
        {
            path: 'AddMemberComponent',
            loadChildren: () => import('./bonus-point-rules/add-member/add-member.module').then(m => m.AddMemberModule)
        },
        // 积分联盟 -- 弹出框模板
        {
            path: 'MemberTemplateComponent',
            loadChildren: () => import('./bonus-point-rules/member-template/member-template.module').then(m => m.MemberTemplateModule)
        },
        // 积分联盟 -- 积分规则
        {
            path: 'BonusPointRulesComponent',
            loadChildren: () => import('./bonus-point-rules/integral-rule-list/integral-rule-list.module').then(m => m.IntegralRuleListModule)
        },
        // 积分规则 -- 新建规则
        {
            path: 'BonusPointRulesComponent/create',
            loadChildren: () => import('./bonus-point-rules/integral-rule/integral-rule.module').then(m => m.IntegralRuleModule),
            data: {operation: 'create'}
        },

        {
            path: 'BonusPointRulesComponent/detail/:id',
            loadChildren: () => import('./bonus-point-rules/integral-rule/integral-rule.module').then(m => m.IntegralRuleModule),
            data: {operation: 'detail'}
        },

        // 积分联盟 -- 新建互动积分
        {
            path: 'BonusPointRulesComponent/AddInteractsBonusPointRuleComponent/:id',
            loadChildren: () => import('./bonus-point-rules/add-interacts-bonus-point-rule/add-interacts-bonus-point-rule.module').then(m => m.AddInteractsBonusPointRuleModule)
        },
        // 积分联盟 -- 新建消费积分
        {
            path: 'BonusPointRulesComponent/AddConsumeBonusPointRuleComponent/:id',
            loadChildren: () => import('./bonus-point-rules/add-consume-bonus-point-rule/add-consume-bonus-point-rule.module').then(m => m.AddConsumeBonusPointRuleModule)
        },
        // 积分供应商 -- 积分调整
        {
            path: 'integralAdjustment',
            loadChildren: () => import('./integral-adjustment/integral-adjustment.module').then(m => m.IntegralAdjustmentModule)
        },
        // 品牌管理 -- 品牌列表
        {
            path: 'brandManage',
            loadChildren: () => import('./brand-manage/brand-manage.module').then(m => m.BrandManageModule),
        },
        // 品牌详情
        {
            path: 'brandManage/Detail/:id',
            loadChildren: () => import('./brand-manage/brand-manage-detail/brand-manage-detail.module').then(m => m.BrandManageDetailModule),
            data: {operation: 'detail'}
        },
        // 品牌新建
        {
            path: 'brandManage/create',
            loadChildren: () => import('./brand-manage/brand-manage-detail/brand-manage-detail.module').then(m => m.BrandManageDetailModule),
            data: {operation: 'create'}
        },
        // 常旅客管理 常旅客列表 会员列表
        {
            path: 'passengersManage',
            loadChildren: () => import('./memberManagement/passengers-manage/passengers-manage.module').then(m => m.PassengersManageModule)
        },
        // 常旅客管理 常旅客详情
        // {
        //     path: 'passengersManage/passengersManageDetail/:id',
        //     loadChildren: () => import('./passengers-manage/passengers-manage-detail/passengers-manage-detail.module').then(m => m.PassengersManageDetailModule)
        // },
        // 会员详情
        {
            path: 'passengersManage/passengersManageDetail/:id',
            loadChildren: () => import('./memberManagement/passengers-manage/passengers-detail/passengers-detail.module').then(m => m.PassengersDetailModule)
        },
        // 常旅客管理 -- 会员基础设置
        {
            path: 'membersBasicSetting',
            loadChildren: () => import('./members-basic-setting/members-basic-setting.module').then(m => m.MembersBasicSettingModule),
        },
        // 会员基础设置详情
        {
            path: 'membersSettingDetail/:id',
            loadChildren: () => import('./members-basic-setting/members-setting-detail/members-setting-detail.module').then(m => m.MembersSettingDetailModule),
            data: {operation: 'detail'}
        },
        // 会员基础设置新建
        {
            path: 'createBasicMember',
            loadChildren: () => import('./members-basic-setting/members-setting-detail/members-setting-detail.module').then(m => m.MembersSettingDetailModule),
            data: {operation: 'create'}
        },

        // 会员卡列表
        {
            path: 'memberCard',
            loadChildren: () => import('./memberManagement/member-card/member-card.module').then(m => m.MemberCardModule),
        },
        // 会员卡新增
        {
            path: 'memberCard/add',
            loadChildren: () => import('./memberManagement/member-card/member-card-detail/member-card-detail.module').then(m => m.MemberCardDetailModule),
            data: {operation: 'create'}
        },
        // 会员卡详情
        {
            path: 'memberCard/edit/:id',
            loadChildren: () => import('./memberManagement/member-card/member-card-detail/member-card-detail.module').then(m => m.MemberCardDetailModule),
            data: {operation: 'detail'}
        },
        // 常旅客会员 ---->常旅客画像
        {
            path: 'portrait',
            loadChildren: () => import('./memberManagement/member-portrait/member-portrait.module').then(m => m.MemberPortraitModule)
        },
        // 拍照积分列表
        {
            path: 'pictureIntegral',
            loadChildren: () => import('./memberManagement/picture-integral/picture-integral.module').then(m => m.PictureIntegralModule)
        },
        // 常旅客分群
        {
            path: 'memberGroup',
            loadChildren: () => import('./memberManagement/member-group/member-group.module').then(m => m.MemberGroupModule)
        },
        // 常旅客分群-新增
        {
            path: 'memberGroup/memberGroupAdd',
            loadChildren: () => import('./memberManagement/member-group/member-group-add/member-group-add.module').then(m => m.MemberGroupAddModule),
            data: {operation: 'create'}
        },
        // 常旅客分群-编辑
        {
            path: 'memberGroup/memberGroupEdit',
            loadChildren: () => import('./memberManagement/member-group/member-group-edit/member-group-edit.module').then(m => m.MemberGroupEditModule),
            data: {operation: 'detail'}
        },
        // 会员设置
        {
            path: 'memberSetting',
            loadChildren: () => import('./memberManagement/member-setting/member-setting.module').then(m => m.MemberSettingModule),
        },
        /*********** 渠道管理 ************/
        // 订阅消息管理
        {
            path: 'appletMaskMessageSubscribe',
            loadChildren: () => import('./applet-mask/message-subscribe/message-subscribe.module').then(m => m.MessageSubscribeModule),
        },
        {
            path: 'appletMaskMessageSubscribe/create',
            loadChildren: () => import('./applet-mask/message-subscribe/message-subscribe-detail/message-subscribe-detail.module').then(m => m.MessageSubscribeDetailModule),
            data: {operation: 'create', title: '消息供应商新增'}
        },
        {
            path: 'appletMaskMessageSubscribe/detail',
            loadChildren: () => import('./applet-mask/message-subscribe/message-subscribe-detail/message-subscribe-detail.module').then(m => m.MessageSubscribeDetailModule),
            data: {operation: 'detail', title: '消息供应商详情'}
        },
        // 小程序蒙屏列表
        {
            path: 'AppletMaskList',
            loadChildren: () => import('./applet-mask/applet-mask.module').then(m => m.AppletMaskModule),
        },
        // 小程序蒙屏 页面新增跳转
        {
            path: 'appletMaskCopyComponent/:id',
            loadChildren: () => import('./applet-mask/applet-mask-copy/applet-mask-copy.module').then(m => m.AppletMaskCopyModule),
        },
        // 小程序蒙屏 真正的新增详情页
        {
            path: 'AppletMaskList/AppletMaskAddDetail/:id',
            loadChildren: () => import('./applet-mask/applet-mask-add-detail/applet-mask-add-detail.module').then(m => m.AppletMaskAddDetailModule),
        },
        // 小程序蒙屏 轮播图管理
        {
            path: 'RotationPictureComponent',
            loadChildren: () => import('./applet-carousel-list/applet-carousel-list.module').then(m => m.AppletCarouselListModule),
        },

        {
            path: 'RotationPictureComponent/create',
            loadChildren: () => import('./applet-carousel-list/applet-carousel-detail/applet-carousel-detail.module').then(m => m.AppletCarouselDetailModule),
            data: {operation: 'create', title: '小程序轮播新建'}
        },

        {
            path: 'RotationPictureComponent/detail/:id',
            loadChildren: () => import('./applet-carousel-list/applet-carousel-detail/applet-carousel-detail.module').then(m => m.AppletCarouselDetailModule),
            data: {operation: 'detail', title: '小程序轮播详情'}
        },

        // 小程序游戏
        {
            path: 'appletGame',
            loadChildren: () => import('./applet-game/applet-game.module').then(m => m.AppletGameModule)
        },
        {
            path: 'appletGame/create',
            loadChildren: () => import('./applet-game/game-detail/game-detail.module').then(m => m.GameDetailModule)
        },
        {
            path: 'appletGame/:id',
            loadChildren: () => import('./applet-game/game-detail/game-detail.module').then(m => m.GameDetailModule)
        },

        // 广告屏管理
        {
            path: 'advertisingScreen',
            loadChildren: () => import('./advertising-screen/advertising-screen.module').then(m => m.AdvertisingScreenModule)
        },
        {
            path: 'advertisingScreen/create',
            loadChildren: () => import('./advertising-screen/advertising-screen-detail/advertising-screen-detail.module').then(m => m.AdvertisingScreenDetailModule),
            data: {operation: 'create', title: '广告屏新建'}
        },

        {
            path: 'advertisingScreen/detail/:id',
            loadChildren: () => import('./advertising-screen/advertising-screen-detail/advertising-screen-detail.module').then(m => m.AdvertisingScreenDetailModule),
            data: {operation: 'detail', title: '广告屏详情'}
        },

        {
            path: 'parameterQRCode',
            loadChildren: () => import('./applet-mask/parameter-qrcode/parameter-qrcode.module').then(m => m.ParameterQRCodeModule),
        },

        // 舆情管理 - 评论列表
        {
            path: 'WriteIdeaList',
            loadChildren: () => import('./write-idea-list/writeIdeaList/write-idea-list.module').then(m => m.WriteIdeaListModule),
        },
        // 舆情管理 - 评论详情
        {
            path: 'WriteIdeaList/detail/:id',
            loadChildren: () => import('./write-idea-list/writeIdeaList/write-idea-detail/write-idea-detail.module').then(m => m.WriteIdeaDetailModule),
        },
        // 舆情管理 - 评论设置
        {
            path: 'WriteIdeaSetUp',
            loadChildren: () => import('./write-idea-list/write-idea-set-up/write-idea-set-up.module').then(m => m.WriteIdeaSetUpModule),
        },
        // 舆情管理 - 舆情监控
        {
            path: 'WriteIdeaControl',
            loadChildren: () => import('./write-idea-list/write-idea-control/write-idea-control.module').then(m => m.WriteIdeaControlModule),
        },
        // 评论管理 - 意见反馈
        {
            path: 'opinionFeedback',
            loadChildren: () => import('./write-idea-list/opinion-feedback/opinion-feedback.module').then(m => m.OpinionFeedbackModule),
        },

        // 消息管理 -短信模板
        {
            path: 'messageTemplate',
            loadChildren: () => import('./message-template/message-template.module').then(m => m.MessageTemplateModule),
        },
        // 消息管理 - 新建模板
        {
            path: 'messageTemplate/add',
            loadChildren: () => import('./message-template/message-template-detail/message-template-detail.module').then(m => m.MessageTemplateDetailModule),
            data: {operation: 'create'}
        },
        // 消息管理 - 短信模板详情
        {
            path: 'messageTemplate/edit/:id',
            loadChildren: () => import('./message-template/message-template-detail/message-template-detail.module').then(m => m.MessageTemplateDetailModule),
            data: {operation: 'detail'}
        },
        // 已发短信
        {
            path: 'messageHistory',
            loadChildren: () => import('./message-history/message-history.module').then(m => m.MessageHistoryModule),
        },
        // 商场数据

        {
            path: 'mallList',
            loadChildren: () => import('./mall-list/mall-list.module').then(m => m.MallListModule),
        },
        // 常旅客关联标签
        {
            path: 'relationPassengerTags',
            loadChildren: () => import('./relation-passenger-tags/relation-passenger-tags.module').then(m => m.RelationPassengerTagsModule),
        },
        // 预约报名  事件列表
        {
            path: 'appointmentList',
            loadChildren: () => import('./appointment/appointment-list/appointment.module').then(m => m.AppointmentModule),
        },
        // 预约报名  新建事件
        {
            path: 'appointmentAdd/:id',
            loadChildren: () => import('./appointment/appointment-add/appointment-add.module').then(m => m.AppointmentAddModule),
        },
        // 预约报名  编辑事件
        {
            path: 'appointmentList/edit/:id',
            loadChildren: () => import('./appointment/appointment-add/appointment-add.module').then(m => m.AppointmentAddModule),
        },
        // 预约报名  申请列表
        {
            path: 'applicationList',
            loadChildren: () => import('./appointment/application-list/application-list.module').then(m => m.ApplicationListModule),
        },
        // 预约报名  付款记录
        {
            path: 'paymentRecord',
            loadChildren: () => import('./appointment/payment-record/payment-record.module').then(m => m.PaymentRecordModule),
        },
        /** 系统设置*/
        // 角色管理
        {
            path: 'roleManage',
            loadChildren: () => import('./role-manage/role-manage.module').then(m => m.RoleManageModule)
        },
        // 新建角色
        {
            path: 'roleManage/create',
            loadChildren: () => import('./role-manage/edit-role/edit-role.module').then(m => m.EditRoleModule)
        },
        // 编辑角色
        {
            path: 'roleManage/edit/:id',
            loadChildren: () => import('./role-manage/edit-role/edit-role.module').then(m => m.EditRoleModule)
        },
        // 系统设置---账户管理
        {
            path: 'account',
            loadChildren: () => import('./account-manage/account-manage.module').then(m => m.AccountManageModule)
        },

        /*********************活动配置*******************/
        // 优惠卷列表
        {
            path: 'couponList',
            data: {title: '优惠券列表'},
            loadChildren: () => import('./coupon-manage/coupon-list/coupon-list.module').then(m => m.CouponListModule)
        },
        // 优惠卷批次
        {
            path: 'couponBatch',
            data: {title: '优惠券批次'},
            loadChildren: () => import('./coupon-manage/coupon-batch/coupon-batch.module').then(m => m.CouponBatchModule)
        },
        // 优惠卷批次-详情
        {
            path: 'couponBatch/detail',
            loadChildren: () => import('./coupon-manage/coupon-batch/coupon-batch-detail/coupon-batch-detail.module').then(m => m.CouponBatchDetailModule),
            data: {operation: 'detail', title: '优惠券批次详情'}
        },
        {
            path: 'couponBatch/create',
            loadChildren: () => import('./coupon-manage/coupon-batch/coupon-batch-detail/coupon-batch-detail.module').then(m => m.CouponBatchDetailModule),
            data: {operation: 'create', title: '新建优惠券批次'}
        },
        // 优惠卷规则
        {
            path: 'couponRule',
            data: {title: '优惠券规则'},
            loadChildren: () => import('./coupon-manage/coupon-rule/coupon-rule.module').then(m => m.CouponRuleModule)
        },
        {
            path: 'couponRule/edit',
            loadChildren: () => import('./coupon-manage/coupon-rule/coupon-rule-detail/coupon-rule-detail.module').then(m => m.CouponRuleDetailModule),
            data: {operation: 'detail', title: '优惠券规则详情'}
        },
        {
            path: 'couponRule/create',
            loadChildren: () => import('./coupon-manage/coupon-rule/coupon-rule-detail/coupon-rule-detail.module').then(m => m.CouponRuleDetailModule),
            data: {operation: 'create', title: '新建优惠券规则'}
        },
        // 优惠卷推送
        {
            path: 'couponPush',
            data: {title: '优惠券推送'},
            loadChildren: () => import('./coupon-manage/coupon-push/coupon-push.module').then(m => m.CouponPushModule)
        },
        // 活动列表
        {
            path: 'activityList',
            data: {title: '活动列表'},
            loadChildren: () => import('./coupon-manage/activity-list/activity-list.module').then(m => m.ActivityListModule)
        },
        {
            path: 'activityList/edit',
            loadChildren: () => import('./coupon-manage/activity-list/activity-list-detail/activity-list-detail.module').then(m => m.ActivityListDetailModule),
            data: {operation: 'detail', title: '活动详情'}
        },
        {
            path: 'activityList/create',
            loadChildren: () => import('./coupon-manage/activity-list/activity-list-detail/activity-list-detail.module').then(m => m.ActivityListDetailModule),
            data: {operation: 'create', title: '新建活动'}
        },
        // 活动审核
        {
            path: 'activityReview',
            data: {title: '活动审核'},
            loadChildren: () => import('./coupon-manage/activity-review/activity-review.module').then(m => m.ActivityReviewModule)
        },
        {
            path: 'activityReview/edit',
            loadChildren: () => import('./coupon-manage/activity-review/activity-review-detail/activity-review-detail.module').then(m => m.ActivityReviewDetailModule),
            data: {operation: 'detail', title: '活动审核详情'}
        },
        // 会员报表，默认第一个是生日月报表
        {
            path: 'memberReport',
            loadChildren: () => import('./report-manage/report-down-manage/report-main-manage.module').then(m => m.ReportMainManageModule),
            data: {operation: 'birth', title: '会员报表之生日月报表'}
        },
        // // 会员统计
        // {
        //     path: 'passengersAnalysis',
        //     loadChildren: () => import('./passengers-analysis/passengers-analysis.module').then(m => m.PassengersAnalysisModule)
        // },
        // 小程序统计
        // {
        //     path: 'BusinessDataAnalysis',
        //     loadChildren: () => import('./passengers-analysis/business-data-analysis/business-data-analysis.module').then(m => m.BusinessDataAnalysisModule)
        // },

    ];

@NgModule({
    imports: [RouterModule.forChild(routes)]
})
export class AppsModule {

}
