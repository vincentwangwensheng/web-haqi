import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MarketingTagDetailComponent} from './marketing-tag-detail.component';
import {SharedModule} from '../../../../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../../../../@fuse/components';
import {
  MatButtonModule,
  MatCheckboxModule, MatDialogModule,
  MatFormFieldModule,
  MatIconModule, MatInputModule,
  MatMenuModule,
  MatPaginatorModule, MatSelectModule, MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTooltipModule, MatTreeModule
} from '@angular/material';
import {CdkTreeModule} from '@angular/cdk/tree';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../../../components/confirm-dialog/confirm-dialog.module';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {RouterModule, Routes} from '@angular/router';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';

const routes: Routes = [
  {
    path     : '',
    component: MarketingTagDetailComponent,
  }
];

@NgModule({
  declarations: [MarketingTagDetailComponent],
  imports: [
    SharedModule,
    FuseSidebarModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    CdkTreeModule,
    MatTreeModule,
    TranslateModule,
    ConfirmDialogModule,
    MatSnackBarModule,
    NgxDaterangepickerMd.forRoot({
      separator: ' - ',
      applyLabel: 'Okay',
    }),
    RouterModule.forChild(routes)
  ] ,
  providers: [
    NewDateTransformPipe
  ]
})
export class MarketingTagDetailModule { }
