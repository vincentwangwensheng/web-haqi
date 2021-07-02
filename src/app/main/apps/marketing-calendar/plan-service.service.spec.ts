import { TestBed } from '@angular/core/testing';

import { PlanServiceService } from './plan-service.service';

describe('PlanServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlanServiceService = TestBed.get(PlanServiceService);
    expect(service).toBeTruthy();
  });
});
