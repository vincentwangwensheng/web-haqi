import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RotationPictureComponent} from './rotation-picture.component';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {MarketingManageExportModule} from '../../marketing-manage/marketing-manage-export.module';
import {MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatProgressBarModule, MatRadioModule, MatSelectModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';



@NgModule({
  declarations: [RotationPictureComponent],
  imports: [
      CommonModule,
      RootModule,
      MatSelectModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      MaterialDatePickerModule,
      MarketingManageExportModule,
      MatProgressBarModule,
      MatRadioModule,
      MatDialogModule,
      TranslateModule,
      RouterModule.forChild([{path: '', component: RotationPictureComponent}])
  ]
})
export class RotationPictureModule { }
