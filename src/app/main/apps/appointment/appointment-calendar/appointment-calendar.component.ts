import {Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {MatDialog, MatSnackBar} from '@angular/material';
import {startOfDay, isSameDay, isSameMonth, startOfWeek, startOfMonth, endOfMonth, endOfWeek, endOfDay} from 'date-fns';
import {CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarMonthViewDay} from 'angular-calendar';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {TranslateService} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '../../../../components/confirm-dialog/confirm-dialog.component';
import {MatDialogRef} from '@angular/material/dialog';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {AppEventModel} from './app-event.model';
import {formatDate} from '@angular/common';
import {BaseOptions} from 'flatpickr/dist/types/options';
import {MatColors} from '../../../../../@fuse/mat-colors';
import {AppointmentService} from '../appointment-service/appointment.service';
import {HttpClient} from '@angular/common/http';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
/** 事件日历 **/
@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss'] ,
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AppointmentCalendarComponent implements OnInit {
    @ViewChild('appAddDialog', {static: true}) appAddDialog: TemplateRef<any>; // 添加的弹窗
    @ViewChild('startDatePicker', {static: true})
    startDatePicker;
    @ViewChild('endDatePicker', {static: true})
    endDatePicker;

    actions: CalendarEventAction[];
    activeDayIsOpen: boolean;
    confirmDialogRef: MatDialogRef<ConfirmDialogComponent>; // 删除时调用的dialog
    dialogRef: any;
    presetColors = MatColors.presets;
    events: CalendarEvent[];
    refresh: Subject<any> = new Subject();
    selectedDay: any;
    view: string;
    viewDate: Date;
    CUForm: any; // 添加编辑表单
    formEvent: any; // 表单带入的数据
    formAction: any; // 当前执行动作
    showChooseCoupon: boolean; // 是否选择券信息
    couponInfo: any; // 选择的电子券信息
    couponInfoSave: any; // 选择的电子券信息储存
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
    constructor(
        private _matDialog: MatDialog,
        private translate: TranslateService,
        private dateTransform: NewDateTransformPipe,
        private loading: FuseProgressBarService,
        private appService: AppointmentService,
        private _formBuilder: FormBuilder,
        private http: HttpClient ,
        private snackBar: MatSnackBar
    ) {
        // Set the defaults
        this.view = 'week';
        this.viewDate = new Date();
        this.activeDayIsOpen = true;
        this.selectedDay = {date: startOfDay(new Date())};

        this.actions = [
            {
                label: '<i class="material-icons s-16">edit</i>',
                onClick: ({event}: { event: CalendarEvent }): void => {
                    this.editAppEvent('edit', event);
                }
            },
            {
                label: '<i class="material-icons s-16">delete</i>',
                onClick: ({event}: { event: CalendarEvent }): void => {
                    this.deleteEvent(event);
                }
            }
        ];


        this.formEvent = new AppEventModel(
            {
                start: startOfDay(new Date()),
                end: endOfDay(new Date()),
                actions: this.actions
            }
        );

        this.CUForm =  new FormGroup({
            id: new FormControl(this.formEvent.id),
            title: new FormControl(this.formEvent.title),
            start: new FormControl(formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'zh')),
            end: new FormControl(formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'zh')),
            allDay: new FormControl(null),
            color:  this._formBuilder.group({
                primary: new FormControl(this.formEvent.color.primary),
                secondary: new FormControl(this.formEvent.color.secondary)
            }),
            meta: this._formBuilder.group({
                    couDes: new FormControl(this.formEvent.meta.couDes),
                    info: new FormControl(this.formEvent.meta.info),
                })
        });
        /**
         * Get events from service/server
         */
        this.setAppEvents();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.showChooseCoupon = false;
        /**
         * Watch re-render-refresh for updating db
         */
        this.refresh.subscribe(updateDB => {
            if (updateDB) {
                this.setAppEvents();
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
    setAppEvents(search?): void {
        // this.events = this._calendarService.events.map(item => {
        //     item.actions = this.actions;
        //     return new AppEventModel(item);
        // });

        this.http.get<any>('api/app-calendar').subscribe(
            res => {
                if (Array.isArray(res) && res.length > 0){
                    res.map(item => {
                        this.events = item.data.map( r => {
                            r.actions =  this.actions;
                            return new AppEventModel(r);
                        });
                    });
                } else {
                    this.events = [];
                }
            }
        );
       /* this.planService.getPlanList(0, 0x3f3f3f3f, 'lastModifiedDate,desc', search).subscribe(res => {

            if (Array.isArray(res) && res.length > 0) {
                this.events = res.map(item => {
                    item.actions = this.actions;
                    return new AppEventModel(item);
                });
            } else {
                this.events = [];
            }
        });*/

        console.log('initEvents', this.events);
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
    dayAppClicked(day: CalendarMonthViewDay): void {
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
    appEventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
        event.start = newStart;
        event.end = newEnd;
        // console.warn('Dropped or resized', event);
    //    const data = this.createEventForm(event).getRawValue();
        this.CUForm.patchValue(event);
        const data = this.CUForm.getRawValue();
        this.updateEvents(data);
    }

    /**
     * ViewDateChange
     * @param event
     * */
    onViewDateChangeApp(event) {
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

        this.confirmDialogRef.componentInstance.content = '确定删除吗？';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                // const eventIndex = this.events.indexOf(event);
                // this.events.splice(eventIndex, 1);
              //  this.loading.show();
             /*   this.planService.deletePlan(event.id).subscribe(() => {
                    this.loading.hide();
                    this.snackBar.open('删除营销计划成功！', '✓');
                    this.refresh.next(true);
                });*/
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
    editAppEvent(action: string, event: CalendarEvent): void {
        this.formAction  = action;
       /* this.dialogRef = this._matDialog.open(CalendarEventFormDialogComponent, {
            panelClass: 'event-form-dialog',
            data: {
                event: event,
                action: action
            }
        });*/

        event.start = this.dateTransform.transform(event.start);
        event.end = this.dateTransform.transform(event.end);
        setTimeout( () => {
            this.CUForm.patchValue(event);
        } , 200);

        this.formEvent = event;
        if (!this._matDialog.getDialogById('appAddCalendarDialogClass')) {
            this.dialogRef = this._matDialog.open(this.appAddDialog, {id: 'appAddCalendarDialogClass',  width: '400px' , height: '650px'});
        }
        this.couponInfoSave = event.meta.info;
        if (this.couponInfoSave.length === 0) {
            this.showChooseCoupon = false;
        } else {
            this.showChooseCoupon = true;
        }
        this.dialogRef.afterClosed()
            .subscribe(response => {
                const formData = this.CUForm.getRawValue();
                if (response === 'yes') {
                    console.log(this.CUForm.getRawValue() , ',,,up');
                    this.updateEvents(formData);
                }
                if (response === 'del') {
                    console.log(this.CUForm.getRawValue() , ',,,del');
                    this.deleteEvent(event);
                }

            });
    }

    updateEvents(event) {

        event.start = new Date(event.start).toISOString();
        event.end = new Date(event.end).toISOString();
       /* this.loading.show();
       this.planService.updatePlan(event).subscribe(() => {
            this.loading.hide();
            this.snackBar.open('更新营销计划成功!', '✓');
            this.refresh.next(true);
        });*/
    }

    /**
     * Add Event
     */
    addAppEvent(appAddDialog): void {
       /* this.dialogRef = this._matDialog.open(CalendarEventFormDialogComponent, {
            panelClass: 'event-form-dialog',
            data: {
                action: 'new',
                date: this.selectedDay.date
            }
        });*/

        this.formEvent = new AppEventModel(
            {
                start: startOfDay(this.selectedDay.date),
                end: endOfDay(this.selectedDay.date),
                actions: this.actions
            }
        );
        this.formEvent.start = formatDate(this.formEvent.start, 'yyyy-MM-dd HH:mm:ss', 'zh');
        this.formEvent.end =  formatDate(this.formEvent.end, 'yyyy-MM-dd HH:mm:ss', 'zh');
        this.formAction  = 'new';
        this.couponInfoSave = [];
        if (this.couponInfoSave.length === 0) {
            this.showChooseCoupon = false;
        } else {
            this.showChooseCoupon = true;
        }
        this.CUForm.patchValue(this.formEvent);
        if (!this._matDialog.getDialogById('appAddCalendarDialogClass')) {
           this.dialogRef = this._matDialog.open(appAddDialog, {id: 'appAddCalendarDialogClass',  width: '400px' , height: '650px'});
        }
        this.dialogRef.afterClosed()
            .subscribe(res => {
                if (res !== 'yes') {
                    return;
                }
                console.log(this.CUForm.getRawValue() , ',,,add');
                const newEvent = this.CUForm.getRawValue();
                newEvent.start = new Date(newEvent.start).toISOString();
                newEvent.end = new Date(newEvent.end).toISOString();
                /* this.loading.show();
                 this.planService.createPlan(newEvent).subscribe(() => {
                     this.loading.hide();
                     this.snackBar.open('新增营销计划成功！', '✓');
                     this.refresh.next(true);
                 });*/
            });
    }


    openCouInfo(couponInfoDi){
        if (!this._matDialog.getDialogById('couponInfoDiClass')){
            this._matDialog.open(couponInfoDi, {id: 'couponInfoDiClass',  width: '80%'}).afterClosed().subscribe( res => {
                if (res) {
                    const couponInfo_ = JSON.stringify(this.couponInfo);
                    this.couponInfoSave = JSON.parse(couponInfo_);
                    this.showChooseCoupon = true;
                } else {
                    if (this.couponInfoSave.length === 0) {
                        this.showChooseCoupon = false;
                    }
                }
                this.CUForm.controls.meta.controls.info.patchValue( this.couponInfoSave);
            });
        }
    }

    couponInfoSelect(e){
        this.couponInfo = e ;
    }


    appRemoveCoupon(i , c){
        this.couponInfoSave.splice(i , 1);
        this.CUForm.controls.meta.controls.info.patchValue(null);
        this.CUForm.controls.meta.controls.info.patchValue( this.couponInfoSave);
        if (this.couponInfoSave.length === 0) {
            this.showChooseCoupon = false;
            this.couponInfo = [];
        }
    }

    onStartDate(event, endDatePicker){
        endDatePicker.picker.set('minDate', event);
    }

    onEndDate(event, startDatePicker){
        startDatePicker.picker.set('maxDate', event);
    }



    closeCUFormYes(){
        if (this.dialogRef) {
            this.dialogRef.close('yes');
        }
    }

    closeCUFormNo(){
        if (this.dialogRef) {
            this.dialogRef.close('no');
        }
    }

    closeCUFormDel(){
        if (this.dialogRef) {
            this.dialogRef.close('del');
        }
    }
}
