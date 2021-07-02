import { TestBed } from '@angular/core/testing';

import { AccountManageService } from './account-manage.service';

describe('AccountManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccountManageService = TestBed.get(AccountManageService);
    expect(service).toBeTruthy();
  });
});
