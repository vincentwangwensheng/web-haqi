import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../../root.module';
import {AddInteractsBonusPointRuleComponent} from './add-interacts-bonus-point-rule.component';
import {MatCheckboxModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule , MatSlideToggleModule} from '@angular/material';



@NgModule({
  declarations: [AddInteractsBonusPointRuleComponent],
  imports: [
      CommonModule ,
      RootModule,
      MatDialogModule,
      MatFormFieldModule,
      MatSelectModule,
      MatInputModule,
      MatCheckboxModule,
      MatSlideToggleModule,
  ],
    exports: [AddInteractsBonusPointRuleComponent],
})
export class AddInteractsBonusPointRuleExportModuleModule { }
