import { TestBed } from '@angular/core/testing';

import { CouponListService } from './coupon-list.service';

describe('CouponListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CouponListService = TestBed.get(CouponListService);
    expect(service).toBeTruthy();
  });
});
