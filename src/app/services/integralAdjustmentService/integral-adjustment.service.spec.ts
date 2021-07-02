import { TestBed } from '@angular/core/testing';

import { IntegralAdjustmentService } from './integral-adjustment.service';

describe('IntegralAdjustmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntegralAdjustmentService = TestBed.get(IntegralAdjustmentService);
    expect(service).toBeTruthy();
  });
});
