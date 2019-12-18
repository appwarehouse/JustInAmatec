import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDetailPage } from './result-detail.page';

describe('ResultDetailPage', () => {
  let component: ResultDetailPage;
  let fixture: ComponentFixture<ResultDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
