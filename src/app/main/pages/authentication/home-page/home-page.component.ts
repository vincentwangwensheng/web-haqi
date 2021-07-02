import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {ConfigService} from '../../../../../@fuse/services/config.service';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Title} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {Utils} from '../../../../services/utils';

@Component({
    selector: 'homePage',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
    animations: fuseAnimations
})
export class HomePageComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();

    currentProject = '';

    tlKey = '';

    logo = '';

    merchantsUrl = '';

    constructor(
        private _configService: ConfigService,
        private _formBuilder: FormBuilder,
        private router: Router,
        private title: Title,
        private utils: Utils,
        private translate: TranslateService,
        private loading: FuseProgressBarService,
    ) {

        this._configService.config = {
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

    ngOnInit() {
        this.initProjectParams();
    }


    // 初始化配置
    initProjectParams() {
        this.merchantsUrl = localStorage.getItem('merchantsUrl');
        this.currentProject = localStorage.getItem('currentProject');
        this.logo = localStorage.getItem('logo_rectangle');
        this.tlKey = 'homePage.' + this.currentProject + '.';
        if (!this.currentProject) { // 如果无缓存或被清除
            this.currentProject = localStorage.getItem('currentProject');
            this.tlKey = 'homePage.' + this.currentProject + '.';
        }
    }


    toManageCenter() {
        // 管理中心
        this.router.navigate(['/manageLogin']);
    }

    toDevelopmentCenter() {
        // 开放中心
        this.router.navigate(['/openLogin']);
    }

    toMerchantsCenter(){

        this.utils.getProject().then(data => {
            // console.log(data , '-----data');
            this.merchantsUrl = data.merchantsUrl;
            window.open(this.merchantsUrl);
        });

    }

    toPassengerTrafficSystem(flag){
        this.utils.getProject().then(data => {
            if (flag === 'JinMen'){
                window.open(data.passengerTrafficSystemJinMen);
            } else if (flag === 'ChongQing'){
                window.open(data.passengerTrafficSystemChongQing);
            }
        });
    }

    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
