import {NgModule} from '@angular/core';
import {MarketStrategyComponent} from './market-strategy.component';
import {RootModule} from '../../../root.module';
import {RouterModule} from '@angular/router';
import {TableListModule} from '../../../components/table-list/table-list.module';


@NgModule({
    declarations: [MarketStrategyComponent],
    imports: [
        RootModule,
        TableListModule,
        RouterModule.forChild([{path: '', component: MarketStrategyComponent}])
    ]
})
export class MarketStrategyModule {
}
