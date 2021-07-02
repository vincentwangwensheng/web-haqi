import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule, MatProgressSpinnerModule, MatRippleModule,
    MatSelectModule
} from '@angular/material';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {StarRatingModule} from '../../../../components/star-rating/star-rating.module';
import {TranslateModule} from '@ngx-translate/core';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {DeveloperAuthComponent} from './developer-auth.component';



@NgModule({
  declarations: [DeveloperAuthComponent],
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
      MatRippleModule,
      MatProgressSpinnerModule,
      RouterModule.forChild([{path: '', component: DeveloperAuthComponent}])
  ],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class DeveloperAuthModule { }
