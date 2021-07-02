import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WriteIdeaDetailComponent} from './write-idea-detail.component';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatSelectModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../../root.module';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {StarRatingModule} from '../../../../../components/star-rating/star-rating.module';



@NgModule({
  declarations: [WriteIdeaDetailComponent],
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
      MaterialDatePickerModule,
      StarRatingModule,
      RouterModule.forChild([{path: '', component: WriteIdeaDetailComponent}])
  ],
    providers: [
        NewDateTransformPipe , {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class WriteIdeaDetailModule { }
