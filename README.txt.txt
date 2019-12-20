The web project is named JustIN-ionicV4-. This is an ionic project that is built using ng for use on the web. 

JustInRollCall is the ionic application for the roll call app on the playstore

ReportingJS is the NodeJS source code for the emailing scheduler. This node js application is hosted on Google's App Engine service under the JustIn project. It is interaction with Google's BigQuery aswell. Ensure to read the README file within this folder aswell.



Custom Plugins are custom cordova plugins that have been created using a tool called plugman. Here is a link on how to use plugman. --> https://github.com/RootSoft/Create-a-custom-Cordova-plugin. Here is another link that details how exaclty to implement this plugin into an ionic application. --> https://joangape.blogspot.com/2019/11/create-custom-cordova-plugin-for-ionic4.html. The ionic native folder has already been cloned into this root folder for JustInAmatec

To implement scanning in our ionic application, the goal is to include the libraries in the "Scanning Libraries" into our custom cordova plugins to enable out ionic apps to scan. "MyFirstPlugin" is for the Chainwell device libraries, whilst "HoneyWellScan" is for the Honeywell devices.



JustInScan is a test application for scanning that has implemented both the above custom plugins. I have managed to get the Honeywell devices to start scanning but i havent been able to get it to return the byte array data from the java code to the javascript code using Cordova's callbackcontext. This should hopefully be the last step in getting the honeywell devices scanning correctly. The Chainwell devices are not scanning and there seems to be an error when calling the scanning package during runtime on the device. Use the command "adb logcat" to view and hopefully diagnose this error.

Scanning Libraries contain the libs for each device. Links to both sdk's will be provided along with some demo apps and notes from the manufacturer.

