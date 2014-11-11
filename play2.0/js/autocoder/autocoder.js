/*
## Autocoder takes care of making random variations to the code.
*/

define(['core/colour-literals'], function(ColourLiterals) {
  var Autocoder;
  Autocoder = (function() {
    Autocoder.prototype.active = false;

    Autocoder.prototype.autocoderMutateTimeout = void 0;

    Autocoder.prototype.numberOfResults = 0;

    Autocoder.prototype.whichOneToChange = 0;

    Autocoder.prototype.colorsRegex = "";

    Autocoder.prototype.numberOfColors = 0;

    Autocoder.prototype.mutationInterval = 1000;

    function Autocoder(eventRouter, editor, colourNames) {
      var key;
      this.eventRouter = eventRouter;
      this.editor = editor;
      this.colourNames = colourNames;
      this.colorsRegex = "";
      this.colourLiterals = new ColourLiterals;
      this.numberOfColors = this.colourNames.length;
      for (key in this.colourLiterals.colourNamesValues) {
        if (this.colourLiterals.colourNamesValues.hasOwnProperty(key)) {
          this.colorsRegex = this.colorsRegex + "|" + key;
        }
      }
      this.colorsRegex = this.colorsRegex.substring(1, this.colorsRegex.length);
    }

    Autocoder.prototype.mutate = function() {
      var whichMutation;
      whichMutation = Math.floor(Math.random() * 6);
      if (whichMutation === 0) {
        this.replaceAFloat();
      } else if (whichMutation === 1) {
        this.replaceAnInteger();
      } else if (whichMutation === 2) {
        this.replaceABoxWithABall();
      } else if (whichMutation === 3) {
        this.replaceABallWithABox();
      } else if (whichMutation === 4) {
        this.replaceAColorWithAnotherColor();
      } else if (whichMutation === 5) {
        this.replaceAMatrixTransformWithAnother();
      }
    };

    Autocoder.prototype.replaceAMatrixTransformWithAnother = function() {
      var allMatches, countWhichOneToSwap, editorContent, matrixTransforms, numberOfResults, rePattern, whichColorToReplaceWith, whichOneToChange,
        _this = this;
      matrixTransforms = ["scale", "rotate", "move"];
      editorContent = this.editor.getValue();
      rePattern = RegExp("(^[\\t ]*|;| |,)([\\t ]*)(scale|rotate|move)(?![\\w\\d])", 'gm');
      allMatches = editorContent.match(rePattern);
      if (allMatches === null) {
        numberOfResults = 0;
      } else {
        numberOfResults = allMatches.length;
      }
      whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
      whichColorToReplaceWith = Math.floor(Math.random() * matrixTransforms.length);
      countWhichOneToSwap = 0;
      editorContent = editorContent.replace(rePattern, function(match, p1, p2) {
        countWhichOneToSwap++;
        if (countWhichOneToSwap === whichOneToChange) {
          return p1 + p2 + matrixTransforms[whichColorToReplaceWith];
        }
        return match;
      });
      this.editor.setValue(editorContent);
    };

    Autocoder.prototype.replaceAColorWithAnotherColor = function() {
      var allMatches, countWhichOneToSwap, editorContent, numberOfResults, rePattern, whichColorToReplaceWith, whichOneToChange,
        _this = this;
      editorContent = this.editor.getValue();
      rePattern = RegExp("(^[\\t ]*|;| |,)([\\t ]*)(" + this.colorsRegex + ")(?![\\w\\d])", 'gm');
      allMatches = editorContent.match(rePattern);
      if (allMatches === null) {
        numberOfResults = 0;
      } else {
        numberOfResults = allMatches.length;
      }
      whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
      whichColorToReplaceWith = Math.floor(Math.random() * this.numberOfColors);
      countWhichOneToSwap = 0;
      editorContent = editorContent.replace(rePattern, function(match, p1, p2) {
        countWhichOneToSwap++;
        if (countWhichOneToSwap === whichOneToChange) {
          return p1 + p2 + _this.colourNames[whichColorToReplaceWith];
        }
        return match;
      });
      this.editor.setValue(editorContent);
    };

    Autocoder.prototype.replaceABallWithABox = function() {
      var allMatches, countWhichOneToSwap, editorContent, numberOfResults, rePattern, whichOneToChange,
        _this = this;
      editorContent = this.editor.getValue();
      rePattern = void 0;
      rePattern = /(ball)/g;
      allMatches = editorContent.match(rePattern);
      if (allMatches === null) {
        numberOfResults = 0;
      } else {
        numberOfResults = allMatches.length;
      }
      whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
      countWhichOneToSwap = 0;
      editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
        countWhichOneToSwap++;
        if (countWhichOneToSwap === whichOneToChange) {
          return "box";
        }
        return match;
      });
      this.editor.setValue(editorContent);
    };

    Autocoder.prototype.replaceAnInteger = function() {
      var allMatches, countWhichOneToSwap, editorContent, numberOfResults, rePattern, whichOneToChange,
        _this = this;
      editorContent = this.editor.getValue();
      rePattern = /(^|[\t ,\(/])(\d+)(?!\.)/gm;
      allMatches = editorContent.match(rePattern);
      if (allMatches === null) {
        numberOfResults = 0;
      } else {
        numberOfResults = allMatches.length;
      }
      whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
      countWhichOneToSwap = 0;
      editorContent = editorContent.replace(rePattern, function(match, p1, p2) {
        var whichOp;
        countWhichOneToSwap++;
        if (countWhichOneToSwap === whichOneToChange) {
          whichOp = Math.floor(Math.random() * 7);
          if (whichOp === 0) {
            return p1 + Math.floor(parseFloat(p2) * 2);
          } else if (whichOp === 1) {
            return p1 + Math.floor(parseFloat(p2) / 2);
          } else if (whichOp === 2) {
            return p1 + Math.floor(parseFloat(p2) + 1);
          } else if (whichOp === 3) {
            return p1 + Math.floor(parseFloat(p2) - 1);
          } else if (whichOp === 4) {
            return p1 + Math.floor(parseFloat(p2) * 5);
          } else if (whichOp === 5) {
            return p1 + Math.floor(parseFloat(p2) / 5);
          } else if (whichOp === 6) {
            return p1 + "Math.floor(1+time/1000)";
          }
        }
        return match;
      });
      this.editor.setValue(editorContent);
    };

    Autocoder.prototype.replaceTimeWithAConstant = function() {
      var allMatches, countWhichOneToSwap, editorContent, rePattern,
        _this = this;
      editorContent = this.editor.getValue();
      rePattern = /(time)/g;
      allMatches = editorContent.match(rePattern);
      countWhichOneToSwap = 0;
      if (!allMatches) {
        this.numberOfResults = 0;
      } else {
        this.numberOfResults = allMatches.length;
      }
      this.whichOneToChange = Math.floor(Math.random() * this.numberOfResults) + 1;
      editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
        countWhichOneToSwap++;
        if (countWhichOneToSwap === _this.whichOneToChange) {
          return "" + Math.floor(Math.random() * 20) + 1;
        }
        return match;
      });
      return this.editor.setValue(editorContent);
    };

    Autocoder.prototype.replaceABoxWithABall = function() {
      var allMatches, countWhichOneToSwap, editorContent, numberOfResults, rePattern, whichOneToChange,
        _this = this;
      editorContent = this.editor.getValue();
      rePattern = void 0;
      rePattern = /(box)/g;
      allMatches = editorContent.match(rePattern);
      if (allMatches === null) {
        numberOfResults = 0;
      } else {
        numberOfResults = allMatches.length;
      }
      whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
      countWhichOneToSwap = 0;
      editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
        countWhichOneToSwap++;
        if (countWhichOneToSwap === whichOneToChange) {
          return "ball";
        }
        return match;
      });
      this.editor.setValue(editorContent);
    };

    Autocoder.prototype.replaceAFloat = function() {
      var allMatches, countWhichOneToSwap, editorContent, numberOfResults, rePattern, whichOneToChange,
        _this = this;
      editorContent = this.editor.getValue();
      rePattern = /([-+]?[0-9]*\.[0-9]+)/g;
      allMatches = editorContent.match(rePattern);
      if (allMatches === null) {
        numberOfResults = 0;
      } else {
        numberOfResults = allMatches.length;
      }
      whichOneToChange = Math.floor(Math.random() * numberOfResults) + 1;
      countWhichOneToSwap = 0;
      editorContent = editorContent.replace(rePattern, function(match, text, urlId) {
        var whichOp;
        countWhichOneToSwap++;
        if (countWhichOneToSwap === whichOneToChange) {
          whichOp = Math.floor(Math.random() * 12);
          if (whichOp === 0) {
            return parseFloat(match) * 2;
          } else if (whichOp === 1) {
            return parseFloat(match) / 2;
          } else if (whichOp === 2) {
            return parseFloat(match) + 1;
          } else if (whichOp === 3) {
            return parseFloat(match) - 1;
          } else if (whichOp === 4) {
            return parseFloat(match) * 5;
          } else if (whichOp === 5) {
            return parseFloat(match) / 5;
          } else if (whichOp === 6) {
            return parseFloat(match) + 0.1;
          } else if (whichOp === 7) {
            return parseFloat(match) - 0.1;
          } else if (whichOp === 8) {
            return parseFloat(match) + 0.5;
          } else if (whichOp === 9) {
            return parseFloat(match) - 0.5;
          } else if (whichOp === 10) {
            return Math.floor(parseFloat(match));
          } else if (whichOp === 11) {
            return "time/1000";
          }
        }
        return match;
      });
      this.editor.setValue(editorContent);
    };

    Autocoder.prototype.autocoderMutate = function() {
      this.eventRouter.emit("autocoderbutton-flash");
      return this.mutate();
    };

    Autocoder.prototype.toggle = function(forcedState) {
      var _this = this;
      if (forcedState === undefined) {
        this.active = !this.active;
      } else {
        this.active = forcedState;
      }
      if (this.active) {
        this.autocoderMutateTimeout = setInterval((function() {
          return _this.autocoderMutate();
        }), this.mutationInterval);
        if (this.editor.getValue() === "" || ((window.location.hash.indexOf("bookmark") !== -1) && (window.location.hash.indexOf("autocodeTutorial") !== -1))) {
          this.eventRouter.emit("load-program", "cubesAndSpikes");
        }
      } else {
        clearInterval(this.autocoderMutateTimeout);
      }
      return this.eventRouter.emit("autocoder-button-pressed", this.active);
    };

    return Autocoder;

  })();
  return Autocoder;
});

/*
//@ sourceMappingURL=autocoder.js.map
*/