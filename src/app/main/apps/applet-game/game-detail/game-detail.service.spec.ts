import { TestBed } from '@angular/core/testing';

import { GameDetailService } from './game-detail.service';

describe('GameDetailService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GameDetailService = TestBed.get(GameDetailService);
    expect(service).toBeTruthy();
  });
});
