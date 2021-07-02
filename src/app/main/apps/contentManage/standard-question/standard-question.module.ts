import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {StandardQuestionComponent} from './standard-question.component';
import {StandardQuestionExportModule} from './standard-question-export.module';
import {ContentManageService} from '../content-manage.service';
import {CouponManageService} from '../../coupon-manage/coupon-manage.service';


@NgModule({
  imports: [
    StandardQuestionExportModule,
    RouterModule.forChild([{path: '', component: StandardQuestionComponent}])
  ],
  providers: [
    CouponManageService,
    ContentManageService
  ]
})
export class StandardQuestionModule { }
