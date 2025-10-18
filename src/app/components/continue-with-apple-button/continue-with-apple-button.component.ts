import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { SignInWithApple, SignInWithAppleResponse as _SignInWithAppleResponse, SignInWithAppleOptions } from '@capacitor-community/apple-sign-in';

export interface SignInWithAppleResponse {
  user: string
  givenName: string
  email: string
  familyName: string
  identityToken: string
  authorizationCode: string
}


@Component({
  selector: 'app-continue-with-apple-button',
  templateUrl: './continue-with-apple-button.component.html',
  styleUrls: ['./continue-with-apple-button.component.scss'],
})
export class ContinueWithAppleButtonComponent  implements OnInit {
  @Output() action = new EventEmitter<SignInWithAppleResponse>();

  constructor() { }

  ngOnInit() {}

  async trigger(){
    const options: SignInWithAppleOptions = {
      clientId: 'com.trainingday.webservice',
      redirectURI: 'https://training-day-be.codecrane.me/app/apple',
      scopes: 'email name',
      state: '12345',
      nonce: 'nonce', // Important for security
    };

    try {
      const result: _SignInWithAppleResponse = await SignInWithApple.authorize(options);
      // console.log('Apple Login successful');
      // console.log(JSON.stringify(result));
      /* {"response":{"user":"000954.adeb6977d84e4cc5bbcb2a27415047e4.0559","givenName":"Ryan","email":"kevinryan25@icloud.com","familyName":"Rasoarahona","identityToken":"eyJraWQiOiJIdlZJNkVzWlhKIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoiY29tLmNvZGVjcmFuZS50cmFpbmluZy1kYXkiLCJleHAiOjE3NjA4NTM1NzksImlhdCI6MTc2MDc2NzE3OSwic3ViIjoiMDAwOTU0LmFkZWI2OTc3ZDg0ZTRjYzViYmNiMmEyNzQxNTA0N2U0LjA1NTkiLCJub25jZSI6Im5vbmNlIiwiY19oYXNoIjoiaXpjd0p6REhrWndpcWRFdWdWeWlidyIsImVtYWlsIjoia2V2aW5yeWFuMjVAaWNsb3VkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdXRoX3RpbWUiOjE3NjA3NjcxNzksIm5vbmNlX3N1cHBvcnRlZCI6dHJ1ZSwicmVhbF91c2VyX3N0YXR1cyI6Mn0.lCPEhsDNNNqDUKtW8lUiuPSpKfne-7yWDXl3Aq6fEcpMUHLMWP_QBhKPzq3PdoZ_uVU6rJbDJRFxC5o60ORT1Q5CYojnSCLaSz9i7nYd0Fui3zMYptK4d4LhX7pxDTqkzMZ37bk2e8wL0nuy-NDIUl0FOiPboHN2zgLCn4fCWCamosNBj5qzBJ0nU0C6hcrEyY4FOgTrI7NbcVkmW8xwud9PM8kbgJT9ufwL2oMJug6FnOVjaP1mzAW6iV-rukg8rrpteFmp1aWcpkuOCEFDChWXTUmCRd4ZULp95ScidW5BzsweEick-lVpoAjFUJX4Yw-_9b8d4RuAO-TYGpvsrw","authorizationCode":"cf68c8087584a4be89cb6e228a12cfac4.0.szvu.RzpBuY3pAsd4tb-AzrTJFw"}} */
      // Emit
      this.action.emit(result.response);
    } catch (error) {
      console.error('Apple Login failed', error);
    }
  }

}
