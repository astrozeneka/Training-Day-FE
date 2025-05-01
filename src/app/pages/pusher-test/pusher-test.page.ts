import { Component, OnInit } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Component({
  selector: 'app-pusher-test',
  template: `<ion-content>
    <h1>Pusher Test Page</h1>
    <p *ngIf="triggered">Triggered</p>
  </ion-content>`
})
export class PusherTestPage implements OnInit {
  pusherClient: Pusher | undefined;
  triggered: boolean = false;

  constructor() { 
    this.pusherClient = new Pusher('app-key', {
      cluster: 'eu',
      forceTLS: true,
      disableStats: true,
      wsHost: 'soketi.codecrane.me',
      wsPort: 443,
      enabledTransports: ['ws', 'wss'],
    })
  }

  ngOnInit() {
    const echo = new Echo({
      broadcaster: 'pusher',
      client: this.pusherClient,
    });
    console.log("Subscribing to channel");
    echo.channel('hello-world') // Same as broadcastOn
      .listen('.HelloWorldEvent', (e: any) => {
        console.log("Event received: ", e);
        this.triggered = true;
      })
  }

}
