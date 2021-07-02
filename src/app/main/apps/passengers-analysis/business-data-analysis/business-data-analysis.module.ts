import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {ChartsModule} from 'ng2-charts';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {BusinessDataAnalysisComponent} from './business-data-analysis.component';
import {
    MatButtonModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSelectModule,
    MatTabsModule, MatDatepickerModule, MatInputModule, MatTableModule, MatDialogModule, MatTooltipModule, MatCardModule
} from '@angular/material';
import {FuseWidgetModule} from '../../../../../@fuse/components/widget/widget.module';
import {FuseSidebarModule} from '../../../../../@fuse/components/sidebar/sidebar.module';
import {FuseDemoModule} from '../../../../../@fuse/components/demo/demo.module';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';


const routes: Routes = [
    {
        path: '',
        component: BusinessDataAnalysisComponent,
    }
];

@NgModule({
    declarations: [BusinessDataAnalysisComponent],
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
        NgxChartsModule,
        MatTooltipModule,
        SharedModule,
        FuseWidgetModule,
        FuseSidebarModule,
        FuseDemoModule,
        MatDialogModule,
        MatCardModule,
        MaterialDatePickerModule,
    ],
    providers: [
        DatePipe
    ]
})
export class BusinessDataAnalysisModule {
}
