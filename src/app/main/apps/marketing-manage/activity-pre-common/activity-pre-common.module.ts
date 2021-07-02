import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivityPreCommonComponent} from './activity-pre-common.component';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatRippleModule,
    MatSelectModule
} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {MemberExportCardModule} from '../../member-card/member-export-card.module';
import {MaterialDatePickerModule} from '../../../../components/material-date-picker/material-date-picker.module';
import {QuillModule} from 'ngx-quill';
import {RootModule} from '../../../../root.module';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
    declarations: [ActivityPreCommonComponent],
    exports: [ActivityPreCommonComponent],
    imports: [
        CommonModule,
        RootModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        TranslateModule,
        QuillModule,
        MatRippleModule,
        MaterialDatePickerModule,
        MemberExportCardModule,
        DragDropModule,
    ]
})
export class ActivityPreCommonModule {
}
