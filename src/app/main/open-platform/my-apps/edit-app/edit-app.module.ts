import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {StarRatingModule} from '../../../../components/star-rating/star-rating.module';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {RootModule} from '../../../../root.module';
import {EditAppComponent} from './edit-app.component';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';



@NgModule({
  declarations: [EditAppComponent],
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
      StarRatingModule,
      MaterialDatePickerModule,
      RouterModule.forChild([{path: '', component: EditAppComponent}])
  ],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class EditAppModule { }
