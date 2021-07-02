import { NgModule } from '@angular/core';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RelationPassengerTagsComponent} from './relation-passenger-tags.component';



@NgModule({
  declarations: [RelationPassengerTagsComponent],
  imports: [
    RootModule,
    TableListModule
  ],
  exports: [RelationPassengerTagsComponent]
})
export class RelationPassengerTagsExportModule { }
