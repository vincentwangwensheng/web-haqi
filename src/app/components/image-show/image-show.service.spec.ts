import { TestBed } from '@angular/core/testing';

import { ImageShowService } from './image-show.service';

describe('ImageShowService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImageShowService = TestBed.get(ImageShowService);
    expect(service).toBeTruthy();
  });
});
