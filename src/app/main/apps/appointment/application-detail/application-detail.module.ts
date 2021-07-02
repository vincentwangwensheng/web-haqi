import { NgModule } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {ApplicationDetailComponent} from './application-detail.component';
import {RootModule} from '../../../../root.module';
import {MatButtonModule, MatCheckboxModule, MatIconModule, MatInputModule, MatRippleModule, MatSelectModule} from '@angular/material';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {TranslateModule} from '@ngx-translate/core';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [ApplicationDetailComponent],
  exports: [ApplicationDetailComponent],
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
      DragDropModule,
  ],
    providers: [
        NewDateTransformPipe ,  CurrencyPipe ,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class ApplicationDetailModule { }
