import {FuseNavigation} from '@fuse/types';

export const OpenNavigation: FuseNavigation[] = [
    {
        id: 'ROLE_BACKEND_OPEN',
        title: '开放中心',
        translate: 'open.title',
        type: 'group',
        children: [
            {
                id: 'ROLE_OPENAPI_USER',
                title: '应用管理',
                translate: 'open.app.title',
                type: 'collapsable',
                icon: '',
                children: [
                    {
                        id: 'ROLE_OPENAPI_REVIEW',
                        title: '应用列表',
                        translate: 'open.app.myApp',
                        type: 'item',
                        url: 'open/myApps'
                    },
                    {
                        id: 'ROLE_OPENAPI_USER',
                        title: '我的应用',
                        translate: 'open.app.ADDMyApp',
                        type: 'item',
                        url: 'open/myAppsAdd'
                    },
                    // {
                    //     id: 'ROLE_BACKEND_OPEN_APP_RECYCLEBIN',
                    //     title: '回收站',
                    //     translate: 'open.app.recycleBin',
                    //     type: 'item',
                    //     url: 'open/recycleBin'
                    // }
                ]
            },
            {
                id: 'ROLE_OPENAPI_USER',
                title: '个人中心',
                translate: 'open.user.title',
                type: 'collapsable',
                icon: '',
                children: [
                    {
                        id: 'ROLE_OPENAPI_USER',
                        title: '开发者资料',
                        translate: 'open.user.developerDataTitle',
                        type: 'item',
                        url: 'open/developerData'
                    },
                    {
                        id: 'ROLE_OPENAPI_USER',
                        title: '开发者认证',
                        translate: 'open.user.developerAuthTitle',
                        type: 'item',
                        url: 'open/developerAuth'
                    }
                ]
            },
            {
                id: 'ROLE_OPENAPI_USER',
                title: '开放接口',
                translate: 'open.interface.title',
                type: 'collapsable',
                icon: '',
                children: [
                    {
                        id: 'ROLE_OPENAPI_USER',
                        title: 'API',
                        translate: 'open.interface.openSwaggerTitle',
                        type: 'item',
                        url: 'open/openSwagger'
                    }
                ]
            },
            {
                id: 'ROLE_OPENAPI_REVIEW',
                title: '开发者管理',
                translate: 'open.developer.title',
                type: 'collapsable',
                icon: '',
                children: [
                    {
                        id: 'ROLE_OPENAPI_REVIEW',
                        title: 'API',
                        translate: 'open.developer.list',
                        type: 'item',
                        url: 'open/developerList'
                    },
                    // {
                    //     id: 'ROLE_BACKEND_OPEN_DEVELOPER_EXAMINELIST',
                    //     title: 'API',
                    //     translate: 'open.developer.examineList',
                    //     type: 'item',
                    //     url: 'open/developerExamineList'
                    // }
                ]
            }
        ]
    }
];
