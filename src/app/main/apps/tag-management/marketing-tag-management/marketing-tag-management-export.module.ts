import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {MarketingTagManagementComponent} from './marketing-tag-management.component';



@NgModule({
  declarations: [MarketingTagManagementComponent],
  imports: [
    CommonModule,
    TableListModule,
    TranslateModule,
  ],
  exports: [MarketingTagManagementComponent]
})
export class MarketingTagManagementExportModule { }
