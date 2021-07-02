import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';
import {FileDownloadService} from './file-download.service';

@Directive({
    selector: '[appFileDownload]'
})
export class FileDownloadDirective {
    @Input('appFileDownload')
    download: { file: Blob | string, fileName: string };

    @Input()
    boxShadow = true;

    @Input()
    disabled = false;

    constructor(
        private fileDownload?: FileDownloadService,
        private element?: ElementRef<any>,
        private renderer?: Renderer2) {
        this.renderer.setStyle(this.element.nativeElement, 'cursor', 'pointer');
        if (this.boxShadow) {
            this.renderer.addClass(this.element.nativeElement, 'dark-box-shadow-hover');
        }
    }

    @HostListener('click')
    onClick() {
        if (!this.disabled) {
            // base64 或者 url形式的图片
            if (!this.download.file['size']) {
                if ((this.download.file as string).includes('base64')) {
                    this.fileDownload.base64Download(this.download.file, this.download.fileName);
                } else {
                    this.fileDownload.urlImageDownload(this.download.file, this.download.fileName);
                }
                // blob对象
            } else {
                this.fileDownload.blobDownload(this.download.file, this.download.fileName);
            }
        }
    }


}
