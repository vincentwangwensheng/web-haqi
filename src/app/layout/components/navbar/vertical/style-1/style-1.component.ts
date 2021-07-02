import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {delay, filter, take, takeUntil} from 'rxjs/operators';

import {ConfigService} from '@fuse/services/config.service';
import {NavigationService} from '@fuse/components/navigation/navigation.service';
import {FusePerfectScrollbarDirective} from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import {SidebarService} from '@fuse/components/sidebar/sidebar.service';
import {Utils} from '../../../../../services/utils';

@Component({
    selector: 'navbar-vertical-style-1',
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    config: any;
    navigation: any;
    username: string;
    logo_rectangle = '';

    // Private
    private _fusePerfectScrollbar: FusePerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ConfigService} configService
     * @param {NavigationService} navigationService
     * @param {SidebarService} sidebarService
     * @param {Router} _router
     * @param {Utils} utils
     */
    constructor(
        private configService: ConfigService,
        private utils: Utils,
        private navigationService: NavigationService,
        private sidebarService: SidebarService,
        private _router: Router
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(FusePerfectScrollbarDirective, {static: true})
    set directive(theDirective: FusePerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._fusePerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this.navigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._fusePerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                    setTimeout(() => {
                        const activeNavItem: any = document.querySelector('navbar .nav-link.active');

                        if (activeNavItem) {
                            const activeItemOffsetTop = activeNavItem.offsetTop,
                                activeItemOffsetParentTop = activeNavItem.offsetParent ? activeNavItem.offsetParent.offsetTop : 0,
                                scrollDistance = activeItemOffsetTop - activeItemOffsetParentTop - (48 * 3) - 168;

                            this._fusePerfectScrollbar.scrollToTop(scrollDistance);
                        }
                    });
                }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.logo_rectangle = localStorage.getItem('logo_rectangle');
        this.username = sessionStorage.getItem('username');
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                    if (this.sidebarService.getSidebar('navbar')) {
                        this.sidebarService.getSidebar('navbar').close();
                    }
                }
            );

        // Subscribe to the config changes
        this.configService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.config = config;
            });

        // Get current navigation
        this.navigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this.navigationService.getCurrentNavigation();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void {
        this.sidebarService.getSidebar('navbar').toggleOpen();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void {
        this.sidebarService.emitSide('true'); // 监听点击收缩功能菜单
        this.sidebarService.getSidebar('navbar').toggleFold();
    }

    /**
     * 更新用户头像
     * */
    changeUserLogo() {
        this.utils.uploadImage().then(res => {
        });
    }
}
