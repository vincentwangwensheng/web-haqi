import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegralRuleComponent } from './integral-rule.component';

describe('IntegralRuleComponent', () => {
  let component: IntegralRuleComponent;
  let fixture: ComponentFixture<IntegralRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegralRuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegralRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
