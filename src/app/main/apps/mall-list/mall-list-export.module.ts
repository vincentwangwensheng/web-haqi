import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {MallListComponent} from './mall-list.component';



@NgModule({
  declarations: [MallListComponent],
  exports: [
    MallListComponent
  ],
  imports: [
    CommonModule,
    TableListModule,
    TranslateModule,
  ]
})
export class MallListExportModule { }
