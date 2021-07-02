import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletMaskCopyComponent } from './applet-mask-copy.component';

describe('AppletMaskCopyComponent', () => {
  let component: AppletMaskCopyComponent;
  let fixture: ComponentFixture<AppletMaskCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletMaskCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletMaskCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
