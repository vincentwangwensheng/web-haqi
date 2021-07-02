import {NgModule} from '@angular/core';
import {ChangePasswordComponent} from './change-password.component';
import {RootModule} from '../../root.module';
import {DialogModule} from '../dialog/dialog.module';


@NgModule({
    declarations: [
        ChangePasswordComponent
    ],
    imports: [RootModule,
        DialogModule],
    exports: [ChangePasswordComponent]
})
export class ChangePasswordModule {
}
