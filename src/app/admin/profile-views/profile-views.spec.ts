import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileViews } from './profile-views';

describe('ProfileViews', () => {
  let component: ProfileViews;
  let fixture: ComponentFixture<ProfileViews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileViews],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileViews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
