import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {TranslateModule} from '@ngx-translate/core';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {ApplicationListComponent} from './application-list.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {ApplicationDetailModule} from '../application-detail/application-detail.module';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [ApplicationListComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      ApplicationDetailModule,
      DragDropModule,
      RouterModule.forChild([{path: '', component: ApplicationListComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class ApplicationListModule { }
