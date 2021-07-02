import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {EditSecuritiesRulesComponent} from './edit-securities-rules.component';
import {CouponTemplateModule} from '../coupon-tempalte/coupon-template.module';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../../root.module';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [EditSecuritiesRulesComponent],
    imports: [
        CommonModule ,
        RootModule,
        TranslateModule,
        CouponTemplateModule,
        RouterModule.forChild([{path: '', component: EditSecuritiesRulesComponent}])
    ]
})
export class EditSecuritiesRulesComponentModule {
}
