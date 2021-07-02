import { NgModule } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {AppointmentCalendarComponent} from './appointment-calendar.component';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import {MatDialogModule} from '@angular/material/dialog';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {ColorPickerModule} from 'ngx-color-picker';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {CalendarModule as AngularCalendarModule, DateAdapter} from 'angular-calendar';
import {RootModule} from '../../../../root.module';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {FuseConfirmDialogModule} from '../../../../../@fuse/components';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {AppCalendarService} from './app-calendar.service';
import {CouponMaintainExportModule} from '../../ecoupon-list/coupon-maintain/coupon-maintain-export.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {MatRippleModule} from '@angular/material';


@NgModule({
  declarations: [AppointmentCalendarComponent],
  exports: [AppointmentCalendarComponent],
  imports: [
      MatButtonModule,
      MatDatepickerModule,
      MatDialogModule,
      MatFormFieldModule,
      MatIconModule,
      MatInputModule,
      MatSlideToggleModule,
      MatToolbarModule,
      MatTooltipModule,
      MaterialDatePickerModule,
      AngularCalendarModule.forRoot({
          provide: DateAdapter,
          useFactory: adapterFactory
      }),
      ColorPickerModule,
      RootModule,
      ConfirmDialogModule,
      MaterialDatePickerModule,
      FuseConfirmDialogModule,
      MatRippleModule,
      CouponMaintainExportModule
  ],
    providers: [
        NewDateTransformPipe,
        AppCalendarService,
        CurrencyPipe
    ]
})
export class AppointmentCalendarExportModule { }
