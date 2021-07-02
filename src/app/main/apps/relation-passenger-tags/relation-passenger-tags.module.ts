import {NgModule} from '@angular/core';
import {RelationPassengerTagsComponent} from './relation-passenger-tags.component';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {MessageTemplateExportModule} from '../message-template/message-template-export.module';
import {RelationPassengerTagsExportModule} from './relation-passenger-tags-export.module';


@NgModule({
    imports: [
        RouterModule.forChild([{path: '', component: RelationPassengerTagsComponent}]),
        RelationPassengerTagsExportModule,
        TableListModule
    ]
})
export class RelationPassengerTagsModule {
}
