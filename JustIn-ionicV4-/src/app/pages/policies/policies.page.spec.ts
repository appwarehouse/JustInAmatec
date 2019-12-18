import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesPage } from './policies.page';

describe('PoliciesPage', () => {
  let component: PoliciesPage;
  let fixture: ComponentFixture<PoliciesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PoliciesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliciesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
