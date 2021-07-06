import { NgModule } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {TranslateModule} from '@ngx-translate/core';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {AppointmentAddComponent} from './appointment-add.component';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSelectModule
} from '@angular/material';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {MemberExportCardModule} from '../../memberManagement/member-card/member-export-card.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {UploadImgModule} from '../../../../components/upload-img/upload-img.module';
import {MallListExportModule} from '../../mall-list/mall-list-export.module';


@NgModule({
  declarations: [AppointmentAddComponent],
  imports: [
      CommonModule,
      RootModule,
      MatSelectModule,
      MatCheckboxModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      QuillModule,
      MatRippleModule,
      MaterialDatePickerModule,
      MemberExportCardModule,
      DragDropModule,
      UploadImgModule,
      MatProgressSpinnerModule,
      MallListExportModule,
      RouterModule.forChild([{path: '', component: AppointmentAddComponent}])
  ],
    providers: [
        NewDateTransformPipe ,  CurrencyPipe ,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class AppointmentAddModule { }
