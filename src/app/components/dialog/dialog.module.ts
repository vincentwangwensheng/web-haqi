import {NgModule} from '@angular/core';
import {DialogComponent} from './dialog.component';
import {RootModule} from '../../root.module';


@NgModule({
    declarations: [DialogComponent],
    imports: [
        RootModule
    ],
    exports: [DialogComponent]
})
export class DialogModule {
}
