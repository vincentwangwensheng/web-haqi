import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletCarouselListComponent } from './applet-carousel-list.component';

describe('AppletCarouselListComponent', () => {
  let component: AppletCarouselListComponent;
  let fixture: ComponentFixture<AppletCarouselListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletCarouselListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletCarouselListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
