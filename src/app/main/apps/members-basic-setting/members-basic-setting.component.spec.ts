import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersBasicSettingComponent } from './members-basic-setting.component';

describe('MembersBasicSettingComponent', () => {
  let component: MembersBasicSettingComponent;
  let fixture: ComponentFixture<MembersBasicSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MembersBasicSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MembersBasicSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
