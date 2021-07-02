import {CalendarEventAction} from 'angular-calendar';
import {startOfDay, endOfDay} from 'date-fns';

export class AppEventModel {
    id: number;
    start: Date;
    end?: Date;
    title: string;
    color: {
        primary: string;
        secondary: string;
    };
    actions?: CalendarEventAction[];
    allDay?: boolean;
    cssClass?: string;
    resizable?: {
        beforeStart?: boolean;
        afterEnd?: boolean;
    };
    draggable?: boolean;
    meta?: {
        couDes: string,
        info: []
        // marketingTarget: string,
        // marketingForm: string,
        // marketingBudget: string
    };

    /**
     * Constructor
     *
     * @param data
     */
    constructor(data?) {
        data = data || {};
        this.id = data.id ? data.id : '';
        this.start = (data.start ? new Date(data.start) : null) || startOfDay(new Date());
        this.end = (data.end ? new Date(data.end) : null) || endOfDay(new Date());
        this.title = data.title || '';
        this.color = {
            primary: data.color && data.color.primary || '#1e90ff',
            secondary: data.color && data.color.secondary || '#D1E8FF'
        };
        // this.draggable = data.draggable;
        // this.resizable = {
        //     beforeStart: data.resizable && data.resizable.beforeStart || true,
        //     afterEnd: data.resizable && data.resizable.afterEnd || true
        // };
        this.draggable = true;
        this.resizable = {
            beforeStart: true,
            afterEnd: true
        };
        this.actions = data.actions || [];
        this.allDay = data.allDay || false;
        this.cssClass = data.cssClass || '';
        this.meta = {
            couDes: data.meta && data.meta.couDes || '',
            info: data.meta && data.meta.info || [],
            // marketingTarget: data.meta && data.meta.marketingTarget || '',
            // marketingForm: data.meta && data.meta.marketingForm || '',
            // marketingBudget: data.meta && data.meta.marketingBudget || ''
        };
    }
}
