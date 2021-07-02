import { NgModule } from '@angular/core';
import {MembersListComponent} from './members-list.component';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {CommonModule} from '@angular/common';
import {RootModule} from '../../../../root.module';
import {MemberTemplateModule} from '../member-template/member-template.module';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
    declarations: [MembersListComponent],
    exports: [MembersListComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        MemberTemplateModule,
        DragDropModule,
    ]
})
export class MembersListExportModule {
}
