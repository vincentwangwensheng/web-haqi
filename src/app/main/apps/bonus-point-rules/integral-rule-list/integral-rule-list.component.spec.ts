import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegralRuleListComponent } from './integral-rule-list.component';

describe('IntegralRuleListComponent', () => {
  let component: IntegralRuleListComponent;
  let fixture: ComponentFixture<IntegralRuleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegralRuleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegralRuleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
