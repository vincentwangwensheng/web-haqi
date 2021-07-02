import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletCarouselDetailComponent } from './applet-carousel-detail.component';

describe('AppletCarouselDetailComponent', () => {
  let component: AppletCarouselDetailComponent;
  let fixture: ComponentFixture<AppletCarouselDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletCarouselDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletCarouselDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
