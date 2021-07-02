import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MembersBasicSettingComponent} from './members-basic-setting.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../@fuse/components';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule,
  MatPaginatorModule,
  MatSortModule,
  MatTableModule,
  MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';

  const routes = [{
    path: '',
    component: MembersBasicSettingComponent
  }];

@NgModule({
  declarations: [MembersBasicSettingComponent],
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
export class MembersBasicSettingModule { }
