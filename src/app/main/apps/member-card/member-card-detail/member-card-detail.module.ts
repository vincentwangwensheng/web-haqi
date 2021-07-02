import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MemberCardDetailComponent} from './member-card-detail.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../@fuse/components';
import {
  MatButtonModule,
  MatCheckboxModule, MatDialogModule,
  MatFormFieldModule,
  MatIconModule, MatInputModule,
  MatMenuModule,
  MatPaginatorModule, MatProgressBarModule, MatRadioModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTooltipModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {FormsModule} from '@angular/forms';
import {CustomPipesModule} from '../../../../pipes/customPipes.module';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {QUILL_CONFIG_TOKEN, QuillModule} from 'ngx-quill';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';

const routes = [{
  path: '',
  component: MemberCardDetailComponent
}];

@NgModule({
  declarations: [MemberCardDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FuseSidebarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    TranslateModule,
    MatInputModule,

    ConfirmDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatRadioModule,
    NgxDaterangepickerMd.forRoot({
      separator: ' - ',
      applyLabel: 'Okay',
    }),
    FormsModule,
    MatDialogModule,
    CustomPipesModule,
    MatSlideToggleModule,
    NgxDatatableModule,
    QuillModule,
    MaterialDatePickerModule,
    MatProgressBarModule,
  ],
  providers: [
    NewDateTransformPipe,
    {
      provide: QUILL_CONFIG_TOKEN,
      useValue: { LogLevel: 'Error' }
    }
  ]
})
export class MemberCardDetailModule { }
