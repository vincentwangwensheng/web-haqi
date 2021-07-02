import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletMaskComponent } from './applet-mask.component';

describe('AppletMaskComponent', () => {
  let component: AppletMaskComponent;
  let fixture: ComponentFixture<AppletMaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletMaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletMaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
