import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {MyAppsComponent} from './my-apps.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [MyAppsComponent],
  imports: [
      CommonModule,
      RootModule,
      TableListModule,
      TranslateModule,
      DragDropModule,
      RouterModule.forChild([{path: '', component: MyAppsComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class MyAppsModule { }
