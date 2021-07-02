import { NgModule } from '@angular/core';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RootModule} from '../../../root.module';
import {BusinessTypeComponent} from './business-type.component';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';



@NgModule({
  declarations: [BusinessTypeComponent],
  imports: [
      RootModule,
      TableListModule,
  ],
    exports: [BusinessTypeComponent],
    providers: [
        NewDateTransformPipe
    ]
})
export class BusinessTypeModule { }
