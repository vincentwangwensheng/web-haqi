import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketingManageEditComponent } from './marketing-manage-edit.component';

describe('MarketingManageEditComponent', () => {
  let component: MarketingManageEditComponent;
  let fixture: ComponentFixture<MarketingManageEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketingManageEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarketingManageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
