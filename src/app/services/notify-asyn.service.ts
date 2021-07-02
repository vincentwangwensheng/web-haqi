import {EventEmitter, Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotifyAsynService {  // 异步通讯
    logout: Subject<any> = new Subject(); // rxjs subject
    onResponse: EventEmitter<any> = new EventEmitter(); // 接口查询完成
    openChange: EventEmitter<any> = new EventEmitter<any>(); // sidebar开关状态
    foldChange: EventEmitter<any> = new EventEmitter<any>(); // sidebar折叠状态
    usernameChange: EventEmitter<any> = new EventEmitter<any>(); // 用户名从直接登录

    constructor() {

    }
}
