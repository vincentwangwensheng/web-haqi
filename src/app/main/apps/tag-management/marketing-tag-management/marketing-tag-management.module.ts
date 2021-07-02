import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MarketingTagManagementComponent} from './marketing-tag-management.component';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {MarketingTagManagementExportModule} from './marketing-tag-management-export.module';

const routes: Routes = [
  {
    path     : '',
    component: MarketingTagManagementComponent,
  }
  ];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    MarketingTagManagementExportModule
  ]
})
export class MarketingTagManagementModule { }
