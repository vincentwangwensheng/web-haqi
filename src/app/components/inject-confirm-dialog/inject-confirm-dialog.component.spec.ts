import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InjectConfirmDialogComponent } from './inject-confirm-dialog.component';

describe('InjectConfirmDialogComponent', () => {
  let component: InjectConfirmDialogComponent;
  let fixture: ComponentFixture<InjectConfirmDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InjectConfirmDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InjectConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
