import { TestBed } from '@angular/core/testing';

import { AppletGameService } from './applet-game.service';

describe('AppletGameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppletGameService = TestBed.get(AppletGameService);
    expect(service).toBeTruthy();
  });
});
