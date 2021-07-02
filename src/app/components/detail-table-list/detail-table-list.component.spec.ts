import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailTableListComponent } from './detail-table-list.component';

describe('DetailTableListComponent', () => {
  let component: DetailTableListComponent;
  let fixture: ComponentFixture<DetailTableListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailTableListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailTableListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
