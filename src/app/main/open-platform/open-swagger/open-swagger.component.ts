import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {FuseProgressBarService} from '../../../../@fuse/components/progress-bar/progress-bar.service';
import {Router} from '@angular/router';
import {SwaggerUIStandalonePreset} from 'swagger-ui-dist';
import {Utils} from '../../../services/utils';
import {OpenCenterService} from '../openCenterService/open-center.service';


@Component({
    selector: 'app-test-swagger',
    templateUrl: './open-swagger.component.html',
    styleUrls: ['./open-swagger.component.scss']
})
export class OpenSwaggerComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject();

    constructor(
        private router: Router,
        private utils: Utils,
        private loading: FuseProgressBarService,
        private openCenterService: OpenCenterService,
    ) {

    }

    ngOnInit() {
        this.utils.getBaseUrl().then(project => {
            const swaggerUrl = project.swaggerUrl;
            const swaggerType = project.swaggerType;
            sessionStorage.setItem('swaggerUrl', swaggerUrl);
            sessionStorage.setItem('swaggerType', swaggerType);
            // 获取所有的活动名称
            this.initSwagger2();
        });


    }


    initSwagger2() {
        const SwaggerUIBundle = require('swagger-ui-dist').SwaggerUIBundle;
        // const SwaggerUIStandalonePreset = require('swagger-ui');
        const token = sessionStorage.getItem('token');
        // Build a system
        const ui = SwaggerUIBundle({
            // url: '/assets/testJson/swagger.json',
            urls: [
                  //  {url: '/assets/testJson/test.json', name: 'test1'},
                {
                    url: sessionStorage.getItem('baseUrl') + 'openapi/v2/api-docs?group=openapi',
                    name: 'openapi',
                    swaggerVersion: '2.0',
                    location: sessionStorage.getItem('baseUrl') + 'openapi/v2/api-docs?group=openapi'
                }
            ],
            dom_id: '#swaggerUI',
            supportedSubmitMethods: [], // 不可以 try it out
            deepLinking: false,
            validatorUrl: null,
            filter: true,
            showRequestHeaders: true,
            showMutatedRequest: true,
            // 请求拦截器
            requestInterceptor: (request) => {
                const url = request.url; // && !url.includes('test')
                if (!url.includes('api-docs')) {
                    const hostBefore = url.split('/');
                    let base_Url = '';
                    let scheme = '';
                    for (let i = 0; i < hostBefore.length; i++) {

                        if (i === hostBefore.length - 1) {
                            base_Url = base_Url + hostBefore[i];
                        } else {
                            if (i === 0) {
                                scheme = hostBefore[i];
                            }
                            if (i >= 2) {
                                base_Url = base_Url + hostBefore[i] + '/';
                            }
                        }
                    }
                    const url_ = scheme + '//' + sessionStorage.getItem('swaggerUrl') + '/' + sessionStorage.getItem('swaggerType') + '/' + base_Url;
                    request.url = url_;
                }
                request.headers.Authorization = token;
                return request;
            },
            responseInterceptor: (response) => {
                // response.body.host = sessionStorage.getItem('swaggerUrl');
                // const b_path = response.body.basePath;
                // const base_path = sessionStorage.getItem('swaggerType') + b_path;
                // response.body.basePath = base_path;
                // response.headers['Access-Control-Allow-Credentials'] = 'true';
                // response.headers['Access-Control-Allow-Origin'] = '*';
                // console.log('response' , response);
                return response;
            },
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset,
            ],
            plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: 'StandaloneLayout',
        });
    }


    ngOnDestroy() {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
}
