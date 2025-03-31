import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ContinueWithGoogleButtonComponent } from './continue-with-google-button.component';

describe('ContinueWithGoogleButtonComponent', () => {
  let component: ContinueWithGoogleButtonComponent;
  let fixture: ComponentFixture<ContinueWithGoogleButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinueWithGoogleButtonComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ContinueWithGoogleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
