import {NgModule} from '@angular/core';
import {AddClassToElementDirective} from './add-class-to-element/add-class-to-element.directive';
import {FileDownloadDirective} from './file-download/file-download.directive';
import {FileDownloadService} from './file-download/file-download.service';
import {FileUploadDirective} from './file-upload/file-upload.directive';
import {FileUploadService} from './file-upload/file-upload.service';


@NgModule({
    declarations: [
        AddClassToElementDirective,
        FileDownloadDirective,
        FileUploadDirective
    ],
    imports: [],
    providers: [FileDownloadService, FileUploadService],
    exports: [AddClassToElementDirective, FileDownloadDirective, FileUploadDirective]
})
export class DirectivesModule {
}
