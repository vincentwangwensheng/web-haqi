import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {MemberGroupComponent} from './member-group.component';
import {MemberGroupExportModule} from './member-group-export.module';

@NgModule({
  declarations: [
  ],
  imports: [
    MemberGroupExportModule,
    RouterModule.forChild([{path: '', component: MemberGroupComponent}]),
  ]
})
export class MemberGroupModule { }
