import { NgModule } from '@angular/core';
import {RouterModule} from '@angular/router';
import {AddInteractsBonusPointRuleComponent} from './add-interacts-bonus-point-rule.component';
import {AddInteractsBonusPointRuleExportModuleModule} from './add-interacts-bonus-point-rule-export.module';



@NgModule({
  imports: [
      AddInteractsBonusPointRuleExportModuleModule,
      RouterModule.forChild([{path: '', component: AddInteractsBonusPointRuleComponent}])
  ]
})
export class AddInteractsBonusPointRuleModule { }
