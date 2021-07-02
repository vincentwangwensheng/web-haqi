import { TestBed } from '@angular/core/testing';

import { MarketingManageService } from './marketing-manage.service';

describe('MarketingManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MarketingManageService = TestBed.get(MarketingManageService);
    expect(service).toBeTruthy();
  });
});
