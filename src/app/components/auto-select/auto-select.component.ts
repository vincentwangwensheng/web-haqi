import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AbstractControl, FormControl} from '@angular/forms';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-auto-select',
    templateUrl: './auto-select.component.html',
    styleUrls: ['./auto-select.component.scss']
})
export class AutoSelectComponent implements OnInit {
    @Input()
    class = '';
    @Input()
    appearance = 'outline';
    @Input()
    showIcon = true;
    @Input()
    selectControl: AbstractControl = new FormControl('');
    @Input()
    label: string;
    @Input()
    matIcon: string;
    @Input()
    requiredMsg: string;
    @Input()
    notFindMsg: string;
    @Input()
    isEmptyMsg: string;
    @Input()
    showField = 'name';
    @Input()
    secondaryField = 'id';
    @Input()
    showColor = false;
    @Input()
    filterOptions: Observable<any>;
    @Output()
    selectionChange = new EventEmitter<any>();

    constructor() {
    }

    ngOnInit() {
    }

    onStChange(option) {
        this.selectionChange.emit(option);
    }

}
