import { TestBed } from '@angular/core/testing';

import { MapAnalysisService } from './map-analysis.service';

describe('MapAnalysisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapAnalysisService = TestBed.get(MapAnalysisService);
    expect(service).toBeTruthy();
  });
});
