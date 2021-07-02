import {FuseNavigation} from '@fuse/types';

export const Navigation: FuseNavigation[] = [
    {
        id: 'ROLE_BACKEND_APPS',
        title: '应用',
        translate: 'nav.applications',
        type: 'group',
        children: [
            {
                id: 'ROLE_BACKEND_APPS_BRAND',
                title: '品牌管理',
                translate: 'nav.brandManagement.title',
                type: 'collapsable',
                icon: 'iconfloor',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_BRAND_LIST',
                        title: '品牌列表',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                        url: 'apps/brandManage'
                    },
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_MAIN',
                title: '主档管理',
                translate: 'nav.dataManagement.title',
                type: 'collapsable',
                icon: 'iconmasterdata',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_MAIN_BLOC',
                        title: '集团管理',
                        translate: 'nav.dataManagement.group',
                        type: 'item',
                        url: 'apps/groupManage'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MAIN_MALL',
                        title: '商场管理',
                        translate: 'nav.dataManagement.mall',
                        type: 'item',
                        url: 'apps/mallManage'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MAIN_TERMINAL',
                        title: '街区管理',
                        translate: 'nav.dataManagement.terminal',
                        type: 'item',
                        url: 'apps/terminalManage'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MAIN_MAP',
                        title: '街区地图',
                        translate: 'nav.dataManagement.map',
                        type: 'item',
                        url: 'apps/terminalMap'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MAIN_STORE',
                        title: '商户管理',
                        translate: 'nav.dataManagement.store',
                        type: 'item',
                        url: 'apps/storeManage',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MAIN_TYPE',
                        title: '业态管理',
                        translate: '业态管理',
                        type: 'collapsable',
                        children: [
                            {
                                id: 'ROLE_BACKEND_APPS_MAIN_TYPE_FIRST',
                                title: '一级业态',
                                translate: '一级业态',
                                type: 'item',
                                url: 'apps/businessType'
                            },
                            {
                                id: 'ROLE_BACKEND_APPS_MAIN_TYPE_SECOND',
                                title: '二级业态',
                                translate: '二级业态',
                                type: 'item',
                                url: 'apps/secondType'
                            }
                        ]
                    },
                ]
            },
            // {
            //     id: 'ROLE_BACKEND_APPS_TERMINAL',
            //     title: '终端管理',
            //     translate: 'nav.terminalManage.title',
            //     type: 'collapsable',
            //     icon: 'iconopencentre',
            //     children: [
            //         {
            //             id: 'ROLE_BACKEND_APPS_TERMINAL_ACTIVATION',
            //             title: '激活码',
            //             translate: 'nav.terminalManage.activation',
            //             type: 'item',
            //             url: 'apps/activation'
            //         }
            //     ]
            // },
            // {
            //     id: 'ROLE_BACKEND_APPS_PLAN',
            //     title: '营销计划管理',
            //     translate: 'nav.marketingPlanManage.title',
            //     type: 'collapsable',
            //     icon: 'calendar_today',
            //     children: [
            //         {
            //             id: 'ROLE_BACKEND_APPS_PLAN_MARKETING',
            //             title: '营销计划',
            //             translate: 'nav.marketingPlanManage.main',
            //             type: 'item',
            //             url: 'apps/marketingPlan',
            //         },
            //     ]
            // },
            // {
            //     id: 'ROLE_BACKEND_APPS_MARKETING',
            //     title: '营销管理',
            //     translate: 'nav.marketingManage.title',
            //     type: 'collapsable',
            //     icon: 'iconmarketing',
            //     children: [
            //         // {
            //         //     id: 'ROLE_BACKEND_APPS_MARKETING_ACTIVITY',
            //         //     title: '营销活动',
            //         //     translate: 'nav.marketingManage.list',
            //         //     type: 'item',
            //         //     url: 'apps/marketingManage',
            //         // },
            //         {
            //             id: 'ROLE_BACKEND_APPS_MARKETING_ESSAY',
            //             title: '营销文章',
            //             translate: 'nav.marketingManage.essayList',
            //             type: 'item',
            //             url: 'apps/marketingManageComponent/essay',
            //         }
            //     ]
            // },
            {
                id: 'ROLE_BACKEND_APPS_STRATEGY',
                title: '营销引擎',
                translate: 'nav.marketingStrategy.title',
                type: 'collapsable',
                icon: 'iconmarketingstrategy',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_STRATEGY_CREATE',
                        title: '新建营销引擎',
                        translate: 'nav.marketingStrategy.create',
                        type: 'item',
                        url: 'apps/strategyCreate'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_STRATEGY_LIST',
                        title: '营销策略列表',
                        translate: 'nav.marketingStrategy.list',
                        type: 'item',
                        url: 'apps/strategy'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_STRATEGY_LIST_VIEW',
                        title: '营销策略审核',
                        translate: 'nav.marketingStrategy.listView',
                        type: 'item',
                        url: 'apps/strategyView'
                    }
                ]
            },
            // {
            //     id: 'ROLE_BACKEND_APPS_COUPON',
            //     title: '电子券管理',
            //     translate: 'ElectronicVoucherManagement.eCouponListParent',
            //     type: 'collapsable',
            //     icon: 'iconcoupon',
            //     children: [
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_CREATEBATCH',
            //             title: '新建券批次',
            //             translate: 'ElectronicVoucherManagement.CouponLot.add',
            //             type: 'item',
            //             url: 'apps/CouponLotAddDetailComponent/ADD_ID',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_CREATERULE',
            //             title: '新建券规则',
            //             translate: 'ElectronicVoucherManagement.AddSecuritiesRules.title',
            //             type: 'item',
            //             url: 'apps/AddSecuritiesRulesComponent',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_COUPONLIST',
            //             title: '电子券列表',
            //             translate: 'ElectronicVoucherManagement.PageFirst.title',
            //             type: 'item',
            //             url: 'apps/ElectronicVoucherManagement',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_BATCHLIST',
            //             title: '电子券批次',
            //             translate: 'ElectronicVoucherManagement.CouponLot.title',
            //             type: 'item',
            //             url: 'apps/CouponLotComponent',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_RULELIST',
            //             title: '电子券规则',
            //             translate: 'ElectronicVoucherManagement.PageTwice.title',
            //             type: 'item',
            //             url: 'apps/CouponMaintainComponent',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_WRITEOFFRECORD',
            //             title: '核销记录',
            //             translate: 'nav.couponManagement.writeOffRecord',
            //             type: 'item',
            //             url: 'apps/writeOffRecord'
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_COUPONREISSUE',
            //             title: '电子券补发',
            //             translate: 'nav.couponManagement.couponReissue',
            //             type: 'item',
            //             url: 'apps/couponReissue'
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_COUPON_PURCHASEHISTORY',
            //             title: '购买记录',
            //             translate: 'ElectronicVoucherManagement.purchaseHistory.title',
            //             type: 'item',
            //             url: 'apps/purchaseHistory'
            //         },
            //     ]
            // },
            {
                id: 'ROLE_BACKSTAGE_APPS_COUPON',
                title: '活动配置', // 权限里面是 优惠券管理
                translate: 'ActivityManagement.title',
                type: 'collapsable',
                icon: 'iconopencentre',
                children: [
                    {
                        id: 'ROLE_BACKSTAGE_APPS_COUPON_LIST',
                        title: '优惠券列表',
                        translate: 'ActivityManagement.CouponList.title',
                        type: 'item',
                        url: 'apps/couponList'
                    },
                    {
                        id: 'ROLE_BACKSTAGE_APPS_COUPON_BATCH',
                        title: '优惠券批次',
                        translate: 'ActivityManagement.CouponBatch.title',
                        type: 'item',
                        url: 'apps/couponBatch'
                    },
                    {
                        id: 'ROLE_BACKSTAGE_APPS_COUPON_RULE',
                        title: '优惠券规则',
                        translate: 'ActivityManagement.CouponRule.title',
                        type: 'item',
                        url: 'apps/couponRule'
                    },
                    {
                        id: 'ROLE_BACKSTAGE_APPS_COUPON_PUSH',
                        title: '优惠券发放',
                        translate: 'ActivityManagement.CouponPush.title', // 权限里面是 优惠券推送
                        type: 'item',
                        url: 'apps/couponPush'
                    },
                    {
                        id: 'ROLE_BACKSTAGE_APPS_ACTIVITY_LIST',
                        title: '活动列表',
                        translate: 'ActivityManagement.ActivityList.title',
                        type: 'item',
                        url: 'apps/activityList'
                    },
                    {
                        id: 'ROLE_BACKSTAGE_APPS_ACTIVITY_REVIEW',
                        title: '活动审核',
                        translate: 'ActivityManagement.ActivityReview.title',
                        type: 'item',
                        url: 'apps/activityReview'
                    }
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_APPOINTMENT',
                title: '预约报名',
                translate: 'appointment.title',
                type: 'collapsable',
                icon: 'iconinformation',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_APPOINTMENT_LIST',
                        title: '事件列表',
                        translate: 'appointment.titleList',
                        type: 'item',
                        url: 'apps/appointmentList',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPOINTMENT_CREATE',
                        title: '新建事件',
                        translate: 'appointment.titleAdd',
                        type: 'item',
                        url: 'apps/appointmentAdd/ADD',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPOINTMENT_APPLYLIST',
                        title: '申请列表',
                        translate: 'appointment.apply.list',
                        type: 'item',
                        url: 'apps/applicationList',
                    },
                    /* {
                         id: 'paymentRecord',
                         title: '付款记录',
                         translate: 'appointment.payRecord.list',
                         type: 'item',
                         url: 'apps/paymentRecord',
                     },*/
                ]
            },
            // {
            //     id: 'ROLE_BACKEND_APPS_MESSAGE',
            //     title: '消息管理',
            //     translate: 'nav.messageManage.title',
            //     type: 'collapsable',
            //     icon: 'iconinformation',
            //     children: [
            //         {
            //             id: 'ROLE_BACKEND_APPS_MESSAGE_LIST',
            //             title: '消息模板',
            //             translate: 'messageTemplate.list',
            //             type: 'item',
            //             url: 'apps/messageTemplate',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_MESSAGE_HISTORY',
            //             title: '已发消息',
            //             translate: 'messageHistory.list',
            //             type: 'item',
            //             url: 'apps/messageHistory',
            //         }
            //     ]
            // },
            {
                id: 'ROLE_BACKEND_APPS_MEMBER',
                title: '会员管理',
                translate: 'passengers.hq.title',
                type: 'collapsable',
                icon: 'iconmember',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_MEMBER_LIST',
                        title: '会员列表',
                        translate: 'passengers.hq.list',
                        type: 'item',
                        url: 'apps/passengersManage',
                    },
                    {
                        id: 'ROLE_BACKEND_MEMBER_PORTRAIT',
                        title: '会员画像',
                        translate: 'passengers.hq.portrait',
                        type: 'item',
                        url: 'apps/portrait',
                    },
                    // {
                    //     id: 'ROLE_BACKEND_APPS_MEMBER_SETTING',
                    //     title: '会员基础设置',
                    //     translate: 'membersBasicSetting.list',
                    //     type: 'item',
                    //     url: 'apps/membersBasicSetting',
                    // },
                    {
                        id: 'ROLE_BACKEND_APPS_MEMBER_CARD',
                        title: '会员卡列表',
                        translate: 'memberCard.list',
                        type: 'item',
                        url: 'apps/memberCard',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MEMBER_PICTURE',
                        title: '拍照积分',
                        translate: 'pictureIntegral.list',
                        type: 'item',
                        url: 'apps/pictureIntegral',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MEMBER_GROUP',
                        title: '会员分群',
                        translate: 'memberGroup.hq.list',
                        type: 'item',
                        url: 'apps/memberGroup',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_MEMBER_SET',
                        title: '会员设置',
                        translate: 'memberSetting.list',
                        type: 'item',
                        url: 'apps/memberSetting',
                    },
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_PROVIDER',
                title: '积分管理',
                translate: '积分管理',
                type: 'collapsable',
                icon: 'iconresetpassword',
                children: [
                    // {
                    //     id: 'ROLE_BACKEND_APPS_PROVIDER_LIST',
                    //     title: '积分供应商',
                    //     translate: '积分供应商',
                    //     type: 'item',
                    //     icon: '',
                    //     url: 'apps/MembersListComponent',
                    // },
                    // {
                    //     id: 'ROLE_BACKEND_APPS_PROVIDER_CREATE',
                    //     title: '新建积分供应商',
                    //     translate: 'BonusPointUnion.MembersList.AddMemberTitle',
                    //     type: 'item',
                    //     icon: '',
                    //     url: 'apps/AddMemberComponent',
                    // },
                    {
                        id: 'ROLE_BACKEND_APPS_PROVIDER_RULE',
                        title: '积分规则',
                        translate: 'BonusPointUnion.BonusPointRules.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/BonusPointRulesComponent',
                    },
                    /*  {
                          id: 'ROLE_BACKEND_APPS_PROVIDER_CREATERULE',
                          title: '新建积分规则',
                          translate: 'BonusPointUnion.BonusPointRules.AddRuleTitle',
                          type: 'item',
                          icon: '',
                          url: 'apps/AddRuleComponent',
                      },*/
                    {
                        id: 'ROLE_BACKEND_APPS_PROVIDER_ADJUSTMENT',
                        title: '积分调整',
                        translate: 'BonusPointUnion.integralAdjustment.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/integralAdjustment',
                    }
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_TAG',
                title: '标签管理',
                translate: 'TagManagement.TagManagementTitle',
                type: 'collapsable',
                icon: 'iconlabel',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_TAG_LIST',
                        title: '标签列表',
                        translate: 'TagManagement.MerchantsTagManagement.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/MerchantsTagManagement',
                    },
                    /*  {
                          id: 'membersTags',
                          title: '会员标签',
                          translate: 'TagManagement.PassengersTagManagement.hq.title',
                          type: 'item',
                          icon: '',
                          url: 'apps/PassengersTagManagement',
                      },
                      {
                          id: 'marketingTags',
                          title: '营销标签',
                          translate: 'TagManagement.MarketingTagManagement.title',
                          type: 'item',
                          icon: '',
                          url: 'apps/MarketingTagManagement',
                      },*/
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_REPORT_AGGREGATE',
                title: '统计报表',
                translate: 'reportAggregate.title',
                type: 'collapsable',
                icon: 'iconopencentre',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_REPORT_AGGREGATE_MEMBER',
                        title: '会员报表',
                        translate: 'reportMember.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/memberReport',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_ANALYSIS_MEMBER',
                        title: '会员统计',
                        translate: 'nav.analyst.passengersAnalysis',
                        type: 'item',
                        url: 'apps/passengersAnalysis',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_ANALYSIS_BUSINESS',
                        title: '小程序统计',
                        translate: 'nav.analyst.BusinessDataAnalysis',
                        type: 'item',
                        url: 'apps/BusinessDataAnalysis',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_ACTIVITY_ANALYSIS',
                        title: '活动统计',
                        translate: 'ActivityAnalysis.title',
                        type: 'item',
                        url: 'apps/activityAnalysis',
                    }
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_SYSTEM',
                title: '系统设置',
                translate: 'nav.system.title',
                type: 'collapsable',
                icon: 'settings',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_SYSTEM_ROLE',
                        title: '角色管理',
                        translate: 'nav.system.role',
                        type: 'item',
                        url: 'apps/roleManage',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_SYSTEM_ACCOUNT',
                        title: '账户管理',
                        translate: 'nav.system.account',
                        type: 'item',
                        url: 'apps/account',
                    },
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_APPLET',
                title: '渠道管理',
                translate: 'AppletMask.menuTitle',
                type: 'collapsable',
                icon: 'iconopencentre',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_APPLET_MESSAGE_SUBSCRIBE',
                        title: '订阅消息管理',
                        translate: 'AppletMask.messageSubscribe.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/appletMaskMessageSubscribe',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPLET_CREATEMASK',
                        title: '新建蒙屏',
                        translate: 'AppletMask.addDetail.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/appletMaskCopyComponent/POPUP_ADD',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPLET_MASKLIST',
                        title: '蒙屏列表',
                        translate: 'AppletMask.list.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/AppletMaskList',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPLET_CAROUSEL',
                        title: '轮播图管理',
                        translate: 'AppletMask.pictureList.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/RotationPictureComponent',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPLET_GAME',
                        title: '小程序游戏',
                        translate: '小程序游戏',
                        type: 'item',
                        url: 'apps/appletGame'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_APPLET_ADVERTISING',
                        title: '广告屏管理',
                        translate: '广告屏管理',
                        type: 'item',
                        url: 'apps/advertisingScreen'
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_PARAMETER_QR_CODE',
                        title: '带参二维码',
                        translate: '带参二维码',
                        type: 'item',
                        url: 'apps/parameterQRCode'
                    },
                ]
            },
            {
                id: 'ROLE_BACKEND_APPS_APPLET',
                title: '内容管理',
                translate: 'contentManage.menuTitle',
                type: 'collapsable',
                icon: 'iconinformation',
                children: [
                    {
                        id: 'ROLE_BACKEND_APPS_CONTENT_MANAGE_MERCHANT_FEEDBACK',
                        title: '商户反馈',
                        translate: 'contentManage.merchantFeedback.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/merchantFeedback',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_CONTENT_MANAGE_STANDARD_QUESTION',
                        title: '常见问题',
                        translate: 'contentManage.standardQuestion.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/standardQuestion',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_CONTENT_MANAGE_MEMBER_FEEDBACK',
                        title: '会员反馈',
                        translate: 'contentManage.memberFeedback.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/memberFeedback',
                    },
                    {
                        id: 'ROLE_BACKEND_APPS_CONTENT_MANAGE_MERCHANT_NOTICE',
                        title: '商户公告',
                        translate: 'contentManage.merchantNotice.title',
                        type: 'item',
                        icon: '',
                        url: 'apps/merchantNotice',
                    }
                ]
            },
            // {
            //     id: 'ROLE_BACKEND_APPS_OPINION',
            //     title: '评论管理',
            //     translate: 'PuSentiment.listTitle',
            //     type: 'collapsable',
            //     icon: 'iconinformation',
            //     children: [
            //         {
            //             id: 'ROLE_BACKEND_APPS_OPINION_MONITOR',
            //             title: '舆情看板',
            //             translate: 'PuSentiment.control.title',
            //             type: 'item',
            //             icon: '',
            //             url: 'apps/WriteIdeaControl',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_OPINION_COMMENT',
            //             title: '店铺评论',
            //             translate: 'PuSentiment.list.title',
            //             type: 'item',
            //             icon: '',
            //             url: 'apps/WriteIdeaList',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_OPINION_SETTING',
            //             title: '店铺评论设置',
            //             translate: 'PuSentiment.setUp.title',
            //             type: 'item',
            //             icon: '',
            //             url: 'apps/WriteIdeaSetUp',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_OPINION_FEEDBACK',
            //             title: '意见反馈',
            //             translate: 'PuSentiment.feedback.list',
            //             type: 'item',
            //             icon: '',
            //             url: 'apps/opinionFeedback',
            //         }
            //     ]
            // },
            /*  {
                  id: 'ROLE_BACKEND_APPS_APPMANAGE',
                  title: '应用管理',
                  translate: 'openCenter.appManageTitle',
                  type: 'collapsable',
                  icon: 'iconinformation',
                  children: [
                      {
                          id: 'ROLE_BACKEND_APPS_APPMANAGE_MY',
                          title: '我的应用',
                          translate: 'openCenter.myApps.treeTitle',
                          type: 'item',
                          icon: '',
                          url: 'apps/myApps',
                      },
                      {
                          id: 'ROLE_BACKEND_APPS_APPMANAGE_RECYCLE',
                          title: '回收站',
                          translate: 'openCenter.recycle.treeTitle',
                          type: 'item',
                          icon: '',
                          url: 'apps/recycleBin',
                      },
                  ]
              },*/
            // {
            //     id: 'ROLE_BACKEND_APPS_ANALYSIS',
            //     title: '数据分析',
            //     translate: 'nav.analyst.title',
            //     type: 'collapsable',
            //     icon: 'iconanalysis',
            //     children: [
            //         {
            //             id: 'ROLE_BACKEND_APPS_ANALYSIS_MEMBER',
            //             title: '会员数据分析',
            //             translate: 'nav.analyst.passengersAnalysis',
            //             type: 'item',
            //             url: 'apps/passengersAnalysis',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_ANALYSIS_BUSINESS',
            //             title: '商业数据分析',
            //             translate: 'nav.analyst.BusinessDataAnalysis',
            //             type: 'item',
            //             url: 'apps/BusinessDataAnalysis',
            //         }
            //         ,
            //         {
            //             id: 'ROLE_BACKEND_APPS_ANALYSIS_ACTIVITY',
            //             title: '活动数据分析',
            //             translate: 'nav.analyst.AnalysisOfMarketingData',
            //             type: 'item',
            //             url: 'apps/AnalysisOfMarketingData/N_ACID',
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_ANALYSIS_MAP',
            //             title: '地图数据分析',
            //             translate: 'nav.analyst.mapAnalysis',
            //             type: 'item',
            //             url: 'apps/mapAnalysis'
            //         },
            //         {
            //             id: 'ROLE_BACKEND_APPS_ANALYSIS_FORECAST',
            //             title: '商业预测分析',
            //             translate: 'nav.analyst.forecast',
            //             type: 'item',
            //             url: 'apps/businessForecast'
            //         }
            //     ]
            //
            // },
        ]
    },
    // {
    //     id: 'ROLE_BACKEND_PAGES',
    //     title: '页面',
    //     translate: 'nav.pages',
    //     type: 'group',
    //     children: [
    //         {
    //             id: 'ROLE_BACKEND_PAGES_BIGDATA',
    //             title: '商业大数据',
    //             translate: 'nav.bigData',
    //             type: 'item',
    //             icon: 'iconadministration',
    //             url: 'bigBusinessData',
    //         },
    //     ]
    // }
];

