import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {AddConsumeBonusPointRuleComponent} from './add-consume-bonus-point-rule.component';
import {MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule} from '@angular/material';
import {StoreManageExportModule} from '../../store-mange/store-manage-export.module';
import {BusinessTypeModule} from '../../business-type/business-type.module';



@NgModule({
  declarations: [AddConsumeBonusPointRuleComponent],
  imports: [
      CommonModule ,
      RootModule,
      TableListModule,
      MatDialogModule,
      MatFormFieldModule,
      MatSelectModule,
      MatInputModule,
      MatCheckboxModule,
      BusinessTypeModule,
      StoreManageExportModule,
      RouterModule.forChild([{path: '', component: AddConsumeBonusPointRuleComponent}])
  ],
    exports: [AddConsumeBonusPointRuleComponent],
})
export class AddConsumeBonusPointRuleExportModule { }
