import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MarketingManageComponent} from './marketing-manage.component';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MarketingManageExportModule} from './marketing-manage-export.module';

const routes: Routes = [
  {
    path     : '',
    component: MarketingManageComponent,
  }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MarketingManageExportModule,
    ],
 providers: [NewDateTransformPipe]
})
export class MarketingManageModule { }
