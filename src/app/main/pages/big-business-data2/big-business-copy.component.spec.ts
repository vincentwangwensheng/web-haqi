import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BigBusinessCopyComponent } from './big-business-copy.component';

describe('BigBusinessCopyComponent', () => {
  let component: BigBusinessCopyComponent;
  let fixture: ComponentFixture<BigBusinessCopyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BigBusinessCopyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BigBusinessCopyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
