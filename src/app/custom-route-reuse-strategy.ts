import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouteReuseStrategy,
  DetachedRouteHandle,
  Router
} from '@angular/router';
import { NavController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
    storedRoutes = new Map<string, DetachedRouteHandle>();
    
    constructor(private router: Router) {}

    // Check if the route should be detached based on the URL pattern
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        const url = route.url.join('/');
        // Match a specific pattern (e.g., "/videos/training/*")
        console.log("HHHHHHERE", this.router)
        return url.startsWith('/videos/');
    }

    // Store the route for reuse
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const url = route.url.join('/');
        this.storedRoutes.set(url, handle);
    }

    // Check if the route should be attached based on the stored routes
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const url = route.url.join('/');
        return this.storedRoutes.has(url);
    }

    // Retrieve the stored route
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const url = route.url.join('/');
        return this.storedRoutes.get(url) || null;
    }

    // Determine if the route should be reused based on the current and future routes
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}