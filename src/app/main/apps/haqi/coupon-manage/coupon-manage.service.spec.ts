import { TestBed } from '@angular/core/testing';

import { CouponManageService } from './coupon-manage.service';

describe('CouponManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CouponManageService = TestBed.get(CouponManageService);
    expect(service).toBeTruthy();
  });
});
