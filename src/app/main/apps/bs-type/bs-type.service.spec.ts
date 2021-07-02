import { TestBed } from '@angular/core/testing';

import { BsTypeService } from './bs-type.service';

describe('BsTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BsTypeService = TestBed.get(BsTypeService);
    expect(service).toBeTruthy();
  });
});
