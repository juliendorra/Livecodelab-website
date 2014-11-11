/*
## Helper class to manage URL hash location.
*/

define(function() {
  var UrlRouter;
  UrlRouter = (function() {
    function UrlRouter(eventRouter) {
      var _this = this;
      this.eventRouter = eventRouter;
      this.eventRouter.addListener("set-url-hash", function(hash) {
        return _this.setHash(hash);
      });
    }

    UrlRouter.prototype.getHash = function() {
      var match;
      match = window.location.href.match(/#(.*)$/);
      if (match) {
        return match[1];
      } else {
        return "";
      }
    };

    UrlRouter.prototype.setHash = function(hash) {
      return window.location.hash = hash;
    };

    UrlRouter.prototype.urlPointsToDemoOrTutorial = function() {
      var found, hash;
      found = false;
      hash = this.getHash();
      if (hash) {
        this.eventRouter.emit("url-hash-changed", hash);
        found = true;
      }
      return found;
    };

    return UrlRouter;

  })();
  return UrlRouter;
});

/*
//@ sourceMappingURL=url-router.js.map
*/