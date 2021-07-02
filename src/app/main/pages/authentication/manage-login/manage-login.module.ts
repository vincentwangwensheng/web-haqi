import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../../../../../@fuse/shared.module';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule} from '@angular/material';
import {CustomPipesModule} from '../../../../pipes/customPipes.module';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';
import {ManageLoginComponent} from './manage-login.component';
import {InjectConfirmDialogModule} from '../../../../components/inject-confirm-dialog/inject-confirm-dialog.module';
import {ConfirmDialogModule} from '../../../../components/confirm-dialog/confirm-dialog.module';


const routes = [
    {
        path: 'manageLogin',
        component: ManageLoginComponent
    }
];


@NgModule({
    declarations: [ManageLoginComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        SharedModule,
        TranslateModule,
        CustomPipesModule,
        InjectConfirmDialogModule,
        ConfirmDialogModule
    ]
})
export class ManageLoginModule {
}
