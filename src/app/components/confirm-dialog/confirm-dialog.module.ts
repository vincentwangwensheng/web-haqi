import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {ConfirmDialogComponent} from './confirm-dialog.component';
import {MatButtonModule, MatDialogModule, MatIconModule} from '@angular/material';
import {SharedModule} from '../../../@fuse/shared.module';

@NgModule({
    declarations: [ConfirmDialogComponent],
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        SharedModule,
        TranslateModule
    ],
    exports: [ConfirmDialogComponent],
    entryComponents: [ConfirmDialogComponent]
})
export class ConfirmDialogModule {
}
