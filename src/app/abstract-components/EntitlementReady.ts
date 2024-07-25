import {OnInit} from "@angular/core";
import StorePlugin from "../custom-plugins/store.plugin";

/**
 * This is actually an experimental class
 * TODO: this shouldn't work, as a inherited class
 * SHould use subcomponent or sth to be linked normally, but not inheritance
 * */
export class EntitlementReady {
  public active_entitled_subscription = null

  async loadEntitlements(){
    let { entitlements, subscriptions } = await StorePlugin.getAutoRenewableEntitlements({})
    this.active_entitled_subscription = subscriptions.filter((subscription) => ['hoylt', 'moreno', 'alonzo']
      .includes(subscription.id))
    if(this.active_entitled_subscription.length > 1)
      console.error("More than one active subscription are found, this is not supported",
        this.active_entitled_subscription)
    this.active_entitled_subscription = this.active_entitled_subscription[0] ?? null
  }
}