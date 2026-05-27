import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPlans } from './user-plans';

describe('UserPlans', () => {
  let component: UserPlans;
  let fixture: ComponentFixture<UserPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPlans],
    }).compileComponents();

    fixture = TestBed.createComponent(UserPlans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
