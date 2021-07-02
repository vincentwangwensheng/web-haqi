import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../@fuse/components';
import {
  MatButtonModule, MatCheckboxModule, MatFormFieldModule,
  MatIconModule,
  MatMenuModule, MatPaginatorModule,
  MatSortModule,
  MatTableModule,
  MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {IntegralRuleListComponent} from './integral-rule-list.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';

const routes = [{
  path: '',
  component: IntegralRuleListComponent
}];

@NgModule({
  declarations: [IntegralRuleListComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FuseSidebarModule,

    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    TranslateModule,
    TableListModule,
  ],
  providers: [NewDateTransformPipe]
})
export class IntegralRuleListModule { }
