import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {
    MAT_DATE_FORMATS,
    MAT_DIALOG_DEFAULT_OPTIONS,
    MAT_SNACK_BAR_DEFAULT_OPTIONS, MAT_TOOLTIP_DEFAULT_OPTIONS,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import 'hammerjs';

import {FuseModule} from '@fuse/fuse.module';
import {SharedModule} from '@fuse/shared.module';
import {FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule} from '@fuse/components';

import {config} from 'app/fuse-config';

import {AppComponent} from 'app/app.component';
import {LayoutModule} from 'app/layout/layout.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {AppRoutingModule} from './app-routing.module';
import {InterceptServiceProvider} from './services/intercept-service';
import {InMemoryWebApiModule} from 'angular-in-memory-web-api';
import {FakeDbService} from './fake-db/fake-db.service';
/** 注册中文 **/
import {CurrencyPipe, registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';
import { NgxPermissionsModule } from 'ngx-permissions';

registerLocaleData(zh);

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        DragDropModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,

        // Fuse modules
        FuseModule.forRoot(config),
        FuseProgressBarModule,
        SharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,

        // memory db
        InMemoryWebApiModule.forRoot(FakeDbService, {
            delay: 0,
            passThruUnknownUrl: true
        }),

        // App modules
        LayoutModule,
        NgxPermissionsModule.forRoot()
    ],
    providers:
        [
            // {provide: LocationStrategy, useClass: HashLocationStrategy}, // 哈希地址策略
            {provide: HTTP_INTERCEPTORS, useClass: InterceptServiceProvider, multi: true}, // 拦截器
            {
                provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
                useValue: {duration: 5000, verticalPosition: 'top', panelClass: ['snack-custom']}
            }, // 提示框配置
            {
                provide: MAT_DIALOG_DEFAULT_OPTIONS,
                useValue: {hasBackdrop: true, autoFocus: true}
            },
            {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {position: 'above'}},
            // Material DatePicker Formats
            {
                provide: MAT_DATE_FORMATS,
                useValue: {
                    parse: {
                        dateInput: ['l', 'LL'],
                    },
                    display: {
                        dateInput: 'L',
                        monthYearLabel: 'MMM YYYY',
                        dateA11yLabel: 'LL',
                        monthYearA11yLabel: 'MMMM YYYY',
                    },
                },
            },
            CurrencyPipe,
        ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
