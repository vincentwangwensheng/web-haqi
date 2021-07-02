import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-inject-confirm-dialog',
    templateUrl: './inject-confirm-dialog.component.html',
    styleUrls: ['./inject-confirm-dialog.component.scss']
})
export class InjectConfirmDialogComponent implements OnInit {

    title: string;
    content: string;
    cancelButton = true;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.title = this.data.title ? this.data.title : '';
        this.content = this.data.content ? this.data.content : '';
        this.cancelButton = this.data.cancelButton ? this.data.cancelButton : false;
    }

    ngOnInit() {
    }
}
