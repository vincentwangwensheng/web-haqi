import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletGameComponent } from './applet-game.component';

describe('AppletGameComponent', () => {
  let component: AppletGameComponent;
  let fixture: ComponentFixture<AppletGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppletGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppletGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
