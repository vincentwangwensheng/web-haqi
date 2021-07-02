import {NgModule} from '@angular/core';
import {AppletGameComponent} from './applet-game.component';
import {RouterModule} from '@angular/router';
import {NewTableListModule} from '../../../components/super-table-list/new-table-list.module';
import {AppletGameService} from './applet-game.service';


@NgModule({
    declarations: [AppletGameComponent],
    imports: [
        RouterModule.forChild([{path: '', component: AppletGameComponent}]),
        NewTableListModule.forChild(AppletGameService)
    ]
})
export class AppletGameModule {
}
