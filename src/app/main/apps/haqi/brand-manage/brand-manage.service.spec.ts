import { TestBed } from '@angular/core/testing';

import { BrandManageService } from './brand-manage.service';

describe('BrandManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BrandManageService = TestBed.get(BrandManageService);
    expect(service).toBeTruthy();
  });
});
