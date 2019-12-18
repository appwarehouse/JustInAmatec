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
 * @name Chainway2DPlugin
 * @description
 * This plugin does something
 *
 * @usage
 * ```typescript
 * import { Chainway2DPlugin } from '@ionic-native/chainway-2-d-plugin';
 *
 *
 * constructor(private chainway2DPlugin: Chainway2DPlugin) { }
 *
 * ...
 *
 *
 * this.chainway2DPlugin.functionName('Hello', 123)
 *   .then((res: any) => console.log(res))
 *   .catch((error: any) => console.error(error));
 *
 * ```
 */
@Plugin({
  pluginName: 'Chainway2D',
  plugin: 'cordova-plugin-chainway2dplugin', // npm package name, example: cordova-plugin-camera
  pluginRef: 'Chainway2D', // the variable reference to call the plugin, example: navigator.geolocation
  repo: '', // the github repository URL for the plugin
  install: '', // OPTIONAL install command, in case the plugin requires variables
  installVariables: [], // OPTIONAL the plugin requires variables
  platforms: ['Android'] // Array of platforms supported, example: ['Android', 'iOS']
})
@Injectable()
export class Chainway2DPlugin extends IonicNativePlugin {

  /**
   * This function does something
   * @param arg1 {string} Some param to configure something
   * @param arg2 {number} Another param to configure something
   * @return {Promise<any>} Returns a promise that resolves when something happens
   */
  @Cordova()
  coolMethod(options: {}): Promise<any> {
    return; // We add return; here to avoid any IDE / Compiler errors
  }

}
