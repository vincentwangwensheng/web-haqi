import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInteractsBonusPointRuleComponent } from './add-interacts-bonus-point-rule.component';

describe('AddInteractsBonusPointRuleComponent', () => {
  let component: AddInteractsBonusPointRuleComponent;
  let fixture: ComponentFixture<AddInteractsBonusPointRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddInteractsBonusPointRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInteractsBonusPointRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
