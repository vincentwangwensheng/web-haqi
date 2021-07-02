import {Injectable} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Injectable({
    providedIn: 'root'
})
export class FileDownloadService {

    constructor(
        private sanitizer: DomSanitizer
    ) {
    }

    // blob 下载
    blobDownload(blob, download?) {
        // blob 对象下载
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', '_self');
        if (download) {
            link.setAttribute('downLoad', download);
        } else if (blob.name) {
            link.setAttribute('downLoad', blob.name);
        } else {
            console.error('A name is needed in the file!');
            return;
        }
        link.click();
        window.URL.revokeObjectURL(url); // 手动释放url对象
        link.remove();

        // sanitizer下载 需要angular模版绑定
        // const encodedData = encodeURIComponent(blob);
        // if (encodedData) {
        //     const href = this.sanitizer.bypassSecurityTrustResourceUrl('data:' + blob.type + ';charset=UTF-8,' + encodedData);
        //     const a = document.createElement('a');
        //     a.hidden = true;
        //     a.setAttribute('href', href as any);
        //     a.setAttribute('download', download);
        //     a.click();
        // }
    }
}
