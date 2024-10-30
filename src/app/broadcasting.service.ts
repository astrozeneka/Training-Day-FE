import { Injectable } from '@angular/core';
import Pusher from "pusher-js";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class BroadcastingService {
  pusher: Pusher;

  constructor() {
    this.pusher = new Pusher(environment.pusher_app_key, {
      cluster: environment.pusher_cluster,
      httpHost: environment.pusher_host,
      wsHost: environment.pusher_host,
      httpPort: environment.pusher_port,
      wsPort: environment.pusher_port,
      wssPort: environment.pusher_port,
      forceTLS: false, // Hard coded
      disableStats: true, // hard coded
      // enabledTransports: ['ws', 'wss'], // Hard coded
      enabledTransports: ['ws', 'wss']
    });
  }
}
