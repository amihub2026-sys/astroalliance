import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LikesHistory } from './likes-history';

describe('LikesHistory', () => {
  let component: LikesHistory;
  let fixture: ComponentFixture<LikesHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikesHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(LikesHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
