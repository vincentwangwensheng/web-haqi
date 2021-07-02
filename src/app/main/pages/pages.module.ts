import {NgModule} from '@angular/core';
import {BigBusinessDataModule} from './big-business-data/big-business-data.module';
import {BigDataBusinessTwoModule} from './big-data-business-two/big-data-business-two.module';
import {BigBusinessCopyModule} from './big-business-data2/big-business-copy.module';
import {HomePageModule} from './authentication/home-page/home-page.module';
import {OpenLoginModule} from './authentication/open-login/open-login.module';
import {ManageLoginModule} from './authentication/manage-login/manage-login.module';

@NgModule({
    imports: [ // Authentication
        BigBusinessDataModule,
        BigDataBusinessTwoModule,
        BigBusinessCopyModule,
        HomePageModule,
        OpenLoginModule,
        ManageLoginModule,
    ],
})
export class PagesModule {
}
