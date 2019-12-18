import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSitePage } from './edit-site.page';

describe('EditSitePage', () => {
  let component: EditSitePage;
  let fixture: ComponentFixture<EditSitePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSitePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSitePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
