import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {AddSecuritiesRulesComponent} from './add-securities-rules.component';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {CouponTemplateModule} from '../coupon-tempalte/coupon-template.module';
import {RootModule} from '../../../../../root.module';

@NgModule({
    declarations: [AddSecuritiesRulesComponent],
    imports: [
        CommonModule ,
        RootModule,
        TranslateModule,
        CouponTemplateModule,
        CouponTemplateModule,
        RouterModule.forChild([{path: '', component: AddSecuritiesRulesComponent}])
    ] ,
    providers: [
    {
        provide: QUILL_CONFIG_TOKEN,
        useValue: { LogLevel: 'Error' }
    }
]
})
export class AddSecuritiesRulesComponentModule {
}
