/*
## EventRouter bridges most events in LiveCodeLab.
## Error message pops up? Event router steps in.
## Big cursor needs to shrink? It's the event router who stepped in.
## You get the picture.
## Any part of LiveCodeLab can just register callbacks and trigger events,
## using some descriptive strings as keys.
## Handy because it's a hub where one could attach debugging and listing
## of all registered callbacks. Probably not a good idea to attach
## rapid-fire events due to overheads.
*/

var __slice = [].slice;

define(function() {
  var EventEmitter;
  EventEmitter = (function() {
    function EventEmitter() {
      this.events = {};
    }

    EventEmitter.prototype.emit = function() {
      var args, event, listener, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this.events[event]) {
        return false;
      }
      _ref = this.events[event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener.apply(null, args);
      }
      return true;
    };

    EventEmitter.prototype.addListener = function(event, listener) {
      var _base;
      this.emit('newListener', event, listener);
      ((_base = this.events)[event] != null ? (_base = this.events)[event] : _base[event] = []).push(listener);
      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(event, listener) {
      var fn,
        _this = this;
      fn = function() {
        _this.removeListener(event, fn);
        return listener.apply(null, arguments);
      };
      this.on(event, fn);
      return this;
    };

    EventEmitter.prototype.removeListener = function(event, listener) {
      var l;
      if (!this.events[event]) {
        return this;
      }
      this.events[event] = (function() {
        var _i, _len, _ref, _results;
        _ref = this.events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          if (l !== listener) {
            _results.push(l);
          }
        }
        return _results;
      }).call(this);
      return this;
    };

    EventEmitter.prototype.removeAllListeners = function(event) {
      delete this.events[event];
      return this;
    };

    return EventEmitter;

  })();
  return EventEmitter;
});

/*
//@ sourceMappingURL=event-emitter.js.map
*/