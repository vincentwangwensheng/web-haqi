import { TestBed } from '@angular/core/testing';

import { PortraitServiceService } from './portrait-service.service';

describe('PortraitServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PortraitServiceService = TestBed.get(PortraitServiceService);
    expect(service).toBeTruthy();
  });
});
