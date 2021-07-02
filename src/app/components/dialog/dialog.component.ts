import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-dialog',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
    @Input()
    title: string;
    @Input()
    saveDisabled = false;

    constructor() {
    }

    ngOnInit() {
    }

}
