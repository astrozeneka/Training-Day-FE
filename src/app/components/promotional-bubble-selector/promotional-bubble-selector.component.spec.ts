import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PromotionalBubbleSelectorComponent } from './promotional-bubble-selector.component';

describe('PromotionalBubbleSelectorComponent', () => {
  let component: PromotionalBubbleSelectorComponent;
  let fixture: ComponentFixture<PromotionalBubbleSelectorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionalBubbleSelectorComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionalBubbleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
