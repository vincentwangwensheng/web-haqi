import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {OpinionFeedbackComponent} from './opinion-feedback.component';



@NgModule({
  declarations: [OpinionFeedbackComponent],
  imports: [
    CommonModule,
    RootModule,
    TableListModule,
    TranslateModule,
    RouterModule.forChild([{path: '', component: OpinionFeedbackComponent}])
  ],
  providers: [
    NewDateTransformPipe
  ]
})
export class OpinionFeedbackModule { }
