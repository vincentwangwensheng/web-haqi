import { NgModule } from '@angular/core';
import {PassengersTagManagementExportModule} from '../../../tag-management/passengers-tag-management/passengers-tag-management-export.module';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../../root.module';
import {MaterialDatePickerModule} from '../../../../../components/material-date-picker/material-date-picker.module';
import {
    _MatMenuDirectivesModule, MatButtonModule, MatCheckboxModule,
    MatChipsModule, MatDialogModule,
    MatFormFieldModule, MatIconModule,
    MatInputModule, MatMenuModule,
    MatRippleModule,
    MatSelectModule, MatSlideToggle, MatSlideToggleModule,
    MatTableModule
} from '@angular/material';
import {NewDateTransformPipe} from '../../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {PassengersDetailComponent} from './passengers-detail.component';
import {CommonModule, DatePipe} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {EditDialogModule} from '../../../../../components/edit-dialog/edit-dialog.module';
import {CouponManageService} from '../../../coupon-manage/coupon-manage.service';
import {MerchantsTagManagementExportModule} from "../../../tag-management/merchants-tag-management/merchants-tag-management-export.module";



@NgModule({
  declarations: [PassengersDetailComponent],
    imports: [
        RouterModule.forChild([{path: '', component: PassengersDetailComponent}]),
        CommonModule,
        RootModule,
        MatSelectModule,
        MatChipsModule,
        MatSlideToggleModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        TranslateModule,
        MatDialogModule,
        TranslateModule,
        MatCheckboxModule,
        MaterialDatePickerModule,
        EditDialogModule,
        MerchantsTagManagementExportModule
    ],
  providers: [
      NewDateTransformPipe,
      CouponManageService,
      DatePipe
  ]
})
export class PassengersDetailModule { }
