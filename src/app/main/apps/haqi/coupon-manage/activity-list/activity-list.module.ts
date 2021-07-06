import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {ActivityListExportModule} from './activity-list-export.module';
import {ActivityListComponent} from './activity-list.component';

@NgModule({
  imports: [
    ActivityListExportModule,
    RouterModule.forChild([{path: '', component: ActivityListComponent}])
  ]

})
export class ActivityListModule { }
