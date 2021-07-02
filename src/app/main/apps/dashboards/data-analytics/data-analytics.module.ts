import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {DataAnalyticsComponent} from './data-analytics.component';
import {MatButtonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSelectModule, MatTabsModule, MatTreeModule} from '@angular/material';
import {ChartsModule} from 'ng2-charts';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseDemoModule, FuseSidebarModule, FuseWidgetModule} from '../../../../../@fuse/components';
import {ConditionsModule} from './conditions/conditions.module';


const routes: Routes = [
  {
    path     : '',
    component: DataAnalyticsComponent,
  }
];
@NgModule({
  declarations: [DataAnalyticsComponent],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatTabsModule,
        ChartsModule,
        NgxChartsModule,

        SharedModule,
        FuseWidgetModule,
        FuseSidebarModule,
        FuseDemoModule,
        MatTreeModule,
        ConditionsModule,
    ]
})
export class DataAnalyticsModule { }
