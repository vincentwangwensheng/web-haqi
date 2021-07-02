import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AddRuleComponent} from './add-rule.component';
import {RouterModule} from '@angular/router';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
    declarations: [AddRuleComponent],
    imports: [
        CommonModule,
        RootModule,
        TableListModule,
        DragDropModule,
        RouterModule.forChild([{path: '', component: AddRuleComponent}])
    ]
})
export class AddRuleModule {
}
