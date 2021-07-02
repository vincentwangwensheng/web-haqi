import { TestBed } from '@angular/core/testing';

import { AppletCarouselService } from './applet-carousel.service';

describe('AppletCarouselService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppletCarouselService = TestBed.get(AppletCarouselService);
    expect(service).toBeTruthy();
  });
});
