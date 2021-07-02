import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsumeBonusPointRuleComponent } from './add-consume-bonus-point-rule.component';

describe('AddConsumeBonusPointRuleComponent', () => {
  let component: AddConsumeBonusPointRuleComponent;
  let fixture: ComponentFixture<AddConsumeBonusPointRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddConsumeBonusPointRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddConsumeBonusPointRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
