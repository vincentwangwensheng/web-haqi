import {NgModule} from '@angular/core';
import {MessageTemplateComponent} from './message-template.component';
import {MessageTemplateExportModule} from './message-template-export.module';
import {RouterModule} from '@angular/router';

@NgModule({
    imports: [
        MessageTemplateExportModule,
        RouterModule.forChild([{path: '', component: MessageTemplateComponent}])
    ]
})
export class MessageTemplateModule {
}
