import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BigDataBusinessTwoComponent } from './big-data-business-two.component';

describe('BigDataBusinessTwoComponent', () => {
  let component: BigDataBusinessTwoComponent;
  let fixture: ComponentFixture<BigDataBusinessTwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BigDataBusinessTwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BigDataBusinessTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
