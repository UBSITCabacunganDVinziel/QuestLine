import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestForm } from './quest-form';

describe('QuestForm', () => {
  let component: QuestForm;
  let fixture: ComponentFixture<QuestForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestForm],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
