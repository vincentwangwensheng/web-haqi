import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WriteIdeaSetUpComponent} from './write-idea-set-up.component';
import {RouterModule} from '@angular/router';
import {MatButtonModule, MatCardModule, MatCheckboxModule, MatDialogModule, MatIconModule, MatInputModule, MatSelectModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [WriteIdeaSetUpComponent],
  imports: [
      CommonModule ,
      RootModule,
      MatSelectModule,
      MatInputModule,
      MatIconModule,
      MatButtonModule,
      MatDialogModule,
      TranslateModule,
      MatCheckboxModule,
      MatCardModule,
      NgxDatatableModule,
      DragDropModule,
      RouterModule.forChild([{path: '', component: WriteIdeaSetUpComponent}])
  ],
    providers: [
        NewDateTransformPipe, {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class WriteIdeaSetUpModule { }
