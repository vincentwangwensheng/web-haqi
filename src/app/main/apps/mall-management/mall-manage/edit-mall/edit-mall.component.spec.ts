import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMallComponent } from './edit-mall.component';

describe('EditMallComponent', () => {
  let component: EditMallComponent;
  let fixture: ComponentFixture<EditMallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
