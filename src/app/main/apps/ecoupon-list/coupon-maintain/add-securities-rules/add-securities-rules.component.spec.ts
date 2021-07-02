import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSecuritiesRulesComponent } from './add-securities-rules.component';

describe('AddSecuritiesRulesComponent', () => {
  let component: AddSecuritiesRulesComponent;
  let fixture: ComponentFixture<AddSecuritiesRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSecuritiesRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSecuritiesRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
