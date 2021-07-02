import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ChartsModule} from 'ng2-charts';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {
    MatButtonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSelectModule,
    MatTabsModule, MatDatepickerModule, MatInputModule, MatTableModule, MatDialogModule, MatPaginatorModule, MatPaginatorIntl, MatSnackBarModule
} from '@angular/material';
import {FuseWidgetModule} from '../../../../../@fuse/components/widget/widget.module';
import {FuseSidebarModule} from '../../../../../@fuse/components/sidebar/sidebar.module';
import {FuseDemoModule} from '../../../../../@fuse/components/demo/demo.module';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {AnalysisOfMarketingDataComponent} from './analysis-of-marketing-data.component';
import {getDutchPaginatorIntl} from '../../../../services/EcouponService/my-paginator';


const routes: Routes = [
    {
        path: '',
        component: AnalysisOfMarketingDataComponent,
    }
];

@NgModule({
    declarations: [AnalysisOfMarketingDataComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatTabsModule,
        TranslateModule,
        MatDatepickerModule,
        MatInputModule,
        MatTableModule,
        ChartsModule,
        NgxChartsModule,
        MatPaginatorModule,
        SharedModule,
        FuseWidgetModule,
        FuseSidebarModule,
        FuseDemoModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    providers: [  { provide: MatPaginatorIntl, useValue: getDutchPaginatorIntl() }]
})
export class AnalysisOfMarketingDataModule {
}
