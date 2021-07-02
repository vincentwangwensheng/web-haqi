import { TestBed } from '@angular/core/testing';

import { AdvertisingScreenService } from './advertising-screen.service';

describe('AdvertisingScreenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdvertisingScreenService = TestBed.get(AdvertisingScreenService);
    expect(service).toBeTruthy();
  });
});
