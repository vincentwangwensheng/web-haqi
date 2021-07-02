import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {TranslateModule} from '@ngx-translate/core';
import {AppointmentComponent} from './appointment.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [AppointmentComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      RouterModule.forChild([{path: '', component: AppointmentComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class AppointmentModule { }
