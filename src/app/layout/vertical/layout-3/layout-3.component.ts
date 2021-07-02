import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {ConfigService} from '@fuse/services/config.service';
import {Navigation} from '../../../navigation/navigation';

@Component({
    selector: 'vertical-layout-3',
    templateUrl: './layout-3.component.html',
    styleUrls: ['./layout-3.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VerticalLayout3Component implements OnInit, OnDestroy {
    config: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ConfigService} configService
     */
    constructor(
        private configService: ConfigService
    ) {
        // Set the defaults
            this.navigation = Navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this.configService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.config = config;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
