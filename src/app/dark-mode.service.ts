import { Injectable } from '@angular/core';
import { ThemeDetection, ThemeDetectionResponse } from '@ionic-native/theme-detection/ngx';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {

  constructor(
    private themeDetection: ThemeDetection
  ) { }

  // Is available
  private async isAvailable(): Promise<any> {
    try {
      let dark_mode_available: ThemeDetectionResponse = await this.themeDetection.isAvailable();
      return dark_mode_available;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // Is enabled
  private async isEnabled(): Promise<any> {
    try {
      let dark_mode_enabled: ThemeDetectionResponse = await this.themeDetection.isDarkModeEnabled();
      return dark_mode_enabled;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // Is available and elabled
  public async isAvailableAndEnabled(){
    try {
      let dark_mode_available: ThemeDetectionResponse = await this.isAvailable();
      let dark_mode_enabled: ThemeDetectionResponse = await this.isEnabled();
      return dark_mode_available.value && dark_mode_enabled.value;
    } catch (e) {
      return false
    }
  }
}
