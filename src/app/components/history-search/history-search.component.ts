import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {fuseAnimations} from '../../../@fuse/animations';

@Component({
    selector: 'app-history-search',
    templateUrl: './history-search.component.html',
    styleUrls: ['./history-search.component.scss'],
    animations: fuseAnimations
})
export class HistorySearchComponent implements OnInit {
    historySearch = []; // 搜索历史
    autoSearchList = []; // 当前自动完成的搜索列表
    // 搜索历史缓存的key
    @Input()
    historyKey = '';

    inputValue = '';

    @Input()
    showSearch = false;

    // input数据change
    @Output()
    searchChange: EventEmitter<any> = new EventEmitter<any>();
    // 选择历史搜索
    @Output()
    optionSelected: EventEmitter<any> = new EventEmitter<any>();
    // 输入清空
    @Output()
    inputReset: EventEmitter<any> = new EventEmitter<any>();

    // 是否搜索了
    searched = false;

    constructor() {
    }

    ngOnInit() {
    }

    onSearchPath(event) {
        this.searched = true;
        this.searchChange.emit(event);
    }

    clearInput() {
        this.inputValue = '';
    }

    // 选择选项时向外发射
    optionSelect(event) {
        this.searched = true;
        this.optionSelected.emit(event);
    }


    // input输入时过滤历史 或发送清空标记
    autoFilter(event) {
        if (this.searched && event.target.value === '') {
            this.inputReset.emit();
            this.searched = false;
        }
        this.autoSearchList = this.historySearch.filter(search => search.value.toLowerCase().includes(event.target.value.trim().toLowerCase()));
    }

    // 删除单个历史
    deleteSearch(event) {
        this.historySearch = this.historySearch.filter(item => item.value !== event.value);
        const deleteSearch = this.autoSearchList.find(item => item.value === event.value);
        if (deleteSearch) {
            deleteSearch.delete = true;
        }
        if (this.historySearch.length === 0) {
            this.autoSearchList = []; // 只要操作了自动填充的列表 就会触发自动隐藏
        }
        localStorage.setItem(this.historyKey, JSON.stringify(this.historySearch));
    }

    // 删除全部
    deleteAll() {
        this.historySearch = [];
        this.autoSearchList = [];
        localStorage.removeItem(this.historyKey);
    }

    // input获得焦点时获取历史自动补全内容 获取当次操作时的缓存 后续搜索放入历史 下次重新获得焦点再拿到
    getAutoSearch() {
        if (localStorage.getItem(this.historyKey)) {
            this.historySearch = JSON.parse(localStorage.getItem(this.historyKey));
            this.autoSearchList = this.historySearch;
        }
    }

}
