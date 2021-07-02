import {Directive, ElementRef, HostListener, Input, Renderer2} from '@angular/core';
import {ImageShowService} from './image-show.service';

@Directive({
    selector: '[appImageShow]'
})
export class ImageShowDirective{
    @Input('appImageShow')
    data: { title?: string, images: any | any[], cancelButton?: boolean, styleWidth?: string, index?: number };

    @Input()
    styleWidth: string;

    constructor(private element?: ElementRef<any>,
                private renderer?: Renderer2,
                private imageShowService?: ImageShowService
    ) {
        this.renderer.setStyle(this.element.nativeElement, 'cursor', 'pointer');
        this.renderer.addClass(this.element.nativeElement, 'dark-box-shadow-hover');
    }

    @HostListener('click')
    onClick() {
        this.imageShowService.openImageShow(this.data, this.styleWidth);
    }

}
