import { TestBed } from '@angular/core/testing';

import { IntegralRuleListService } from './integral-rule-list.service';

describe('IntegralRuleListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntegralRuleListService = TestBed.get(IntegralRuleListService);
    expect(service).toBeTruthy();
  });
});
