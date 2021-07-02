import { TestBed } from '@angular/core/testing';

import { IntegralRuleService } from './integral-rule.service';

describe('IntegralRuleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IntegralRuleService = TestBed.get(IntegralRuleService);
    expect(service).toBeTruthy();
  });
});
