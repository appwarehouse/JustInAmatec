import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSchedulePage } from './edit-schedule.page';

describe('EditSchedulePage', () => {
  let component: EditSchedulePage;
  let fixture: ComponentFixture<EditSchedulePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSchedulePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSchedulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
