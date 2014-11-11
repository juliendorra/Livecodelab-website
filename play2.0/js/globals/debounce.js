var debounce,
  __slice = [].slice;

debounce = function(func, threshold, execAsap) {
  var timeout;
  timeout = null;
  return function() {
    var args, delayed, obj;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    obj = this;
    delayed = function() {
      if (!execAsap) {
        func.apply(obj, args);
      }
      return timeout = null;
    };
    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }
    return timeout = setTimeout(delayed, threshold || 100);
  };
};

/*
//@ sourceMappingURL=debounce.js.map
*/