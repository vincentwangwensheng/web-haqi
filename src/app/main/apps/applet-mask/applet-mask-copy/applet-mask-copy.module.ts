import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppletMaskCopyComponent} from './applet-mask-copy.component';
import {MarketingManageExportModule} from '../../marketing-manage/marketing-manage-export.module';
import {
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule
} from '@angular/material';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {UploadImgModule} from '../../../../components/upload-img/upload-img.module';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';



@NgModule({
  declarations: [AppletMaskCopyComponent],
    imports: [
        CommonModule,
        RootModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        TranslateModule,
        MaterialDatePickerModule,
        MarketingManageExportModule,
        MatProgressBarModule,
        MatRadioModule,
        MatDialogModule,
        TranslateModule,
        MatRippleModule,
        DragDropModule,
        UploadImgModule,
        MatProgressSpinnerModule,
        RouterModule.forChild([{path: '', component: AppletMaskCopyComponent}]),
        AutoSelectModule
    ],
    providers: [
        NewDateTransformPipe
    ]
})
export class AppletMaskCopyModule { }
