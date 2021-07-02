import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletMaskAddDetailComponent } from './applet-mask-add-detail.component';

describe('AppletMaskAddDetailComponent', () => {
  let component: AppletMaskAddDetailComponent;
  let fixture: ComponentFixture<AppletMaskAddDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletMaskAddDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletMaskAddDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
