import { TestBed } from '@angular/core/testing';

import { ActivityAnalysisService } from './activity-analysis.service';

describe('ActivityAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActivityAnalysisService = TestBed.get(ActivityAnalysisService);
    expect(service).toBeTruthy();
  });
});
