import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PromotionalBubbleSelectorIosComponent } from './promotional-bubble-selector-ios.component';

describe('PromotionalBubbleSelectorIosComponent', () => {
  let component: PromotionalBubbleSelectorIosComponent;
  let fixture: ComponentFixture<PromotionalBubbleSelectorIosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionalBubbleSelectorIosComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PromotionalBubbleSelectorIosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
