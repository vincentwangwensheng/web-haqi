import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AddMemberComponent} from './add-member.component';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {MemberTemplateModule} from '../member-template/member-template.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [AddMemberComponent],
  imports: [
      CommonModule ,
      RootModule,
      TableListModule,
      MemberTemplateModule,
      DragDropModule,
      RouterModule.forChild([{path: '', component: AddMemberComponent}])
  ]
})
export class AddMemberModule { }
