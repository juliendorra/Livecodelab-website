/*
## Global Scope
## ============
##
## This object will contain all the global functions that can be called
## from within Live Code Lab
*/

define(function() {
  var GlobalScope;
  return GlobalScope = (function() {
    function GlobalScope() {
      this.scope = {};
    }

    GlobalScope.prototype.add = function(name, value) {
      return window[name] = value;
    };

    GlobalScope.prototype.getScope = function() {
      return this.scope;
    };

    return GlobalScope;

  })();
});

/*
//@ sourceMappingURL=global-scope.js.map
*/