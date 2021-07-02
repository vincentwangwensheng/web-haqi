import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppletMaskAddDetailComponent} from './applet-mask-add-detail.component';
import {RouterModule} from '@angular/router';
import {
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressBarModule,
    MatRippleModule,
    MatProgressSpinnerModule
} from '@angular/material';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {TranslateModule} from '@ngx-translate/core';
import {RootModule} from '../../../../root.module';
import {MarketingManageExportModule} from '../../marketing-manage/marketing-manage-export.module';
import {NewDateTransformPipe} from '../../../../pipes/date-new-date-transform/new-date-transform.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {UploadImgModule} from '../../../../components/upload-img/upload-img.module';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';



@NgModule({
  declarations: [AppletMaskAddDetailComponent],
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
        RouterModule.forChild([{path: '', component: AppletMaskAddDetailComponent}]),
        AutoSelectModule
    ],
    providers: [
        NewDateTransformPipe
    ]
})
export class AppletMaskAddDetailModule { }
