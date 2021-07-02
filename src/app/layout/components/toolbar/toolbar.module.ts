import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule
} from '@angular/material';

import {FuseSearchBarModule, FuseShortcutsModule} from '@fuse/components';
import {SharedModule} from '@fuse/shared.module';

import {ToolbarComponent} from 'app/layout/components/toolbar/toolbar.component';
import {TranslateModule} from '@ngx-translate/core';
import {ChangePasswordModule} from '../../../components/change-password/change-password.module';
import {ChangePasswordComponent} from '../../../components/change-password/change-password.component';
import {InjectConfirmDialogModule} from '../../../components/inject-confirm-dialog/inject-confirm-dialog.module';
import {ConfirmDialogModule} from '../../../components/confirm-dialog/confirm-dialog.module';

@NgModule({
    declarations: [
        ToolbarComponent
    ],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        ChangePasswordModule,
        ConfirmDialogModule,
        SharedModule,
        FuseSearchBarModule,
        InjectConfirmDialogModule,
        FuseShortcutsModule,

        TranslateModule
    ],
    exports: [
        ToolbarComponent
    ],
    entryComponents: [
        ChangePasswordComponent
    ]
})
export class ToolbarModule {
}
