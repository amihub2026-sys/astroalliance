import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBiodata } from './my-biodata';

describe('MyBiodata', () => {
  let component: MyBiodata;
  let fixture: ComponentFixture<MyBiodata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBiodata],
    }).compileComponents();

    fixture = TestBed.createComponent(MyBiodata);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
