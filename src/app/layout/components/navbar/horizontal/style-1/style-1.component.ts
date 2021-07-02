import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { ConfigService } from '@fuse/services/config.service';
import { NavigationService } from '@fuse/components/navigation/navigation.service';
import { SidebarService } from '@fuse/components/sidebar/sidebar.service';

@Component({
    selector     : 'navbar-horizontal-style-1',
    templateUrl  : './style-1.component.html',
    styleUrls    : ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarHorizontalStyle1Component implements OnInit, OnDestroy
{
    config: any;
    navigation: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ConfigService} configService
     * @param {NavigationService} navigationService
     * @param {SidebarService} sidebarService
     */
    constructor(
        private configService: ConfigService,
        private navigationService: NavigationService,
        private sidebarService: SidebarService
    )
    {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Get current navigation
        this.navigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this.navigationService.getCurrentNavigation();
            });

        // Subscribe to the config changes
        this.configService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.config = config;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
