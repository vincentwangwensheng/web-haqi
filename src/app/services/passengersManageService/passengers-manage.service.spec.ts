import { TestBed } from '@angular/core/testing';

import { PassengersManageService } from './passengers-manage.service';

describe('PassengersManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PassengersManageService = TestBed.get(PassengersManageService);
    expect(service).toBeTruthy();
  });
});
