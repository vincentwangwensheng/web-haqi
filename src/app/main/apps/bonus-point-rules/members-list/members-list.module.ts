import { NgModule } from '@angular/core';
import {MembersListComponent} from './members-list.component';
import {RouterModule} from '@angular/router';
import {MembersListExportModule} from './members-list.export.module';


@NgModule({
    imports: [
        MembersListExportModule,
        RouterModule.forChild([{path: '', component: MembersListComponent}])
    ]
})
export class MembersListModule {
}
