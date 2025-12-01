import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeHistoryBadge } from './type-history-badge';

describe('TypeHistoryBadge', () => {
  let component: TypeHistoryBadge;
  let fixture: ComponentFixture<TypeHistoryBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeHistoryBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeHistoryBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
