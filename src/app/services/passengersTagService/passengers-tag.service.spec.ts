import { TestBed } from '@angular/core/testing';

import { PassengersTagService } from './passengers-tag.service';

describe('PassengersTagService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PassengersTagService = TestBed.get(PassengersTagService);
    expect(service).toBeTruthy();
  });
});
