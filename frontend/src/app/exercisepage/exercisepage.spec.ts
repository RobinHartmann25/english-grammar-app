import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exercisepage } from './exercisepage';

describe('Exercisepage', () => {
  let component: Exercisepage;
  let fixture: ComponentFixture<Exercisepage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exercisepage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Exercisepage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
