import { TestBed } from '@angular/core/testing';

import { MarketingManagementServiceService } from './marketing-management-service.service';

describe('MarketingManagementServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MarketingManagementServiceService = TestBed.get(MarketingManagementServiceService);
    expect(service).toBeTruthy();
  });
});
