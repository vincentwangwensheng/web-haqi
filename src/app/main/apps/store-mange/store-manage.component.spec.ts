import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreManageComponent } from './store-manage.component';

describe('StoreManageComponent', () => {
  let component: StoreManageComponent;
  let fixture: ComponentFixture<StoreManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoreManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoreManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
