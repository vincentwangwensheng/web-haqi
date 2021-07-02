import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule, MatIconModule } from '@angular/material';

import { FuseSearchBarComponent } from './search-bar.component';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [
        FuseSearchBarComponent
    ],
    imports     : [
        CommonModule,
        RouterModule,

        MatButtonModule,
        MatIconModule,
        TranslateModule
    ],
    exports     : [
        FuseSearchBarComponent
    ]
})
export class FuseSearchBarModule
{
}
