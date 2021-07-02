import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandManageComponent } from './brand-manage.component';

describe('BrandManageComponent', () => {
  let component: BrandManageComponent;
  let fixture: ComponentFixture<BrandManageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandManageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
