import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalTrainerPage } from './personal-trainer.page';

describe('PersonalTrainerPage', () => {
  let component: PersonalTrainerPage;
  let fixture: ComponentFixture<PersonalTrainerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PersonalTrainerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
