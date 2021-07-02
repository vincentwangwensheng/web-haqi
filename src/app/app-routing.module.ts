import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './guards/auth.guard';
import {OpenGuard} from './guards/open.guard';

const routes: Routes =
    [
        // home
        {path: '', redirectTo: 'home', pathMatch: 'full'},

        // pages
        {path: '', loadChildren: () => import('./main/pages/pages.module').then(m => m.PagesModule)},

        // apps
        {
            path: 'apps',
            canActivateChild: [AuthGuard],
            loadChildren: () => import('./main/apps/apps.module').then(m => m.AppsModule)
        },
        // 开放平台
        {
            path: 'open',
            canActivateChild: [OpenGuard],
            loadChildren: () => import('./main/open-platform/open-platform.module').then(m => m.OpenPlatformModule)
        },
        // 其他所有都重定向到login
        {path: '**', redirectTo: 'home', pathMatch: 'full'}
    ];

@NgModule({
    imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule {

}
