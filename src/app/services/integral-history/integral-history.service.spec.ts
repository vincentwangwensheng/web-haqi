import { TestBed } from '@angular/core/testing';

import { IntegralHistoryService } from './integral-history.service';

describe('IntegralHistoryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntegralHistoryService = TestBed.get(IntegralHistoryService);
    expect(service).toBeTruthy();
  });
});
