'use strict';

// Listens for the app launching then creates the window
// [chrome.app.runtime - Google Chrome](http://goo.gl/GcK13l)
chrome.app.runtime.onLaunched.addListener(function() {
  var width = 360;
  var height = 500;

  chrome.app.window.create('index.html', {
    id: 'YourKeepWindow',
    bounds: {
      width: width,
      height: height,
      left: Math.round((screen.availWidth - width) / 2),
      top: Math.round((screen.availHeight - height) / 2)
    }
  });
});
