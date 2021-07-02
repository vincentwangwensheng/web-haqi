import { TestBed } from '@angular/core/testing';

import { OpenCenterService } from './open-center.service';

describe('OpenCenterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenCenterService = TestBed.get(OpenCenterService);
    expect(service).toBeTruthy();
  });
});
