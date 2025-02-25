import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BottomNavbarPlaceholderComponent } from './bottom-navbar-placeholder.component';

describe('BottomNavbarPlaceholderComponent', () => {
  let component: BottomNavbarPlaceholderComponent;
  let fixture: ComponentFixture<BottomNavbarPlaceholderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomNavbarPlaceholderComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavbarPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
