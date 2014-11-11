/*
## Simple helper to handle the code dimming. When to trigger dimming and
## un-dimming and keeping track of status of the dedicated
## "automatic dimming" toggle switch.
*/

define(function() {
  var EditorDimmer;
  EditorDimmer = (function() {
    EditorDimmer.prototype.dimIntervalID = void 0;

    EditorDimmer.prototype.dimCodeOn = false;

    function EditorDimmer(eventRouter, bigCursor) {
      this.eventRouter = eventRouter;
      this.bigCursor = bigCursor;
    }

    EditorDimmer.prototype.undimEditor = function() {
      if (!this.bigCursor.isShowing) {
        if ($("#formCode").css("opacity") < 1) {
          $("#formCode").clearQueue();
          return $("#formCode").animate({
            opacity: 1,
            duration: 'fast'
          });
        }
      }
    };

    EditorDimmer.prototype.dimEditor = function() {
      if ($("#formCode").css("opacity") > 0) {
        $("#formCode").clearQueue();
        return $("#formCode").animate({
          opacity: 0,
          duration: 'fast'
        });
      }
    };

    EditorDimmer.prototype.toggleDimCode = function(dimmingActive) {
      var _this = this;
      if (dimmingActive == null) {
        this.dimCodeOn = !this.dimCodeOn;
      } else {
        this.dimCodeOn = dimmingActive;
      }
      if (this.dimIntervalID != null) {
        clearInterval(this.dimIntervalID);
      }
      if (this.dimCodeOn) {
        setTimeout((function() {
          return _this.dimEditor();
        }), 10);
        this.dimIntervalID = setInterval((function() {
          return _this.dimEditor();
        }), 3000);
      } else {
        this.undimEditor();
      }
      return this.eventRouter.emit("auto-hide-code-button-pressed", this.dimCodeOn);
    };

    return EditorDimmer;

  })();
  return EditorDimmer;
});

/*
//@ sourceMappingURL=text-dimming.js.map
*/