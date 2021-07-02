import { TestBed } from '@angular/core/testing';

import { AppletMaskServiceService } from './applet-mask-service.service';

describe('AppletMaskServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppletMaskServiceService = TestBed.get(AppletMaskServiceService);
    expect(service).toBeTruthy();
  });
});
