import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormControl} from '@angular/forms';
import {english} from 'flatpickr/dist/l10n/default';
import {Mandarin} from 'flatpickr/dist/l10n/zh';
import {MandarinTraditional} from 'flatpickr/dist/l10n/zh-tw';
import {TranslateService} from '@ngx-translate/core';
import flatpickr from 'flatpickr';
import {BaseOptions} from 'flatpickr/dist/types/options';
import {setHours, setMinutes} from 'date-fns';

@Component({
    selector: 'app-material-date-picker',
    templateUrl: './material-date-picker.component.html',
    styleUrls: ['./material-date-picker.component.scss']
})
export class MaterialDatePickerComponent implements OnInit, OnDestroy {
    @Input()
    label: string;

    @Input()
    readonly = true;

    @Input()
    required = false;

    @Input()
    showCalendar = true;

    @Input()
    floatLabel = 'auto';

    @Input()
    config: Partial<BaseOptions> = {
        enableTime: true,
        time_24hr: true,
        enableSeconds: true
    };

    @Input()
    timeControl: AbstractControl = new FormControl();

    @Output()
    sourceDate: EventEmitter<any> = new EventEmitter();

    @Output()
    inputValue: EventEmitter<any> = new EventEmitter<any>();

    picker: any;

    @ViewChild('input', {static: true})
    input;

    constructor(
        private translateService: TranslateService
    ) {
    }

    // 改变日期配置
    setDateLocale(lang) {
        switch (lang) {
            case 'zh-CN': {
                this.config.locale = Mandarin;
                if (this.picker) {
                    this.picker.destroy();
                    this.picker = flatpickr(this.input.nativeElement, this.config);
                }
                break;
            }
            case 'zh-TW': {
                this.config.locale = MandarinTraditional;
                if (this.picker) {
                    this.picker.destroy();
                    this.picker = flatpickr(this.input.nativeElement, this.config);
                }
                break;
            }
            default: {
                this.config.locale = english;
                if (this.picker) {
                    this.picker.destroy();
                    this.picker = flatpickr(this.input.nativeElement, this.config);
                }
                break;
            }
        }
    }

    // 初始化设置日期语言以及语言变化改变
    setLanguageAndChange() {
        const currentLang = this.translateService.getBrowserCultureLang();
        if (sessionStorage.getItem('selectedLang')) {
            this.setDateLocale(sessionStorage.getItem('selectedLang'));
        } else {
            this.setDateLocale(currentLang);
        }
        this.translateService.onLangChange.subscribe(res => {
            this.setDateLocale(res.lang);
        });
    }

    // 选择日期变化
    onDateChange(event) {
        const sourceDate = this.picker.selectedDates[0];
        this.sourceDate.emit(sourceDate);
        setTimeout(() => {
            this.inputValue.emit(event.target.value);
        }, 500);
    }

    ngOnInit() {
        this.setLanguageAndChange();
        this.picker = flatpickr(this.input.nativeElement, this.config);
        this.timeControl.valueChanges.subscribe(res => {
            if (new Date(res).toString() !== 'Invalid Date') {
                this.picker.setDate(new Date(res), false, this.config.dateFormat ? this.config.dateFormat : 'Y-m-d H:i:S');
            }
            if (res === null) {
                this.picker.setDate(null, false);
            }
            if (this.isTime(res)) {
                const times = res.split(':');
                const date = setMinutes(setHours(new Date(), Number(times[0])), Number(times[1]));
                this.picker.setDate(date, false);
            }
        });
    }

    isTime(value) {
        const reg = /^[0-9a-zA-Z]{1,2}[:][0-9]{1,2}$/;
        return reg.test(value);
    }

    ngOnDestroy(): void {
        this.picker.destroy();
    }
}
