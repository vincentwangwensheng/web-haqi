import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ColorPickerModule} from 'ngx-color-picker';
import {CalendarModule as AngularCalendarModule, DateAdapter} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';

import {FuseConfirmDialogModule} from '@fuse/components';
import {CalendarComponent} from './calendar.component';
import {CalendarService} from './calendar.service';
import {CalendarEventFormDialogComponent} from './event-form/event-form.component';
import {RootModule} from '../../../root.module';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';
import {MaterialDatePickerModule} from '../../../components/material-date-picker/material-date-picker.module';
import {CurrencyPipe} from '@angular/common';


const routes: Routes = [
    {
        path: '**',
        component: CalendarComponent,
        children: [],
        resolve: {
            chat: CalendarService
        }
    }
];

@NgModule({
    declarations: [
        CalendarComponent,
        CalendarEventFormDialogComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatButtonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSlideToggleModule,
        MatToolbarModule,
        MatTooltipModule,

        AngularCalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        }),
        ColorPickerModule,
        RootModule,
        ConfirmDialogModule,
        MaterialDatePickerModule,
        FuseConfirmDialogModule
    ],
    providers: [
        CalendarService,
        CurrencyPipe
    ],
    entryComponents: [
        CalendarEventFormDialogComponent
    ]
})
export class CalendarModule {
}
