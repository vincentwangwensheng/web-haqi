import { TestBed } from '@angular/core/testing';

import { StoreManageService } from './store.manage.service';

describe('StoreManageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StoreManageService = TestBed.get(StoreManageService);
    expect(service).toBeTruthy();
  });
});
