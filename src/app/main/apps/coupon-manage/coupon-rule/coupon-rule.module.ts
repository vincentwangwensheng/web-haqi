import { NgModule } from '@angular/core';
import {CouponRuleExportModule} from './coupon-rule-export.module';
import {RouterModule} from '@angular/router';
import {CouponRuleComponent} from './coupon-rule.component';

@NgModule({
  imports: [
    CouponRuleExportModule,
    RouterModule.forChild([{path: '', component: CouponRuleComponent}])
  ]
})
export class CouponRuleModule { }
