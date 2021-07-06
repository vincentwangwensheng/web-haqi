import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MemberCardComponent} from './member-card.component';
import {RouterModule} from '@angular/router';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MemberExportCardModule} from './member-export-card.module';

const routes = [{
  path: '',
  component: MemberCardComponent
}];

@NgModule({

  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MemberExportCardModule,
  ],
  providers: [NewDateTransformPipe]
})
export class MemberCardModule { }
