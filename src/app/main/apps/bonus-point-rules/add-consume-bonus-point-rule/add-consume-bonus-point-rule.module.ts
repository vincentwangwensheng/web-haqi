import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {AddConsumeBonusPointRuleComponent} from './add-consume-bonus-point-rule.component';
import {StoreManageExportModule} from '../../store-mange/store-manage-export.module';
import {AddConsumeBonusPointRuleExportModule} from './add-consume-bonus-point-rule-export.module';



@NgModule({
  imports: [
      StoreManageExportModule,

      AddConsumeBonusPointRuleExportModule,
      RouterModule.forChild([{path: '', component: AddConsumeBonusPointRuleComponent}])
  ]
})
export class AddConsumeBonusPointRuleModule { }
