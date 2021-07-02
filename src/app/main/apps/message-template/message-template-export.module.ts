import {NgModule} from '@angular/core';
import {RootModule} from '../../../root.module';
import {TableListModule} from '../../../components/table-list/table-list.module';
import {MessageTemplateComponent} from './message-template.component';


@NgModule({
    declarations: [MessageTemplateComponent],
    imports: [
        RootModule,
        TableListModule
    ],
    exports: [MessageTemplateComponent]
})
export class MessageTemplateExportModule {
}
