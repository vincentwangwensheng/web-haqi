import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-data-preview',
    templateUrl: './data-preview.component.html',
    styleUrls: ['./data-preview.component.scss']
})
export class DataPreviewComponent implements OnInit {

    @Input()
    previewData = '';

    constructor() {
    }

    ngOnInit() {
    }


}

  // 使用方法
 // 1. html
 // <ng-template #PreDetailTe >
 // <app-data-preview [previewData]="previewData"></app-data-preview>
 // </ng-template>
 //  2. 方法
 // (click)="openPreData(PreDetailTe , 参数)"
 //  3.
 // this.previewData = '';
 // this.previewData = data.replace(/,/g, '\n\n');
 // if (!this.dialog.getDialogById('PreDetailTeClass')) {
 //            this.dialog.open(PreDetailTe, {id: 'PreDetailTeClass', width: '600px', height: '550px', hasBackdrop: true});
 //        }
