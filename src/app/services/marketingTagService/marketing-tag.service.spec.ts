import { TestBed } from '@angular/core/testing';

import { MarketingTagService } from './marketing-tag.service';

describe('MarketingTagService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MarketingTagService = TestBed.get(MarketingTagService);
    expect(service).toBeTruthy();
  });
});
