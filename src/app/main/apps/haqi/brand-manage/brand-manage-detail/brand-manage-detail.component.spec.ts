import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandManageDetailComponent } from './brand-manage-detail.component';

describe('BrandManageDetailComponent', () => {
  let component: BrandManageDetailComponent;
  let fixture: ComponentFixture<BrandManageDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrandManageDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandManageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
