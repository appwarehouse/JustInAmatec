var exec = require('cordova/exec');

exports.scan = function (arg0, success, error) {
    exec(success, error, 'HoneyWellScan', 'scan', [arg0]);
};

exports.nativeToast = function (arg0, success, error) {
    exec(success, error, 'HoneyWellScan', 'nativeToast', [arg0]);
};
