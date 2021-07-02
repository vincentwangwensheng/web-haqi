import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {AbstractControl, FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material';
import {CurrencyPipe} from '@angular/common';
import {Router} from '@angular/router';
import {LogoutService} from './logout.service';

@Injectable({
    providedIn: 'root'
})
export class Utils {
    onUpload = new Subject(); // 开始上传的节点
    onUploadEnd = new Subject(); // 上传结束
    editFlag = 0;

    maxCurrencyNumber = 999999999999;

    constructor(
        private http: HttpClient,
        private router: Router,
        private logoutService: LogoutService,
        private currency: CurrencyPipe,
        private snackBar: MatSnackBar
    ) {
    }

    /** 开放菜单登录*/


    /**菜单权限*/

    getFlatMenu(navigation, flatMenu = []) {
        navigation.forEach(item => {
            flatMenu.push(item);
            if (item.children) {
                this.getFlatMenu(item.children, flatMenu);
            }
        });
        return flatMenu;
    }

    // 从权限列表中重新选中菜单
    loadStatusFromAuthority(authList: any[], menus: any[]) {
        menus.forEach(menu => {
            if (authList.find(item => item.name === menu.id)) {
                menu.checked = true;
                if (menu.children) {
                    this.loadStatusFromAuthority(authList, menu.children);
                }
            }
        });
    }

    // 获取选中的权限
    getCheckedAuthority(navigation, authority = []) {
        navigation.forEach(item => {
            if (item.checked) {
                authority.push(item.id);
            }
            if (item.children) {
                this.getCheckedAuthority(item.children, authority);
            }
        });
        return authority;
    }


    /** 切换项目相关*/
    // 获取项目配置
    getProject() {
        return new Promise<any>(resolve => {
            this.http.get<any>('configs/projects.json').subscribe(res => {
                const current = res.current;
                const project = res[current];
                localStorage.setItem('currentProject', current);
                if (project.baseUrl) {
                    sessionStorage.setItem('baseUrl', project.baseUrl);
                }
                if (project.logo_square) {
                    localStorage.setItem('logo_square', project.logo_square);
                }
                if (project.logo_rectangle) {
                    localStorage.setItem('logo_rectangle', project.logo_rectangle);
                }
                if (project.merchantsUrl) {
                    console.log('将要跳转的商户端链接，', project.merchantsUrl);
                    localStorage.setItem('merchantsUrl', project.merchantsUrl);
                    sessionStorage.setItem('merchantsUrl', project.merchantsUrl);
                }
                if (project.passengerTrafficSystem) {
                    console.log('将要跳转的客流系统链接，', project.passengerTrafficSystem);
                    localStorage.setItem('passengerTrafficSystem', project.passengerTrafficSystem);
                    sessionStorage.setItem('passengerTrafficSystem', project.passengerTrafficSystem);
                }
                resolve(project);
            });
        });
    }

    // 根据配置切换项目
    changeProjectByConfig() {
        return new Promise<any>(resolve => {
            this.getProject().then(project => {
                if (project.logo_square) {
                    // 获取浏览器头图标
                    const icon: HTMLLinkElement = document.getElementById('link-icon') as any;
                    icon.href = project.logo_square;
                }
                if (project.description) {
                    const meta: HTMLMetaElement = document.getElementById('meta-description') as any;
                    meta.content = project.description;
                }
                resolve(project);
            });
        });
    }


    // 获取项目接口基本地址
    getBaseUrl() {
        return new Promise<any>(resolve => {
            this.getProject().then(project => {
                console.log('当前环境baseUrl:' + project.baseUrl);
                resolve(project);
            });
        });
    }


    // quill创建时上传图片并添加进富文本
    onEditorCreated(editor, control) {
        const toolbar = editor.getModule('toolbar');
        toolbar.addHandler('image', () => {
            if (this.editFlag !== 1) { // 非详情状态 0 新建 1 详情 2 编辑
                this.uploadImage().then(res => {
                    const range = editor.getSelection(true);
                    const imageUrl = this.getImgUrlBySaveId(res);
                    editor.insertEmbed(range.index, 'image', imageUrl);
                    setTimeout(() => { // 设置延时添加完了index才会变
                        editor.setSelection(range.index + 1);
                    }, 500);
                    control.setValue(editor.root.innerHTML);
                }, reason => {
                    this.snackBar.open(reason, '✖');
                });
            }
        });
    }

    // 获取过滤操作的options
    getFilterOptions(control: AbstractControl, options: any[], searchField: string, secondId?: string): Observable<any> {
        return control.valueChanges.pipe(startWith(''), map(value => {
            let filterList;
            if (value === undefined || value === null) {
                value = '';
            }
            if (secondId) {
                filterList = options.filter(item => (JSON.stringify(item[searchField]).toLowerCase().includes(value.toLowerCase())) ||
                    JSON.stringify(item[secondId]).toLowerCase().includes(value.toLowerCase()));
            } else {
                filterList = options.filter(item => JSON.stringify(item[searchField]).toLowerCase().includes(value.toLowerCase()));

            }
            /**
             * @param filterList:any[] 搜索后过滤数据
             * @setError notFind
             * */
            if (filterList.length === 0) {
                control.setErrors({notFind: true}, {emitEvent: false});
                control.markAsTouched();
            } else {
                const errors = control.errors;
                if (errors && errors.notFind) {
                    delete errors.notFind;
                    control.setErrors(errors);
                }
            }
            /**
             * @param options:any[] 总筛选条件
             * @setError isEmpty
             * */
            if (options.length === 0) {
                control.setErrors({isEmpty: true}, {emitEvent: false});
                control.markAsTouched();
            } else {
                const errors = control.errors;
                if (errors && errors.isEmpty) {
                    delete errors.isEmpty;
                    control.setErrors(errors, {emitEvent: false});
                    control.markAsPending();
                }
            }
            return filterList;
        }));
    }

    // 设置图片
    setImage(id, value) {
        const img: HTMLImageElement = document.getElementById(id) as any;
        if (value) {
            if (this.isNumber(value)) {
                img.src = this.getImgUrlBySaveId(value);
            } else {
                img.src = value;
            }
        } else {
            img.removeAttribute('src');
        }
    }

    // 删除图片
    deleteImage(id, control) {
        const img: HTMLImageElement = document.getElementById(id) as any;
        img.removeAttribute('src');
        control.setValue('', {emitEvent: false});
    }


    // 通过saveId获取url
    getImgUrlBySaveId(saveId) {
        if (saveId) {
            return sessionStorage.getItem('baseUrl') + 'file/api/file/showImg?saveId=' + saveId;
        } else {
            return '';
        }
    }

    // 上传图片并拿到回调
    uploadImage() {
        return new Promise<any>((resolve, reject) => {
            const inputElement = document.createElement('input');
            inputElement.setAttribute('type', 'file');
            inputElement.setAttribute('accept', 'image/*');
            inputElement.hidden = true;
            inputElement.addEventListener('change', () => {
                const file = inputElement.files[0];
                if (!file.type.includes('image')) {
                    console.log(file);
                    reject('请选择图片文件！');
                    return;
                }
                const formData = new FormData();
                formData.append('files', file);
                this.onUpload.next(true);
                this.http.post(sessionStorage.getItem('baseUrl') + 'file/api/file/upload', formData).subscribe(res => {
                    if (res) {
                        resolve(res);
                        this.onUploadEnd.next(res);
                    } else {
                        this.onUploadEnd.next();
                        reject('获取saveId失败');
                    }
                    inputElement.remove();
                }, error1 => {
                    reject('接口调用失败');
                    inputElement.remove();
                });
            });
            inputElement.click();
        });
    }

    /**
     * @param page
     * @param size
     * @param sort
     * @param search? 条件查询条件
     * @param filter? 默认查询条件(区分共用接口不同业务数据的情况)
     * */
    // 传入字段 返回拼接搜索的api
    getMultiSearch(page, size, sort, search?, filter?) {
        const pageSearch = '?page=' + page + '&';
        const sizeSearch = 'size=' + size + '&';
        const sortSearch = sort ? 'sort=' + sort : '';
        const multiSearch = [];
        if (search && search.length > 0) {
            search.forEach(item => {
                let api = '';
                if (item.type === 'input') {
                    if (item.direct) { // 直接字段名=查询
                        api = item.name + '=' + item.value;
                    } else {
                        api = item.name + '.contains=' + item.value;
                    }
                } else if (item.type === 'select' || item.type === 'filter') {
                    api = item.name + '.equals=' + item.value;
                } else if (item.type === 'date') {
                    if (item.startDate) {
                        api += item.name + '.greaterOrEqualThan=' + new Date(item.startDate).toISOString();
                    }
                    if (item.endDate) {
                        api += '&' + item.name + '.lessOrEqualThan=' + new Date(item.endDate).toISOString();
                    }
                }
                multiSearch.push(api);
            });
        }
        if (filter && filter.length > 0) {
            filter.forEach(item => {
                let api = '';
                if (item.reg) { // contains 等其他情况
                    if (item.reg === 'input') {
                        api = item.name + '=' + item.value;
                    } else {
                        api = item.name + '.' + item.reg + '=' + item.value;
                    }
                } else {
                    api = item.name + '.equals=' + item.value;
                }
                multiSearch.push(api);
            });

        }
        let multiSearchApi = '';
        if (multiSearch.length > 0) {
            multiSearchApi = '&' + multiSearch.join('&');
        }
        return pageSearch + sizeSearch + sortSearch + multiSearchApi;
    }




    /**
     * @param page
     * @param size
     * @param sort
     * @param search? 条件查询条件
     * @param filter? 默认查询条件(区分共用接口不同业务数据的情况)
     * */
    // 传入字段 返回拼接搜索的api
    getELMultiSearch(page, size, sort, search?, filter?) {
        const pageSearch = '?page=' + page + '&';
        const sizeSearch = 'size=' + size + '&';
        const sortSearch = sort ? 'sort=' + sort : '';
        const multiSearch = [];
        if (search && search.length > 0) {
            search.forEach(item => {
                let api = '';
                if (item.type === 'input') {
                    if (item.direct) { // 直接字段名=查询
                        api = item.name + '=' + item.value;
                    } else {
                        api = item.name + '.keyword:' + item.value + '*';
                    }
                } else if (item.type === 'select' || item.type === 'filter') {
                    api = item.name + ':"' + item.value + '"';
                } else if (item.type === 'date') {
                    // if (item.startDate) {
                    //     api += item.name + ':>' + new Date(item.startDate).toISOString();
                    // }
                    // if (item.endDate) {
                    //     api += ' AND ' + item.name + ':<' + new Date(item.endDate).toISOString();
                    // }
                    if (item.startDate && !item.endDate) {
                        api = item.name + ':[' + new Date(item.startDate).toISOString() + ' TO *]';
                    }
                    if (!item.startDate && item.endDate) {
                        api = item.name + ':[* TO ' + new Date(item.endDate).toISOString() + ']';
                    }
                    if (item.startDate && item.endDate) {
                        api = item.name + ':[' + new Date(item.startDate).toISOString() + ' TO ' + new Date(item.endDate).toISOString() + ']';
                    }
                }
                multiSearch.push(api);
            });
        }
        if (filter && filter.length > 0) {
            filter.forEach(item => {
                let api = '';
                if (item.reg) { // contains 等其他情况
                    api = item.name + ':' + item.value + '';
                    // api = item.name + '.' + item.reg + '=' + item.value;
                } else {
                    api = item.name + ':' + item.value + '';

                }
                multiSearch.push(api);
            });

        }
        let multiSearchApi = '';
        if (multiSearch.length > 0) {
            multiSearchApi = '&query=' + multiSearch.join(' AND ');
        } else {
            multiSearchApi = '&query=*';
        }
        return pageSearch + sizeSearch + sortSearch + multiSearchApi;
    }



    /** 输入格式化相关*/
    // 格式化为整数
    transformToNumber(event, min?, max?) {
        if (this.isNumber(event.target.value)) {
            if (event.target.value > max) {
                event.target.value = max;
            } else if (event.target.value < min) {
                event.target.value = min;
            }
        } else {
            event.target.value = this.replaceAllToNumber(event.target.value);
        }
    }

    transformToNumberWithControl(value, control, min?, max?) {
        if (this.isNumber(value)) {
            if (value > max) {
                control.setValue(max, {emitEvent: false});
            } else if (value < min) {
                control.set(min, {emitEvent: false});
            }
        } else {
            control.setValue(this.replaceAllToNumber(value), {emitEvent: false});
        }
    }

    // 格式化为金额
    transformToCNY(event) {
        if (this.isNumber(event.target.value) || this.isCNY(event.target.value)) {
            if (this.toNumber(event.target.value) >= this.maxCurrencyNumber) {
                event.target.value = this.maxCurrencyNumber;
            }
            event.target.value = this.formatToCNY(event.target.value);

        } else {
            event.target.value = this.replaceAllToNumber(event.target.value);
        }
    }

    // valueChange时触发
    transformToCNYByControl(value, control) {
        if (this.isNumber(value) || this.isCNY(value)) {
            if (this.toNumber(value) >= this.maxCurrencyNumber) {
                value = this.maxCurrencyNumber;
            }
            control.setValue(this.formatToCNY(value), {emitEvent: false});
        } else {
            control.setValue(this.formatToCNY(this.replaceAllToNumber(value)), {emitEvent: false});
        }
    }

    // 转化为金额显示
    formatToCNY(number: string | number) {
        return this.currency.transform(this.toNumber(number), 'CNY', '￥', '1.0-0');
    }

    // 是否是数字
    isNumber(input) {
        const reg = /(^[0-9]\d*$)/;
        return reg.test(input);
    }

    // 是否至多保留一位小数
    isFixed1(input) {
        const reg = /^[0-9]+([.][0-9])?$/;
        return reg.test(input);
    }

    // 去除非一位小数的部分
    replaceAllToFixed1(input) {
        return input.replace(/^\D*([0-9]\d*\.?\d?)?.*$/, '$1');
    }

    // 是否至多保留两位小数
    isFixed2(input) {
        const reg = /^[0-9]+([.][0-9]{1,2})?$/;
        return reg.test(input);
    }

    // 去除非2位小数的部分
    replaceAllToFixed2(input) {
        return input.replace(/^\D*([0-9]\d*\.?\d{0,2})?.*$/, '$1');
    }

    // 是否是人民币金额
    isCNY(input) {
        console.log(input);
        const number = input.replace(/\,/g, '').replace('￥', '');
        console.log(number);
        return this.isNumber(number);
    }

    // 转化为数字
    toNumber(input) {
        return input.toString().replace(/\,/g, '').replace('￥', '');
    }

    // 数字格式化
    replaceAllToNumber(input) {
        return input.replace(/\D/g, '');
    }

    /** 列表条件查询转化*/
    // 转化columns 拿到条件查询的条件
    transformColumns(columns) {
        const multiSearch = [];
        columns.forEach(column => {
            if (column.value !== '') {
                if (column.source) { // 拼接特殊字段查询code.xxx.contains  / coupon.xxxx.contains
                    const newColumn: any = {};
                    Object.assign(newColumn, column);
                    newColumn.name = newColumn.source + '.' + newColumn.name;
                    multiSearch.push(newColumn);
                } else {
                    multiSearch.push(column);
                }
            }
        });
        return multiSearch;
    }


    // 传入字段 返回要根据查询的字段来查询数量
    getCountSearch(search?) {
        const multiSearch = [];
        if (search && search.length > 0) {
            search.forEach(item => {
                let api = '';
                if (item.type === 'input') {
                    api = item.name + '.contains=' + item.value;
                } else if (item.type === 'select' || item.type === 'filter') {
                    api = item.name + '.equals=' + item.value;
                } else if (item.type === 'date') {
                    if (item.startDate) {
                        api += item.name + '.greaterOrEqualThan=' + new Date(item.startDate).toISOString();
                    }
                    if (item.endDate) {
                        api += item.name + '.lessOrEqualThan=' + new Date(item.endDate).toISOString();
                    }
                }
                multiSearch.push(api);
            });
        }
        let multiSearchApi = '';
        if (multiSearch.length > 0) {
            multiSearchApi = '?' + multiSearch.join('&');
        }
        return multiSearchApi;
    }

    /** 时间校验*/

    isTime(value) {
        const reg = /^[0-9a-zA-Z]{1,2}[:][0-9]{1,2}$/;
        return reg.test(value);
    }

}
