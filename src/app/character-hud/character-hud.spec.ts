import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CharacterHud } from './character-hud';

describe('CharacterHud', () => {
  let component: CharacterHud;
  let fixture: ComponentFixture<CharacterHud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterHud],
    }).compileComponents();

    fixture = TestBed.createComponent(CharacterHud);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
