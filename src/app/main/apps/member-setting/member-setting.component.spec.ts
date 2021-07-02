import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberSettingComponent } from './member-setting.component';

describe('MemberSettingComponent', () => {
  let component: MemberSettingComponent;
  let fixture: ComponentFixture<MemberSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
