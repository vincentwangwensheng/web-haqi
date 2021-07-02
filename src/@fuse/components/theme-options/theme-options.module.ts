import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
    MatButtonModule,
    MatCheckboxModule, MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatOptionModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule
} from '@angular/material';

import { FuseDirectivesModule } from '@fuse/directives/directives';
import { FuseMaterialColorPickerModule } from '@fuse/components/material-color-picker/material-color-picker.module';
import { FuseSidebarModule } from '@fuse/components/sidebar/sidebar.module';

import { ThemeOptionsComponent } from '@fuse/components/theme-options/theme-options.component';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogModule} from '../../../app/components/confirm-dialog/confirm-dialog.module';

@NgModule({
    declarations: [
        ThemeOptionsComponent
    ],
    imports     : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        MatButtonModule,
        MatCheckboxModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatTooltipModule,
        MatOptionModule,
        MatRadioModule,
        MatSelectModule,
        MatSlideToggleModule,

        FuseDirectivesModule,
        FuseMaterialColorPickerModule,
        FuseSidebarModule,

        TranslateModule,

        ConfirmDialogModule,
    ],
    exports     : [
        ThemeOptionsComponent
    ]
})
export class FuseThemeOptionsModule
{
}
