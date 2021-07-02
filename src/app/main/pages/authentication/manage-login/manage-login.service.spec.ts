import { TestBed } from '@angular/core/testing';

import { ManageLoginService } from './manage-login.service';

describe('ManageLoginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageLoginService = TestBed.get(ManageLoginService);
    expect(service).toBeTruthy();
  });
});
