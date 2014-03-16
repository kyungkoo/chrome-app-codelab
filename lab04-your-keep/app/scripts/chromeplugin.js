(function(chrome, window) {
  'use strict';

  if (typeof chrome !== 'undefined' && typeof chrome !== 'object') {
    window.chrome = {};
  }

  if (!chrome.runtime) {
    chrome.runtime = {
      lastError: null
    };
  }

  if (!chrome.storage) {
    chrome.storage = {
      onChanged: {
        addListener: function(cb) {
          window.addEventListener('storage', cb, false);
        }
      },
      sync: {
        get: function(keys, cb) {
          var data = localStorage.getItem(keys);
          var args = {};
          args[keys] = JSON.parse(data);
          cb(args);
        },
        getBytesInUse: function(keys) {
          return 1028 * keys;
        },
        set: function(items, cb) {
          for(var item in items) {
            localStorage.setItem(item, JSON.stringify(items[item]));
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
