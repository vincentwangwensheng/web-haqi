import {NgModule} from '@angular/core';
import {MatButtonModule, MatDialogModule, MatIconModule} from '@angular/material';
import {SharedModule} from '../../../@fuse/shared.module';
import {TranslateModule} from '@ngx-translate/core';
import {InjectConfirmDialogComponent} from './inject-confirm-dialog.component';


@NgModule({
    declarations: [InjectConfirmDialogComponent],
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        SharedModule,
        TranslateModule
    ],
    entryComponents: [InjectConfirmDialogComponent]
})
export class InjectConfirmDialogModule {
}
