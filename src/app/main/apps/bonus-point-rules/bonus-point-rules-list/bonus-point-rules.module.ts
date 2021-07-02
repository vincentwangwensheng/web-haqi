import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {BonusPointRulesComponent} from './bonus-point-rules.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';



@NgModule({
  declarations: [BonusPointRulesComponent],
  imports: [
      CommonModule ,
      RootModule,
      TableListModule,
      RouterModule.forChild([{path: '', component: BonusPointRulesComponent}])
  ]
})
export class BonusPointRulesModule { }
