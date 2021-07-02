import {FuseNavigation} from '../../@fuse/types';

export const MerchantNavigation: FuseNavigation[] = [
    {
        id: 'ROLE_MERCHANT_USER',
        title: '商户端权限',
        translate: 'nav.applications',
        type: 'group',
        children: [
            {

                id: 'ROLE_MERCHANT_USER_WORKTABLE',
                title: '工作桌面',
                translate: 'nav.brandManagement.title',
                type: 'collapsable',
                icon: 'iconfloor',
                children: [
                    {
                        id: 'ROLE_MERCHANT_USER_WORKTABLE_MYSHOP',
                        title: '我的店铺',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    },
                    {
                        id: 'ROLE_MERCHANT_USER_WORKTABLE_VERIFICATIONASSISTANT',
                        title: '核销助手',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    },
                    {
                        id: 'ROLE_MERCHANT_USER_WORKTABLE_EVENTCANCEL',
                        title: '事件核销',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item'
                    },
                    {
                        id: 'ROLE_MERCHANT_USER_WORKTABLE_WORKFEEDBACK',
                        title: '投诉反馈',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    },
                ],

            },

            {

                id: 'ROLE_MERCHANT_USER_ACTIVITY_MANAGE',
                title: '活动管理',
                translate: 'nav.brandManagement.title',
                type: 'collapsable',
                icon: 'iconfloor',
                children: [
                    {
                        id: 'ROLE_MERCHANT_USER_ACTIVITY_MANAGE_SQUARE',
                        title: '活动广场',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    },
                    {
                        id: 'ROLE_MERCHANT_USER_ACTIVITY_MANAGE_APPLY',
                        title: '活动申请',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    },
                    {
                        id: 'ROLE_MERCHANT_USER_ACTIVITY_MANAGE_COUPON_GRANT',
                        title: '优惠券发放',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    },
                ],

            },


            {

                id: 'ROLE_MERCHANT_USER_SALESREPORT',
                title: '销售上报',
                translate: 'nav.brandManagement.title',
                type: 'collapsable',
                icon: 'iconfloor',
                children: [
                    {
                        id: 'ROLE_MERCHANT_USER_SALESREPORT_REPORTRECORD',
                        title: '上报记录',
                        translate: 'nav.brandManagement.brandList',
                        type: 'item',
                    }
                ],

            }

        ]
    }

];
