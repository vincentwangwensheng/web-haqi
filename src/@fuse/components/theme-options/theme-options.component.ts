import {Component, HostBinding, Inject, OnDestroy, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DOCUMENT} from '@angular/common';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';

import {fuseAnimations} from '@fuse/animations';
import {ConfigService} from '@fuse/services/config.service';
import {NavigationService} from '@fuse/components/navigation/navigation.service';
import {SidebarService} from '@fuse/components/sidebar/sidebar.service';
import {TranslateService} from '@ngx-translate/core';
import {ResolveEnd, Router} from '@angular/router';
import {MatDialog} from '@angular/material';

@Component({
    selector: 'theme-options',
    templateUrl: './theme-options.component.html',
    styleUrls: ['./theme-options.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ThemeOptionsComponent implements OnInit, OnDestroy {
    config: any;
    form: FormGroup;

    hasCache = false; // 是否缓存了主题配置
    isLoginPage = false; // 是否是登陆页面 需要隐藏布局面板

    @HostBinding('class.bar-closed')
    barClosed: boolean;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        @Inject(DOCUMENT) private document: any,
        private _formBuilder: FormBuilder,
        private configService: ConfigService,
        private navigationService: NavigationService,
        private sidebarService: SidebarService,
        private translate: TranslateService,
        private router: Router,
        private dialog: MatDialog
    ) {
        // Set the defaults
        this.barClosed = true;

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
        // Build the config form
        // noinspection TypeScriptValidateTypes
        this.form = this._formBuilder.group({
            colorTheme: new FormControl(),
            customScrollbars: new FormControl(),
            layout: this._formBuilder.group({
                style: new FormControl(),
                width: new FormControl(),
                navbar: this._formBuilder.group({
                    primaryBackground: new FormControl(),
                    secondaryBackground: new FormControl(),
                    folded: new FormControl(),
                    hidden: new FormControl(),
                    position: new FormControl(),
                    variant: new FormControl()
                }),
                toolbar: this._formBuilder.group({
                    background: new FormControl(),
                    customBackgroundColor: new FormControl(),
                    hidden: new FormControl(),
                    position: new FormControl()
                }),
                footer: this._formBuilder.group({
                    background: new FormControl(),
                    customBackgroundColor: new FormControl(),
                    hidden: new FormControl(),
                    position: new FormControl()
                }),
                sidepanel: this._formBuilder.group({
                    hidden: new FormControl(),
                    position: new FormControl()
                })
            })
        });

        if (localStorage.getItem('themesConfig')) { // 取出缓存了的颜色
            this.hasCache = true;
            this.configService.setConfig(JSON.parse(localStorage.getItem('themesConfig')));
        }

        // Subscribe to the config changes
        this.configService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.config = config;
                // Set the config form values without emitting an event
                // so that we don't end up with an infinite loop
                this.form.setValue(this.config, {emitEvent: false});
            });

        // Subscribe to the specific form value changes (layout.style)
        this.form.get('layout.style').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                // Reset the form values based on the
                // selected layout style
                this._resetFormValues(value);
            });

        // Subscribe to the form value changes
        this.form.valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                // Update the config
                this.configService.config = config;

                // 缓存 config
                localStorage.setItem('themesConfig', JSON.stringify(config));
                this.hasCache = true;

                // 当切换布局时 fuse会根据当前语言切换nav的翻译 为了修复这个bug  修改配置等操作时 手动重构nav
                // this.translate.get('nav').subscribe(nav => {
                //     // Get default navigation
                //     this.navigationService.unregister('main');  // 卸载main 导航菜单
                //     this.navigationService.register('main', AppComponent.navigation); // 重新注册已翻译好的菜单
                //     this.navigationService.setCurrentNavigation('main');  // 将main设为当前
                //     if (!this.navigationService.getNavigationItem('custom-function')) {  // 如果自定义菜单不存在 则添加
                //         this.navigationService.addNavigationItem(this.customFunctionNavItem(), 'end');
                //     }
                //
                // });
            });

        // // Add customize nav item that opens the bar programmatically
        // this.navigationService.addNavigationItem(this.customFunctionNavItem(), 'end');
        // // 切换语言时候更新自定义菜单
        // this.translate.onLangChange.subscribe(res => {
        //     this.navigationService.updateNavigationItem('custom-function', this.customFunctionNavItem());
        // });

        this.router.events.pipe(filter(event => event instanceof ResolveEnd)).subscribe(res => {
            if (res['urlAfterRedirects'] === '/login') {
                this.isLoginPage = true;
            } else {
                this.isLoginPage = false;
            }
        });
    }

    // 自定义菜单
    customFunctionNavItem() {
        return {
            'id': 'custom-function',
            'title': this.translate.instant('customFunction.title'),
            'type': 'group',
            'translate': 'customFunction.title',
            'children': [
                {
                    'id': 'customize',
                    'title': this.translate.instant('customFunction.customize'),
                    'type': 'item',
                    'translate': 'customFunction.customize',
                    'icon': 'iconsetting1',
                    'function': () => {
                        this.toggleSidebarOpen('themeOptionsPanel');
                    }
                }
            ]
        };
    }

    reset(resetConfirm) {
        this.dialog.open(resetConfirm).afterClosed().subscribe(result => {
            if (result) {
                this.configService.resetToDefaults();
                this.hasCache = false;
                localStorage.removeItem('themesConfig');
                if (this.isLoginPage) {
                    this.configService.config = {
                        layout: {
                            navbar: {
                                hidden: true
                            },
                            toolbar: {
                                hidden: true
                            },
                            footer: {
                                hidden: true
                            },
                            sidepanel: {
                                hidden: true
                            }
                        }
                    };
                }
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

        // Remove the custom function menu
        this.navigationService.removeNavigationItem('custom-function');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset the form values based on the
     * selected layout style
     *
     * @param value
     * @private
     */
    private _resetFormValues(value): void {
        switch (value) {
            // Vertical Layout #1
            case 'vertical-layout-1': {
                this.form.patchValue({
                    layout: {
                        width: 'fullwidth',
                        navbar: {
                            primaryBackground: 'bj-navy-700',
                            secondaryBackground: 'bj-navy-900',
                            folded: false,
                            hidden: false,
                            position: 'left',
                            variant: 'vertical-style-1'
                        },
                        toolbar: {
                            background: 'bj-white-500',
                            customBackgroundColor: false,
                            hidden: false,
                            position: 'below-static'
                        },
                        footer: {
                            background: 'bj-navy-900',
                            customBackgroundColor: true,
                            hidden: true,
                            position: 'below-static'
                        },
                        sidepanel: {
                            hidden: false,
                            position: 'right'
                        }
                    }
                });

                break;
            }

            // Vertical Layout #2
            case 'vertical-layout-2': {
                this.form.patchValue({
                    layout: {
                        width: 'fullwidth',
                        navbar: {
                            primaryBackground: 'bj-navy-700',
                            secondaryBackground: 'bj-navy-900',
                            folded: false,
                            hidden: false,
                            position: 'left',
                            variant: 'vertical-style-1'
                        },
                        toolbar: {
                            background: 'bj-white-500',
                            customBackgroundColor: false,
                            hidden: false,
                            position: 'below'
                        },
                        footer: {
                            background: 'bj-navy-900',
                            customBackgroundColor: true,
                            hidden: true,
                            position: 'below'
                        },
                        sidepanel: {
                            hidden: false,
                            position: 'right'
                        }
                    }
                });

                break;
            }

            // Vertical Layout #3
            case 'vertical-layout-3': {
                this.form.patchValue({
                    layout: {
                        width: 'fullwidth',
                        navbar: {
                            primaryBackground: 'bj-navy-700',
                            secondaryBackground: 'bj-navy-900',
                            folded: false,
                            hidden: false,
                            position: 'left',
                            layout: 'vertical-style-1'
                        },
                        toolbar: {
                            background: 'bj-white-500',
                            customBackgroundColor: false,
                            hidden: false,
                            position: 'above-static'
                        },
                        footer: {
                            background: 'bj-navy-900',
                            customBackgroundColor: true,
                            hidden: true,
                            position: 'above-static'
                        },
                        sidepanel: {
                            hidden: false,
                            position: 'right'
                        }
                    }
                });

                break;
            }

            // Horizontal Layout #1
            case 'horizontal-layout-1': {
                this.form.patchValue({
                    layout: {
                        width: 'fullwidth',
                        navbar: {
                            primaryBackground: 'bj-navy-700',
                            secondaryBackground: 'bj-navy-900',
                            folded: false,
                            hidden: false,
                            position: 'top',
                            variant: 'vertical-style-1'
                        },
                        toolbar: {
                            background: 'bj-white-500',
                            customBackgroundColor: false,
                            hidden: false,
                            position: 'above'
                        },
                        footer: {
                            background: 'bj-navy-900',
                            customBackgroundColor: true,
                            hidden: true,
                            position: 'above-fixed'
                        },
                        sidepanel: {
                            hidden: false,
                            position: 'right'
                        }
                    }
                });

                break;
            }
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this.sidebarService.getSidebar(key).toggleOpen();
    }
}
