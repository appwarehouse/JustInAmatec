/**
 * This is a template for new plugin wrappers
 *
 * TODO:
 * - Add/Change information below
 * - Document usage (importing, executing main functionality)
 * - Remove any imports that you are not using
 * - Remove all the comments included in this template, EXCEPT the @Plugin wrapper docs and any other docs you added
 * - Remove this note
 *
 */
import { Injectable } from '@angular/core';
import { Plugin, Cordova, CordovaProperty, CordovaInstance, InstanceProperty, IonicNativePlugin } from '@ionic-native/core';
import { Observable } from 'rxjs';

/**
 * @name Honey Well Scan
 * @description
 * This plugin does something
 *
 * @usage
 * ```typescript
 * import { HoneyWellScan } from '@ionic-native/honey-well-scan';
 *
 *
 * constructor(private honeyWellScan: HoneyWellScan) { }
 *
 * ...
 *
 *
 * this.honeyWellScan.functionName('Hello', 123)
 *   .then((res: any) => console.log(res))
 *   .catch((error: any) => console.error(error));
 *
 * ```
 */
@Plugin({
  pluginName: 'HoneyWellScan',
  plugin: 'com.honeywell.scan', // npm package name, example: cordova-plugin-camera
  pluginRef: 'cordova.plugins.HoneyWellScan', // the variable reference to call the plugin, example: navigator.geolocation
  platforms: ['Android'] // Array of platforms supported, example: ['Android', 'iOS']
})
@Injectable()
export class HoneyWellScan extends IonicNativePlugin {

  /**
   * This function does something
   * @param arg1 {string} Some param to configure something
   * @param arg2 {number} Another param to configure something
   * @return {Promise<any>} Returns a promise that resolves when something happens
   */
  @Cordova()
  nativeToast(): Promise<any> {
    return;
  }

  @Cordova()
  scan(): Promise<any> {
    return;
  }

}
