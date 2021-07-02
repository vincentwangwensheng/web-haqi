import { TestBed } from '@angular/core/testing';

import { ECouponServiceService } from './ecoupon-service.service';

describe('ECouponServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ECouponServiceService = TestBed.get(ECouponServiceService);
    expect(service).toBeTruthy();
  });
});
