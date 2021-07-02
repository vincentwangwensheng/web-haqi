import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RootModule} from '../../../root.module';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {MaterialDatePickerModule} from '../../../components/material-date-picker/material-date-picker.module';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {NewDateTransformPipe} from '../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MemberPortraitComponent} from './member-portrait.component';



@NgModule({
  declarations: [MemberPortraitComponent],
  imports: [
      CommonModule,
      RootModule,
      MatSelectModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      MatDialogModule,
      TranslateModule,
      MatCheckboxModule,
      MaterialDatePickerModule,
      RouterModule.forChild([{path: '', component: MemberPortraitComponent}])
  ],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class MemberPortraitModule { }
