import {NgModule} from '@angular/core';
import {TerminalManageComponent} from './terminal-manage.component';
import {RootModule} from '../../../../root.module';
import {TableListModule} from '../../../../components/table-list/table-list.module';
import {RouterModule} from '@angular/router';
import {AutoSelectModule} from '../../../../components/auto-select/auto-select.module';
import {A11yModule} from '@angular/cdk/a11y';


@NgModule({
    declarations: [
        TerminalManageComponent
    ],
    imports: [
        RootModule,
        AutoSelectModule,
        A11yModule,
        TableListModule,
        RouterModule.forChild([{path: '', component: TerminalManageComponent}])
    ]
})
export class TerminalManageModule {
}
