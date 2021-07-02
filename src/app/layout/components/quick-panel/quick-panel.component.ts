import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {now} from 'moment';
import {formatDate} from '@angular/common';

@Component({
    selector: 'quick-panel',
    templateUrl: './quick-panel.component.html',
    styleUrls: ['./quick-panel.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class QuickPanelComponent implements OnInit, OnDestroy {
    date: Date;
    time: string;
    timeInterval;
    events: any[];
    notes: any[];
    settings: any;
    weather: any;

    /**
     * Constructor
     */
    constructor() {
    }

    ngOnDestroy(): void {
        clearInterval(this.timeInterval);
    }

    ngOnInit(): void {
        // Set the defaults
        this.date = new Date();
        this.settings = {
            notify: true,
            cloud: false,
            retro: true
        };
        // time
        this.timeInterval = setInterval(() => {
            this.time = new Date().toLocaleTimeString([], {hour12: false});
        }, 100);
    }
}
