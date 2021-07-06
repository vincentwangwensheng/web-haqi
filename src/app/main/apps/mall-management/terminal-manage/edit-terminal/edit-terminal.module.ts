import {NgModule} from '@angular/core';
import {EditTerminalComponent} from './edit-terminal.component';
import {RootModule} from '../../../../../root.module';
import {RouterModule} from '@angular/router';
import {AutoSelectModule} from '../../../../../components/auto-select/auto-select.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ConfirmDialogModule} from '../../../../../components/confirm-dialog/confirm-dialog.module';
import {MatProgressSpinnerModule, MatSlideToggleModule} from '@angular/material';


@NgModule({
    declarations: [
        EditTerminalComponent
    ],
    imports: [
        RootModule,
        DragDropModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        ConfirmDialogModule,
        AutoSelectModule,
        RouterModule.forChild([{path: '**', component: EditTerminalComponent}])
    ]
})
export class EditTerminalModule {
}
