import { NgModule } from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AppointmentCalendarComponent} from './appointment-calendar.component';
import {AppointmentCalendarExportModule} from './appointment-calendar-export.module';
import {CalendarEventFormDialogComponent} from '../../marketing-calendar/event-form/event-form.component';
import {AppCalendarService} from './app-calendar.service';

const routes: Routes = [
    {
        path: '**',
        component: AppointmentCalendarComponent,
        children: [],
        resolve: {
            chat: AppCalendarService
        }
    }
];

@NgModule({
  imports: [
      RouterModule.forChild(routes),
      AppointmentCalendarExportModule,
  ],
    providers: [
        AppCalendarService,
        CurrencyPipe
    ]
})
export class AppointmentCalendarModule { }
