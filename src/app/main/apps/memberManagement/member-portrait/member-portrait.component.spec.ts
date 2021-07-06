import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberPortraitComponent } from './member-portrait.component';

describe('MemberPortraitComponent', () => {
  let component: MemberPortraitComponent;
  let fixture: ComponentFixture<MemberPortraitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberPortraitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberPortraitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
