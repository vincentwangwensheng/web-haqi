import {Injectable} from '@angular/core';
import {ConfigService} from '../../@fuse/services/config.service';

@Injectable({
    providedIn: 'root'
})
export class LayoutControlService {

    constructor(private config: ConfigService) {

    }
    // 全部显示
    showLayout() {
        this.config.config = {
            layout: {
                navbar: {
                    hidden: false
                },
                toolbar: {
                    hidden: false
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

    // 全部隐藏
    hideLayout() {
        this.config.config = {
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
