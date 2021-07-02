import { TestBed } from '@angular/core/testing';

import { EditStoreService } from './edit-store.service';

describe('EditStoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EditStoreService = TestBed.get(EditStoreService);
    expect(service).toBeTruthy();
  });
});
