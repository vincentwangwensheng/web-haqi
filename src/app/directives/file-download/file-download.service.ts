import {Injectable} from '@angular/core';

@Injectable()
export class FileDownloadService {

    constructor() {
    }
    /**
     * ba64转化为blob
     * @param base64String
     */
    dataURLtoBlob(base64String) {
        const arr = base64String.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type: mime});
    }

    /**
     * base64图片下载
     * @param base64String
     * @param fileName
     */
    base64Download(base64String, fileName) {
        this.blobDownload(this.dataURLtoBlob(base64String), fileName);
    }

    /**
     * url资源图片下载，需要可跨域
     * @param imageUrl
     * @param fileName
     */
    urlImageDownload(imageUrl, fileName) {
        // url 对象下载
        const image: HTMLImageElement = document.createElement('img');
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = imageUrl;
        image.onload = () => {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            context.drawImage(image, 0, 0);
            canvas.toBlob(blob => {
                this.blobDownload(blob, fileName);
                image.remove();
                canvas.remove();
            });
        };
    }

    /**
     * blob/file 类型下载
     * @param blob
     * @param download
     */
    blobDownload(blob, download?) {
        // blob 对象下载
        const url = URL.createObjectURL(blob);
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
        console.log(blob);
        link.click();
        URL.revokeObjectURL(url); // 手动释放url对象
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

    // base64转blob格式
    b64toBlob(b64Data, contentType?, sliceSize?) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
}
