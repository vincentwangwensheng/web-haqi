import { TestBed } from '@angular/core/testing';

import { BusinessForecastService } from './business-forecast.service';

describe('BusinessForecastService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BusinessForecastService = TestBed.get(BusinessForecastService);
    expect(service).toBeTruthy();
  });
});
