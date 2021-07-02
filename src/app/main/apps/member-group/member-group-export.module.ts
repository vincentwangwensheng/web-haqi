import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MemberGroupComponent} from './member-group.component';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {MatFormFieldModule} from '@angular/material';



@NgModule({
  declarations: [MemberGroupComponent],
  exports: [MemberGroupComponent],
  imports: [
    CommonModule,
    RootModule,
    TableListModule,
    MatFormFieldModule
  ]
})
export class MemberGroupExportModule { }
