import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material';
import {ImageShowComponent} from './image-show.component';

@Injectable()
export class ImageShowService {

    constructor(
        private dialog: MatDialog
    ) {
    }

    /**
     *
     * @param data
     * @param styleWidth
     */
    openImageShow(data: { title?: string, images: any | any[], cancelButton?: boolean } | any, styleWidth?): MatDialogRef<ImageShowComponent, any> {
        if (data && !Array.isArray(data.images)) {
            data.images = [data.images];
        }
        return this.dialog.open(ImageShowComponent, {
            id: 'imageShow',
            width: styleWidth ? styleWidth : '50%',
            data: data
        });
    }
}
