import {Component, Inject, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Platform} from '@angular/cdk/platform';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {ConfigService} from '@fuse/services/config.service';
import {NavigationService} from '@fuse/components/navigation/navigation.service';
import {SidebarService} from '@fuse/components/sidebar/sidebar.service';
import {SplashScreenService} from '@fuse/services/splash-screen.service';
import {TranslationLoaderService} from '@fuse/services/translation-loader.service';

import {locale as English} from 'app/i18n/en-US';
import {locale as SimpleChinese} from 'app/i18n/zh-CN';
import {locale as TraditionalChinese} from 'app/i18n/zh-TW';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {FuseNavigation} from '../@fuse/types';
import {Navigation} from './navigation/navigation';
import {HttpClient} from '@angular/common/http';
import {DateAdapter} from '@angular/material';
import {Utils} from './services/utils';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    navigation: FuseNavigation[];
    config: any;
    isDrag = false;
    topSessionStorage: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     */
    constructor(
        public viewContainerRef: ViewContainerRef, // ngx-color-picker需要该引用来弹出颜色选择
        @Inject(DOCUMENT) private document: any,
        private configService: ConfigService,
        private activatedRoute: ActivatedRoute,
        private navigationService: NavigationService,
        private sidebarService: SidebarService,
        private splashScreenService: SplashScreenService,
        private translationLoaderService: TranslationLoaderService,
        private translateService: TranslateService,
        private platform: Platform,
        private http: HttpClient,
        private utils: Utils,
        private router: Router,
        private title: Title,
        private adapter: DateAdapter<any>
    ) {
        if (sessionStorage.getItem('navigation')) { // 如果有缓存则从缓存取
            this.navigation = JSON.parse(sessionStorage.getItem('navigation'));
        } else {
                this.navigation = Navigation;
        }

        // Register the navigation to the service
        this.navigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this.navigationService.setCurrentNavigation('main');
        // });

        // add languages support
        this.translateService.addLangs(['en-US', 'zh-CN', 'zh-TW']);

        // set the default language
        this.translateService.setDefaultLang('en-US');

        // load language resources
        this.translationLoaderService.loadTranslations(English, SimpleChinese, TraditionalChinese);

        // 根据浏览器语言自动切换
        // const currentLang = this.translateService.getBrowserCultureLang();
        const currentLang = 'zh-CN';
        if (sessionStorage.getItem('selectedLang')) {
            this.translateService.use(sessionStorage.getItem('selectedLang'));
            this.adapter.setLocale(sessionStorage.getItem('selectedLang'));
        } else if (currentLang === 'zh-CN' || currentLang === 'zh-TW') {
            this.translateService.use(currentLang);
            this.adapter.setLocale(currentLang);
        } else if (currentLang === 'zh-HK') {
            this.translateService.use('zh-TW');
            this.adapter.setLocale('zh-TW');
        } else {
            this.translateService.use('en-US');
            this.adapter.setLocale('en-US');
        }

        // 根据配置切换项目
        this.utils.changeProjectByConfig().then(project => {
            // navigation
            if (sessionStorage.getItem('navigation')) { // 如果有缓存则从缓存取
                this.navigation = JSON.parse(sessionStorage.getItem('navigation'));
            } else {
                    this.navigation = Navigation;
            }

            // 设置浏览器标题
            this.translateService.get(localStorage.getItem('currentProject') + '.title').subscribe(res => {
                this.title.setTitle(res);
            });


            this.navigationService.unregister('main');
            // Register the navigation to the service
            this.navigationService.register('main', this.navigation);

            // Set the main navigation as our current navigation
            this.navigationService.setCurrentNavigation('main');
            // });


            // 当切换语言时订阅并修改浏览器标题
            this.translateService.onLangChange.subscribe((lang) => {
                const langId = lang.lang;
                sessionStorage.setItem('selectedLang', langId);
                this.adapter.setLocale(langId);
                this.translateService.get(localStorage.getItem('currentProject') + '.title').subscribe((res) => {
                    this.title.setTitle(res);
                });
            });
        });


        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
        /**
         setTimeout(() => {
            this.translateService.setDefaultLang('en');
            this.translateService.setDefaultLang('tr');
         });
         */

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this.platform.ANDROID || this.platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // 隐藏整体布局内容
    hideLayout() {
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

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // if (localStorage.getItem('themesConfig')) { // 取出缓存了的颜色
        //     this.configService.setConfig(JSON.parse(localStorage.getItem('themesConfig')));
        // }

        // Subscribe to config changes
        this.configService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.config = config;

                // Boxed
                if (this.config.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.config.colorTheme);
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
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        if (!this.isDrag) {
            this.sidebarService.getSidebar(key).toggleOpen();
        } else {
            this.isDrag = false;
        }
    }

    dragStarted() {
        this.isDrag = true;
    }
}
