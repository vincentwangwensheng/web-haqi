import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {DeveloperListComponent} from './developer-list.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [DeveloperListComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      RouterModule.forChild([{path: '', component: DeveloperListComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class DeveloperListModule { }
