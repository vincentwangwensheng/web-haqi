import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UploadImgComponent} from './upload-img.component';
import {
    MatButtonModule, MatDialogModule, MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {QUILL_CONFIG_TOKEN} from 'ngx-quill';
import {SharedModule} from '../../../@fuse/shared.module';
import {FuseSidebarModule} from '../../../@fuse/components';
import {NewDateTransformPipe} from '../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [UploadImgComponent],
  imports: [
      SharedModule,
      FuseSidebarModule,
      CommonModule,
      MatDialogModule,
      MatSnackBarModule,
      MatProgressBarModule,
      MatIconModule,
      MatButtonModule,
      TranslateModule,
      DragDropModule,
  ],
    exports: [UploadImgComponent],
    providers: [NewDateTransformPipe,
        {
            provide: QUILL_CONFIG_TOKEN,
            useValue: { LogLevel: 'Error' },
        }
    ]
})
export class UploadImgModule { }
