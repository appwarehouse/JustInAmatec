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
 * @name My First Plugin
 * @description
 * This plugin does something
 *
 * @usage
 * ```typescript
 * import { MyFirstPlugin } from '@ionic-native/my-first-plugin';
 *
 *
 * constructor(private myFirstPlugin: MyFirstPlugin) { }
 *
 * ...
 *
 *
 * this.myFirstPlugin.functionName('Hello', 123)
 *   .then((res: any) => console.log(res))
 *   .catch((error: any) => console.error(error));
 *
 * ```
 */
@Plugin({
  pluginName: 'MyFirstPlugin',
  plugin: 'com.joangape.myfirstplugin',
  pluginRef: 'cordova.plugins.MyFirstPlugin',
  platforms: ['Android']
})
@Injectable()
export class MyFirstPlugin extends IonicNativePlugin {

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
