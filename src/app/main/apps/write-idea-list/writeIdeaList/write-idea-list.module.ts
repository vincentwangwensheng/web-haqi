import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WriteIdeaListComponent} from './write-idea-list.component';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [WriteIdeaListComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      RouterModule.forChild([{path: '', component: WriteIdeaListComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class WriteIdeaListModule { }
