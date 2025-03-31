import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { Subject, take } from 'rxjs';
import { UxButtonComponent } from 'src/app/components-submodules/angular-ux-button/ux-button.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-continue-with-google-button',
  templateUrl: './continue-with-google-button.component.html',
  styleUrls: ['./continue-with-google-button.component.scss'],
})
export class ContinueWithGoogleButtonComponent implements OnInit {

  @Output() action = new EventEmitter<{google_token: string}>();

  // Button inherited
  @Input() color: string|undefined = undefined;
  @Input() expand: string|undefined = undefined;
  @Input() shape: string|undefined = undefined;
  @Input() size: string|undefined = undefined;
  @Input() fill: string|undefined = undefined;
  @Input() type: string|undefined = undefined;
  @Input() disabled: boolean|undefined = false;
  @Input() loading: boolean|undefined = false;
  
  // App link handling (for login only) - Subject is the token
  onOpenedFromGoogleOauth$: Subject<{token: string}> = new Subject()

  // The google login process differs whether the user is on iOS or Android
  system:'ios'|'android' = null

  constructor(
    private platform: Platform
  ) {
  }

  ngOnInit() {

    // 6. Handle deeplink redirection
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      /*this.feedbackService.registerNow("Deep link received : " + event.url, "secondary")*/
      console.log('App opened with URL: ' + event.url);
      if (event.url.includes('/app/google')){
        let token = event.url.split('/').pop()
        this.onOpenedFromGoogleOauth$.next({token: token})
      }
    })

    // 7. Detect the platform
    if (this.platform.is('android')){
      this.system = 'android'
    } else {
      this.system = 'ios'
    }
  }

  trigger(){
    

    // Option 1: using a form and safari data (suitable for ios, android ??)
    const form = document.createElement('form');
    form.action = `${environment.rootEndpoint}/oauth/google`;
    form.method = 'GET';
    // add os = this.os parameter to the form
    form.innerHTML = `<input type="hidden" name="os" value="${this.system}">`
    document.body.appendChild(form);
    form.submit();
    

    // Option 2: using the browser (the browser doesn' allow the suer to access history)
    // Browser.open({url: `${environment.rootEndpoint}/oauth/google`})

    // Option 3: using Safari view
    /*StorePlugin.openSafariView({url: `${environment.rootEndpoint}/oauth/google`})*/

    this.onOpenedFromGoogleOauth$
      .pipe(take(1))
      .subscribe((res)=>{
        console.log("Token received :" + JSON.stringify(res))
        console.log("Request Login")
        this.action.emit({
          'google_token': res.token
        })
    })
  }

}
