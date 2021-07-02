import {NgModule} from '@angular/core';
import {EditRoleComponent} from './edit-role.component';
import {RootModule} from '../../../../root.module';
import {RouterModule} from '@angular/router';
import {MatCheckboxModule} from '@angular/material';


@NgModule({
    declarations: [
        EditRoleComponent
    ],
    imports: [
        RootModule,
        MatCheckboxModule,
        RouterModule.forChild([{path: '**', component: EditRoleComponent}])
    ]
})
export class EditRoleModule {
}
