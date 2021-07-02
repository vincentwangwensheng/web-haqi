import {Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {MediaObserver} from '@angular/flex-layout';
import {CookieService} from 'ngx-cookie-service';
import {takeUntil} from 'rxjs/operators';

import {FuseMatchMediaService} from '@fuse/services/match-media.service';
import {NavigationService} from '@fuse/components/navigation/navigation.service';
import {TranslateService} from '@ngx-translate/core';
import {SidebarService} from '../sidebar/sidebar.service';
import {Subject} from 'rxjs';

@Component({
    selector: 'fuse-shortcuts',
    templateUrl: './shortcuts.component.html',
    styleUrls: ['./shortcuts.component.scss']
})
export class FuseShortcutsComponent implements OnInit, OnDestroy {
    shortcutItems: any[];
    navigationItems: any[];
    filteredNavigationItems: any[];
    searching: boolean;
    searchValue = '';
    mobileShortcutsPanelActive: boolean;

    @Input()
    navigation: any;

    @ViewChild('searchInput', {static: true})
    searchInputField;

    @ViewChild('shortcuts', {static: true})
    shortcutsEl: ElementRef;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {CookieService} _cookieService
     * @param {FuseMatchMediaService} _fuseMatchMediaService
     * @param {NavigationService} navigationService
     * @param {MediaObserver} _mediaObserver
     * @param {Renderer2} _renderer
     */
    constructor(
        private _cookieService: CookieService,
        private _fuseMatchMediaService: FuseMatchMediaService,
        private navigationService: NavigationService,
        private _mediaObserver: MediaObserver,
        private _renderer: Renderer2,
        private sidebarService: SidebarService,
        private translate: TranslateService
    ) {
        // Set the defaults
        this.shortcutItems = [];
        this.searching = false;
        this.mobileShortcutsPanelActive = false;

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
        // Get the navigation items and flatten them
        this.filteredNavigationItems = this.navigationItems = this.navigationService.getFlatNavigation(this.navigation);
        if (this._cookieService.check('shortcuts')) {
            this.shortcutItems = JSON.parse(this._cookieService.get('shortcuts'));
        }
        else {
            // User's shortcut items
            // this.shortcutItems = this.navigationItems;
        }

        // this.translate.onLangChange.subscribe(() => {
        //     this.filteredNavigationItems  = this.navigationService.getFlatNavigation(this.navigation);
        //     if (this._cookieService.check('shortcuts')) {
        //         this.shortcutItems = JSON.parse(this._cookieService.get('shortcuts'));
        //     }
        //     else {
        //         // User's shortcut items
        //         this.shortcutItems = this.navigationItems;
        //     }
        // });

        // Subscribe to media changes
        this._fuseMatchMediaService.onMediaChange
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                if (this._mediaObserver.isActive('gt-sm')) {
                    this.hideMobileShortcutsPanel();
                }
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

    // 打开主体板
    toggleSidebarOpen(shortcutItem): void {
        if (!shortcutItem.url) {
            if (shortcutItem.id === 'customize') {
                this.sidebarService.getSidebar('themeOptionsPanel').toggleOpen();
            }
        }
    }

    // onblur
    leave() {
        this.searchValue = '';
        this.searching = false;
        this.filteredNavigationItems = this.navigationItems;
    }

    /**
     * Search
     *
     * @param event
     */
    search(event): void {
        const value = event.target.value.toLowerCase();

        if (value === '') {
            this.searching = false;
            this.filteredNavigationItems = this.navigationItems;

            return;
        }

        this.searching = true;

        this.filteredNavigationItems = this.navigationItems.filter((navigationItem) => {
            // return navigationItem.title.toLowerCase().includes(value);
            return this.translate.instant(navigationItem.translate).toLowerCase().includes(value);
        });
    }

    /**
     * Toggle shortcut
     *
     * @param event
     * @param itemToToggle
     */
    toggleShortcut(event, itemToToggle): void {
        event.stopPropagation();

        for (let i = 0; i < this.shortcutItems.length; i++) {
            if (this.shortcutItems[i].url === itemToToggle.url) {
                this.shortcutItems.splice(i, 1);

                // Save to the cookies
                this._cookieService.set('shortcuts', JSON.stringify(this.shortcutItems));
                return;
            }
        }

        this.shortcutItems.push(itemToToggle);

        // Save to the cookies
        this._cookieService.set('shortcuts', JSON.stringify(this.shortcutItems));
    }

    /**
     * Is in shortcuts?
     *
     * @param navigationItem
     * @returns {any}
     */
    isInShortcuts(navigationItem): any {
        return this.shortcutItems.find(item => {
            return item.url === navigationItem.url;
        });
    }

    /**
     * On menu open
     */
    onMenuOpen(): void {
        setTimeout(() => {
            this.searchInputField.nativeElement.focus();
        });
    }

    /**
     * Show mobile shortcuts
     */
    showMobileShortcutsPanel(): void {
        this.mobileShortcutsPanelActive = true;
        this._renderer.addClass(this.shortcutsEl.nativeElement, 'show-mobile-panel');
    }

    /**
     * Hide mobile shortcuts
     */
    hideMobileShortcutsPanel(): void {
        this.mobileShortcutsPanelActive = false;
        this._renderer.removeClass(this.shortcutsEl.nativeElement, 'show-mobile-panel');
    }
}
