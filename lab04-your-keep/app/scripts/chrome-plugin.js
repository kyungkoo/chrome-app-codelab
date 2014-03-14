(function(chrome, window) {
  'use strict';

  if (typeof chrome !== 'undefined') {
    window.chrome = {};
  }

  if (chrome && !chrome.storage) {
    chrome.storage = {
      onChanged: {
        addListener: function(cb) {
          window.addEventListener('storage', cb, false);
        }
      },
      sync: {
        get: function(keys, cb) {
          cb(localStorage.getItem(keys));
        },
        getBytesInUse: function(keys) {
          return 1028 * keys;
        },
        set: function(items, cb) {
          for(var item in items) {
            localStorage.setItem(item, items[item]);
          }

          cb();
        },
        remove: function(keys, cb) {
          localStorage.removeItem(keys);
          cb();
        },
        clear: function(cb) {
          localStorage.clear();
          cb();
        }
      }
    };
  }

  return chrome;

}(chrome, window));
