import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WriteIdeaControlComponent} from './write-idea-control.component';
import {
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule
} from '@angular/material';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {StarRatingModule} from '../../../../components/star-rating/star-rating.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';



@NgModule({
  declarations: [WriteIdeaControlComponent],
  imports: [
      CommonModule ,
      RootModule,
      MatSelectModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      MatDialogModule,
      TranslateModule,
      MatCheckboxModule,
      MatCardModule,
      StarRatingModule,
      DragDropModule,
      NgxDatatableModule,
      MatProgressSpinnerModule,
      RouterModule.forChild([{path: '', component: WriteIdeaControlComponent}])
  ],
    providers: [
        NewDateTransformPipe
    ]
})
export class WriteIdeaControlModule { }
