import { TestBed } from '@angular/core/testing';

import { SecondTypeService } from './second-type.service';

describe('SecondTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SecondTypeService = TestBed.get(SecondTypeService);
    expect(service).toBeTruthy();
  });
});
