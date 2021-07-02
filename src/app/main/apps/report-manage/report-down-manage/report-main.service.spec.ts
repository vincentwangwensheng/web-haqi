import { TestBed } from '@angular/core/testing';

import { ReportMainService } from './report-main.service';

describe('ReportMainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReportMainService = TestBed.get(ReportMainService);
    expect(service).toBeTruthy();
  });
});
