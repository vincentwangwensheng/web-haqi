import {
    AfterContentInit,
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CalendarEvent} from 'angular-calendar';
import {CurrencyPipe, formatDate} from '@angular/common';

import {MatColors} from '@fuse/mat-colors';
import {CalendarEventModel} from '../event.model';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';
import {BaseOptions} from 'flatpickr/dist/types/options';
import {endOfDay, isAfter, isBefore, isDate, isEqual, startOfDay} from 'date-fns';

@Component({
    selector: 'calendar-event-form-dialog',
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class CalendarEventFormDialogComponent {
    action: string;
    event: CalendarEvent;
    eventForm: FormGroup;
    dialogTitle: string;
    presetColors = MatColors.presets;

    maxCurrencyNumber = 999999999999;
    currencyValue = '';

    startConfig: Partial<BaseOptions> = {
        enableTime: true,
        time_24hr: true,
        defaultHour: 0,
        defaultMinute: 0,
        defaultSeconds: 0,
        enableSeconds: true
    };
    endConfig: Partial<BaseOptions> = {
        enableTime: true,
        time_24hr: true,
        defaultHour: 23,
        defaultMinute: 59,
        defaultSeconds: 59,
        enableSeconds: true
    };

    @ViewChild('startDatePicker', {static: true})
    startDatePicker;
    @ViewChild('endDatePicker', {static: true})
    endDatePicker;

    /**
     * Constructor
     *
     */
    constructor(
        public matDialogRef: MatDialogRef<CalendarEventFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        private translate: TranslateService,
        private _formBuilder: FormBuilder,
        private utils: Utils,
        private currency: CurrencyPipe
    ) {
        this.event = _data.event;
        this.action = _data.action;

        if (this.action === 'edit') {
            this.dialogTitle = this.event.title;
        }
        else {
            this.dialogTitle = this.translate.instant('calendar.newEvent');
            this.event = new CalendarEventModel(
                {
                    start: startOfDay(_data.date),
                    end: endOfDay(_data.date)
                }
            );
        }
        this.eventForm = this.createEventForm();
        this.currencyValue = this.currency.transform(this.event.meta.marketingBudget, 'CNY', '￥', '1.0-0');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the event form
     *
     * @returns {FormGroup}
     */
    createEventForm(): FormGroup {
        return new FormGroup({
            id: new FormControl(this.event.id),
            title: new FormControl(this.event.title),
            start: new FormControl(formatDate(this.event.start, 'yyyy-MM-dd HH:mm:ss', 'zh')),
            end: new FormControl(formatDate(this.event.end, 'yyyy-MM-dd HH:mm:ss', 'zh')),
            allDay: new FormControl(this.event.allDay),
            color: this._formBuilder.group({
                primary: new FormControl(this.event.color.primary),
                secondary: new FormControl(this.event.color.secondary)
            }),
            meta:
                this._formBuilder.group({
                    marketingTarget: new FormControl(this.event.meta.marketingTarget),
                    marketingForm: new FormControl(this.event.meta.marketingForm),
                    marketingBudget: new FormControl(this.event.meta.marketingBudget)
                })
        });
    }

    onStartDate(event, endTime) {
        endTime.picker.set('minDate', event);
        if ((this.eventForm.get('end').value) && isAfter(event, new Date(this.eventForm.get('end').value))) {
            this.eventForm.get('end').setValue(null);
        } else if (this.eventForm.get('end').value) { // 设定最小日期后 picker选中日期会清除  表单数据还在需要手动设置
            endTime.picker.setDate(new Date(this.eventForm.get('end').value));
        }
    }

    onEndDate(event, startTime) {
        startTime.picker.set('maxDate', event);
        if ((this.eventForm.get('start').value) && isBefore(event, new Date(this.eventForm.get('start').value))) {
            this.eventForm.get('start').setValue(null);
        } else if (this.eventForm.get('start').value) { // 设定最大日期后 picker选中日期会清除  表单数据还在 手动恢复
            startTime.picker.setDate(new Date(this.eventForm.get('start').value));
        }
    }

    // 控制金额输入
    currencyInput(event) {
        if (this.utils.isNumber(event.target.value) || this.utils.isCNY(event.target.value)) {
            if (this.utils.toNumber(event.target.value) >= this.maxCurrencyNumber) {
                event.target.value = this.maxCurrencyNumber;
            }
            event.target.value = this.currency.transform(this.utils.toNumber(event.target.value), 'CNY', '￥', '1.0-0');

        } else {
            event.target.value = this.utils.replaceAllToNumber(event.target.value);
        }
        this.eventForm.get('meta').get('marketingBudget').patchValue(this.utils.toNumber(event.target.value));
    }


    // ngAfterViewInit(): void {
    //     if (!isEqual(startOfDay(this.event.start), startOfDay(this.event.end))) {
    //         this.endDatePicker.picker.set('minDate', new Date(this.event.start));
    //         this.startDatePicker.picker.set('maxDate', new Date(this.event.end));
    //         this.eventForm.get('start').setValue(this.event.start);
    //         this.eventForm.get('end').setValue(this.event.end);
    //     }
    // }
}
