import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportMainManageComponent} from './report-main-manage.component';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {MatProgressSpinnerModule} from '@angular/material';
import {DetailTableListModule} from '../../../../components/detail-table-list/detail-table-list.module';
import {ReportUpTemplateModule} from '../report-up-template/report-up-template.module';
import {SpinnerLoadingModule} from '../../../../components/spinner-loading/spinner-loading.module';


@NgModule({
    declarations: [ReportMainManageComponent],
    imports: [
        CommonModule,
        RootModule,
        MatProgressSpinnerModule,
        DetailTableListModule,
        ReportUpTemplateModule,
        SpinnerLoadingModule,
        RouterModule.forChild([{path: '', component: ReportMainManageComponent}])
    ]
})
export class ReportMainManageModule {
}
