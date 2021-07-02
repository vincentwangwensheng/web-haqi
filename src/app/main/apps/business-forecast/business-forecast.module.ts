import {NgModule} from '@angular/core';
import {BusinessForecastComponent} from './business-forecast.component';
import {RootModule} from '../../../root.module';
import {RouterModule} from '@angular/router';
import {AutoSelectModule} from '../../../components/auto-select/auto-select.module';
import {MarketingManageExportModule} from '../marketing-manage/marketing-manage-export.module';


@NgModule({
    declarations: [BusinessForecastComponent],
    imports: [
        RootModule,
        AutoSelectModule,
        MarketingManageExportModule,
        RouterModule.forChild([{path: '**', component: BusinessForecastComponent}])
    ]
})
export class BusinessForecastModule {
}
