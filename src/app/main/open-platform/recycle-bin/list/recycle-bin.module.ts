import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {RecycleBinComponent} from './recycle-bin.component';



@NgModule({
  declarations: [RecycleBinComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      RouterModule.forChild([{path: '', component: RecycleBinComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class RecycleBinModule { }
