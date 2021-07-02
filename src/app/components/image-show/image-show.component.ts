import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-image-show',
    templateUrl: './image-show.component.html',
    styleUrls: ['./image-show.component.scss']
})
export class ImageShowComponent implements OnInit {
    title: string;
    images: any[];
    cancelButton = true;
    index = 0;

    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        this.title = this.data.title ? this.data.title : '';
        this.images = this.data.images ? this.data.images.filter(image => image) : null;
        this.cancelButton = this.data.cancelButton ? this.data.cancelButton : false;
        this.index = this.data.index ? this.data.index : 0;
    }

    ngOnInit() {
    }

    /**
     *
     * @param flag 向左向右
     */
    forwardOrBack(flag) {
        this.index = flag ? (this.index + 1 <= this.images.length - 1 ? this.index + 1 : 0) : (this.index - 1 >= 0 ? this.index - 1 : this.images.length - 1);
    }

}
