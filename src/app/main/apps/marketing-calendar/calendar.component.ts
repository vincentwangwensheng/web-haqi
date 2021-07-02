import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {startOfDay, isSameDay, isSameMonth, startOfWeek, startOfMonth, endOfMonth, endOfWeek, endOfDay} from 'date-fns';
import {
    CalendarEvent,
    CalendarEventAction,
    CalendarEventTimesChangedEvent,
    CalendarMonthViewDay
} from 'angular-calendar';

import {fuseAnimations} from '@fuse/animations';
import {CalendarService} from './calendar.service';
import {CalendarEventModel} from './event.model';
import {CalendarEventFormDialogComponent} from './event-form/event-form.component';
import {ConfirmDialogComponent} from '../../../components/confirm-dialog/confirm-dialog.component';
import {TranslateService} from '@ngx-translate/core';
import {PlanServiceService} from './plan-service.service';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {MatSnackBar} from '@angular/material';


@Component({
    selector: 'calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class CalendarComponent implements OnInit {
    actions: CalendarEventAction[];
    activeDayIsOpen: boolean;
    confirmDialogRef: MatDialogRef<ConfirmDialogComponent>;
    dialogRef: any;
    events: CalendarEvent[];
    refresh: Subject<any> = new Subject();
    selectedDay: any;
    view: string;
    viewDate: Date;

    constructor(
        private _matDialog: MatDialog,
        private translate: TranslateService,
        private planService: PlanServiceService,
        private loading: FuseProgressBarService,
        private snackBar: MatSnackBar
    ) {
        // Set the defaults
        this.view = 'month';
        this.viewDate = new Date();
        this.activeDayIsOpen = true;
        this.selectedDay = {date: startOfDay(new Date())};

        this.actions = [
            {
                label: '<i class="material-icons s-16">edit</i>',
                onClick: ({event}: { event: CalendarEvent }): void => {
                    this.editEvent('edit', event);
                }
            },
            {
                label: '<i class="material-icons s-16">delete</i>',
                onClick: ({event}: { event: CalendarEvent }): void => {
                    this.deleteEvent(event);
                }
            }
        ];

        /**
         * Get events from service/server
         */
        this.setEvents();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        /**
         * Watch re-render-refresh for updating db
         */
        this.refresh.subscribe(updateDB => {
            if (updateDB) {
                this.setEvents();
            }
        });

        // this._calendarService.onEventsUpdated.subscribe(events => {
        //     this.setEvents();
        //     this.refresh.next();
        // });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set events
     */
    setEvents(search?): void {
        // this.events = this._calendarService.events.map(item => {
        //     item.actions = this.actions;
        //     return new CalendarEventModel(item);
        // });
        this.planService.getPlanList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', search).subscribe(res => {
            if (Array.isArray(res) && res.length > 0) {
                this.events = res.map(item => {
                    item.actions = this.actions;
                    return new CalendarEventModel(item);
                });
            } else {
                this.events = [];
            }
        });
    }

    /**
     * Before View Renderer
     *
     * @param {any} header
     * @param {any} body
     */
    beforeMonthViewRender({header, body}): void {
        /**
         * Get the selected day
         */
        const _selectedDay = body.find((_day) => {
            return _day.date.getTime() === this.selectedDay.date.getTime();
        });

        if (_selectedDay) {
            /**
             * Set selected day style
             * @type {string}
             */
            _selectedDay.cssClass = 'cal-selected';
        }

    }

    /**
     * Day clicked
     *
     * @param {MonthViewDay} day
     */
    dayClicked(day: CalendarMonthViewDay): void {
        const date: Date = day.date;
        const events: CalendarEvent[] = day.events;

        if (isSameMonth(date, this.viewDate)) {
            if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
                this.activeDayIsOpen = false;
            }
            else {
                this.activeDayIsOpen = true;
                this.viewDate = date;
            }
        }
        this.selectedDay = day;
        this.refresh.next();
    }

    /**
     * Event times changed
     * Event dropped or resized
     *
     * @param {CalendarEvent} event
     * @param {Date} newStart
     * @param {Date} newEnd
     */
    eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
        event.start = newStart;
        event.end = newEnd;
        // console.warn('Dropped or resized', event);
        const data = this.createEventForm(event).getRawValue();
        this.updateEvents(data);
    }

    /**
     * ViewDateChange
     * @param event
     * */
    onViewDateChange(event) {
        this.selectedDay = {date: event};
    }


    /**
     * Delete Event
     *
     * @param event
     */
    deleteEvent(event): void {
        this.confirmDialogRef = this._matDialog.open(ConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.content = this.translate.instant('calendar.confirmDelete');

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                // const eventIndex = this.events.indexOf(event);
                // this.events.splice(eventIndex, 1);
                this.loading.show();
                this.planService.deletePlan(event.id).subscribe(() => {
                    this.loading.hide();
                    this.snackBar.open('删除营销计划成功！', '✓');
                    this.refresh.next(true);
                });
            }
            this.confirmDialogRef = null;
        });

    }

    /**
     * Edit Event
     *
     * @param {string} action
     * @param {CalendarEvent} event
     */
    editEvent(action: string, event: CalendarEvent): void {

        this.dialogRef = this._matDialog.open(CalendarEventFormDialogComponent, {
            panelClass: 'event-form-dialog',
            data: {
                event: event,
                action: action
            }
        });

        this.dialogRef.afterClosed()
            .subscribe(response => {
                if (!response) {
                    return;
                }
                const actionType: string = response[0];
                const formData: FormGroup = response[1];
                switch (actionType) {
                    /**
                     * Save
                     */
                    case 'save':

                        this.updateEvents(formData.getRawValue());
                        break;
                    /**
                     * Delete
                     */
                    case 'delete':

                        this.deleteEvent(event);

                        break;
                }
            });
    }

    updateEvents(event) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);
        this.loading.show();
        this.planService.updatePlan(event).subscribe(() => {
            this.loading.hide();
            this.snackBar.open('更新营销计划成功!', '✓');
            this.refresh.next(true);
        });
    }

    /**
     * Add Event
     */
    addEvent(): void {
        this.dialogRef = this._matDialog.open(CalendarEventFormDialogComponent, {
            panelClass: 'event-form-dialog',
            data: {
                action: 'new',
                date: this.selectedDay.date
            }
        });
        this.dialogRef.afterClosed()
            .subscribe((response: FormGroup) => {
                if (!response) {
                    return;
                }
                const newEvent = response.getRawValue();
                newEvent.start = new Date(newEvent.start);
                newEvent.end = new Date(newEvent.end);
                this.loading.show();
                this.planService.createPlan(newEvent).subscribe(() => {
                    this.loading.hide();
                    this.snackBar.open('新增营销计划成功！', '✓');
                    this.refresh.next(true);
                });
            });
    }

    // 创建需要的表单 过滤不需要的字段
    createEventForm(event): FormGroup {
        return new FormGroup({
            id: new FormControl(event.id),
            title: new FormControl(event.title),
            start: new FormControl(event.start),
            end: new FormControl(event.end),
            allDay: new FormControl(event.allDay),
            color: new FormGroup({
                primary: new FormControl(event.color.primary),
                secondary: new FormControl(event.color.secondary)
            }),
            meta:
                new FormGroup({
                    marketingTarget: new FormControl(event.meta.marketingTarget),
                    marketingForm: new FormControl(event.meta.marketingForm),
                    marketingBudget: new FormControl(event.meta.marketingBudget)
                })
        });
    }
}


