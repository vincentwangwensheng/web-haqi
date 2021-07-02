import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    /** 开放中心 **/
    // 默认路径重定向
    {path: '', redirectTo: 'myApps', pathMatch: 'full'},
    // 应用管理---->我的应用
    {
        path: 'myApps',
        loadChildren: () => import('../open-platform/my-apps/list/my-apps.module').then(m => m.MyAppsModule)
    },
    // 应用管理 --->应用详情
    {
        path: 'myApps/edit/:id',
        loadChildren: () => import('../open-platform/my-apps/edit-app/edit-app.module').then(m => m.EditAppModule),
        data: {operation: 'EDIT'}
    },
    // 应用管理 --->应用新增
    {
        path: 'myApps/add',
        loadChildren: () => import('../open-platform/my-apps/edit-app/edit-app.module').then(m => m.EditAppModule),
        data: {operation: 'ADD'}
    },
    {
        path: 'myAppsAdd',
        loadChildren: () => import('../open-platform/my-apps/edit-app/edit-app.module').then(m => m.EditAppModule),
        data: {operation: 'ADD'}
    },
    // 应用管理 ---->回收站
    {
        path: 'recycleBin',
        loadChildren: () => import('../open-platform/recycle-bin/list/recycle-bin.module').then(m => m.RecycleBinModule)
    },
    // 回收站详情
    {
        path: 'recycleBin/edit/:id',
        loadChildren: () => import('../open-platform/my-apps/edit-app/edit-app.module').then(m => m.EditAppModule),
        data: {operation: 'recycleBinEDIT'}
    },
    // 个人中心 ---->开发者资料
    {
        path: 'developerData',
        loadChildren: () => import('../open-platform/personal-center/developer-data/developer-data.module').then(m => m.DeveloperDataModule)
    },
    // 个人中心 ---->开发者认证
    {
        path: 'developerAuth',
        loadChildren: () => import('../open-platform/personal-center/developer-auth/developer-auth.module').then(m => m.DeveloperAuthModule),
        data: {operation: 'Auth'}
    },

    // api---->访问swagger
    {
        path: 'openSwagger',
        loadChildren: () => import('../open-platform/open-swagger/open-swagger.module').then(m => m.OpenSwaggerModule)
    },
    // 开发者管理---->开发者列表
    {
        path: 'developerList',
        loadChildren: () => import('../open-platform/developerManage/developer-list/developer-list.module').then(m => m.DeveloperListModule),
        data: {operation: 'developerList'}
    },
    // 开发者管理---->开发者列表详情
    {
        path: 'developerList/edit/:id',
        loadChildren: () => import('../open-platform/personal-center/developer-auth/developer-auth.module').then(m => m.DeveloperAuthModule),
        data: {operation: 'developerListEdit'}
    },
    // 开发者管理---->开发者审核列表
    {
        path: 'developerExamineList',
        loadChildren: () => import('../open-platform/developerManage/developer-list/developer-list.module').then(m => m.DeveloperListModule),
        data: {operation: 'examine'}
    },
    // 开发者管理---->审核列表详情
    {
        path: 'developerExamineList/examine/:id',
        loadChildren: () => import('../open-platform/personal-center/developer-auth/developer-auth.module').then(m => m.DeveloperAuthModule),
        data: {operation: 'examine'}
    },

];


@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ]
})
export class OpenPlatformModule {
}
