import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondTypeComponent } from './second-type.component';

describe('SecondTypeComponent', () => {
  let component: SecondTypeComponent;
  let fixture: ComponentFixture<SecondTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
