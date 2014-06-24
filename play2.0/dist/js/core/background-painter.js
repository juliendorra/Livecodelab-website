/*
## The user can issue multiple solid fill and gradient fill commands
## and they are all painted on top of each other according to the
## order they have been issued in.
## So for example you can have one gradient and then
## a second one painted over it that uses some transparency.
##
## This is why solid and gradient fills are all kept in an array
## and each time the user issues one of the two commands, an
## element is added to the array.
##
## Both solid and gradient fills are stored as elements in the
## array, all elements are the same and accommodate for a description
## that either case (solid/gradient).
##
## The background/gradients are drawn on a separate canvas or div.
## In case of a div we use normal CSS transforms - only when
## painting commands change the state of
## the background (i.e. colors of their
## arguments and the order of the commands) across frames.
## In case of canvas we use the normal gradient-painting
## primitives.
##
## For quickly determining whether the order/content of the commands
## has changed across frames,
## a string is kept that represents the whole stack of commands
## issued in the current frame, and similarly the "previous frame"
## string representation is also kept.
## So it's kind of like a simplified JSON representation if you will.
##
## If the strings are the same across frames, then the no
## new CSS transforms are applied for the background
## (or new gradient-painting to do in case of the canvas
#  implementation)
## , otherwise the array is iterated
## and new background/gradient transform is applied.
##
## Note that a fill (flat or gradient) made with solid colors
## invalidates the contents of the previous
## elements of the array, so we discard those when such
## a command is issued.
*/

var getCssValuePrefix;

getCssValuePrefix = function(name, value) {
  var dom, i, prefixes;
  prefixes = ["", "-o-", "-ms-", "-moz-", "-webkit-"];
  dom = document.createElement("div");
  i = 0;
  while (i < prefixes.length) {
    dom.style[name] = prefixes[i] + value;
    if (dom.style[name]) {
      return prefixes[i];
    }
    dom.style[name] = "";
    i++;
  }
};

define(function() {
  var BackgroundPainter;
  BackgroundPainter = (function() {
    BackgroundPainter.canvasForBackground = null;

    BackgroundPainter.backgroundViaCanvas = false;

    function BackgroundPainter(backgroundCanvasOrDiv, liveCodeLabCoreInstance, colourLiterals, backgroundViaCanvas) {
      var backGroundFraction;
      this.backgroundCanvasOrDiv = backgroundCanvasOrDiv;
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
      this.colourLiterals = colourLiterals;
      this.backgroundViaCanvas = backgroundViaCanvas != null ? backgroundViaCanvas : false;
      this.gradStack = [];
      this.defaultGradientColor1 = 0;
      this.defaultGradientColor2 = 0;
      this.defaultGradientColor3 = 0;
      this.whichDefaultBackground = void 0;
      this.currentGradientStackValue = "";
      this.previousGradientStackValue = 0;
      if (this.backgroundViaCanvas) {
        this.canvasForBackground = this.backgroundCanvasOrDiv;
        backGroundFraction = 1 / 100;
        this.canvasForBackground.width = Math.floor(window.innerWidth * backGroundFraction);
        this.canvasForBackground.height = Math.floor(window.innerHeight * backGroundFraction);
        this.backgroundSceneContext = this.canvasForBackground.getContext("2d");
      } else {
        this.gradientPrefix = getCssValuePrefix('background', 'linear-gradient(left, #fff, #fff)');
      }
    }

    BackgroundPainter.prototype.addToScope = function(scope) {
      var _this = this;
      scope.add('simpleGradient', function(a, b, c) {
        return _this.simpleGradient(a, b, c);
      });
      return scope.add('background', function(a, b, c) {
        return _this.background(a, b, c);
      });
    };

    BackgroundPainter.prototype.simpleGradient = function(a, b, c, d) {
      this.currentGradientStackValue = this.currentGradientStackValue + " " + a + "" + b + "" + c + "" + d + "null ";
      if (this.liveCodeLabCoreInstance.colourFunctions.alpha(a) === 255 && this.liveCodeLabCoreInstance.colourFunctions.alpha(b) === 255 && this.liveCodeLabCoreInstance.colourFunctions.alpha(c) === 255 && this.liveCodeLabCoreInstance.colourFunctions.alpha(d) === 255) {
        this.gradStack = [];
        this.currentGradientStackValue = "";
      }
      return this.gradStack.push({
        gradStacka: this.liveCodeLabCoreInstance.colourFunctions.color(a),
        gradStackb: this.liveCodeLabCoreInstance.colourFunctions.color(b),
        gradStackc: this.liveCodeLabCoreInstance.colourFunctions.color(c),
        gradStackd: this.liveCodeLabCoreInstance.colourFunctions.color(d),
        solid: null
      });
    };

    BackgroundPainter.prototype.background = function() {
      var a;
      a = this.liveCodeLabCoreInstance.colourFunctions.color(arguments[0], arguments[1], arguments[2], arguments[3]);
      if (this.liveCodeLabCoreInstance.colourFunctions.alpha(a) === 255) {
        this.gradStack = [];
        this.currentGradientStackValue = "";
      }
      this.currentGradientStackValue = this.currentGradientStackValue + " null null null null " + a + " ";
      return this.gradStack.push({
        solid: a,
        gradStacka: void 0,
        gradStackb: void 0,
        gradStackc: void 0,
        gradStackd: void 0
      });
    };

    BackgroundPainter.prototype.paintARandomBackground = function() {
      if (this.whichDefaultBackground == null) {
        this.whichDefaultBackground = Math.floor(Math.random() * 5);
      } else {
        this.whichDefaultBackground = (this.whichDefaultBackground + 1) % 5;
      }
      switch (this.whichDefaultBackground) {
        case 0:
          this.defaultGradientColor1 = this.colourLiterals.getColour('orange');
          this.defaultGradientColor2 = this.colourLiterals.getColour('red');
          this.defaultGradientColor3 = this.colourLiterals.getColour('black');
          $("#fakeStartingBlinkingCursor").css("color", "white");
          break;
        case 1:
          this.defaultGradientColor1 = this.colourLiterals.getColour('white');
          this.defaultGradientColor2 = this.colourLiterals.getColour('khaki');
          this.defaultGradientColor3 = this.colourLiterals.getColour('peachpuff');
          $("#fakeStartingBlinkingCursor").css("color", "LightPink");
          break;
        case 2:
          this.defaultGradientColor1 = this.colourLiterals.getColour('lightsteelblue');
          this.defaultGradientColor2 = this.colourLiterals.getColour('lightcyan');
          this.defaultGradientColor3 = this.colourLiterals.getColour('paleturquoise');
          $("#fakeStartingBlinkingCursor").css("color", "CadetBlue");
          break;
        case 3:
          this.defaultGradientColor1 = this.colourLiterals.getColour('silver');
          this.defaultGradientColor2 = this.colourLiterals.getColour('lightgrey');
          this.defaultGradientColor3 = this.colourLiterals.getColour('gainsboro');
          $("#fakeStartingBlinkingCursor").css("color", "white");
          break;
        case 4:
          this.defaultGradientColor1 = this.liveCodeLabCoreInstance.colourFunctions.color(155, 255, 155);
          this.defaultGradientColor2 = this.liveCodeLabCoreInstance.colourFunctions.color(155, 255, 155);
          this.defaultGradientColor3 = this.liveCodeLabCoreInstance.colourFunctions.color(155, 255, 155);
          $("#fakeStartingBlinkingCursor").css("color", "DarkOliveGreen");
      }
      this.resetGradientStack();
      return this.simpleGradientUpdateIfChanged();
    };

    BackgroundPainter.prototype.resetGradientStack = function() {
      this.currentGradientStackValue = "";
      this.gradStack = [];
      return this.simpleGradient(this.defaultGradientColor1, this.defaultGradientColor2, this.defaultGradientColor3);
    };

    BackgroundPainter.prototype.simpleGradientUpdateIfChanged = function() {
      var color, cssString, cssStringPreamble, diagonal, radgrad, scanningGradStack, _i, _len, _ref;
      color = this.liveCodeLabCoreInstance.colourFunctions.color;
      if (this.currentGradientStackValue !== this.previousGradientStackValue) {
        this.previousGradientStackValue = this.currentGradientStackValue;
        if (this.backgroundViaCanvas) {
          diagonal = Math.sqrt(Math.pow(this.canvasForBackground.width / 2, 2) + Math.pow(this.canvasForBackground.height / 2, 2));
        } else {
          cssStringPreamble = 'position: absolute; z-index:-3; top: 0px; left: 0px; width:10%; height:10%; ' + this.gradientPrefix + 'transform-origin: 0% 0%; ' + this.gradientPrefix + 'transform: scale(10,10);';
          cssStringPreamble = cssStringPreamble + 'background:';
          cssString = '';
        }
        _ref = this.gradStack;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          scanningGradStack = _ref[_i];
          if (scanningGradStack.gradStacka != null) {
            if (this.backgroundViaCanvas) {
              radgrad = this.backgroundSceneContext.createLinearGradient(this.canvasForBackground.width / 2, 0, this.canvasForBackground.width / 2, this.canvasForBackground.height);
              radgrad.addColorStop(0, color.toString(scanningGradStack.gradStacka));
              radgrad.addColorStop(0.5, color.toString(scanningGradStack.gradStackb));
              radgrad.addColorStop(1, color.toString(scanningGradStack.gradStackc));
              this.backgroundSceneContext.globalAlpha = 1.0;
              this.backgroundSceneContext.fillStyle = radgrad;
              this.backgroundSceneContext.fillRect(0, 0, this.canvasForBackground.width, this.canvasForBackground.height);
            } else {
              cssString = this.gradientPrefix + "linear-gradient(top,  " + color.toString(scanningGradStack.gradStacka) + " 0%," + color.toString(scanningGradStack.gradStackb) + " 50%," + color.toString(scanningGradStack.gradStackc) + " 100%)," + cssString;
            }
          } else {
            if (this.backgroundViaCanvas) {
              this.backgroundSceneContext.globalAlpha = 1.0;
              this.backgroundSceneContext.fillStyle = color.toString(scanningGradStack.solid);
              this.backgroundSceneContext.fillRect(0, 0, this.canvasForBackground.width, this.canvasForBackground.height);
            } else {
              cssString = this.gradientPrefix + "linear-gradient(top,  " + color.toString(scanningGradStack.solid) + " 0%," + color.toString(scanningGradStack.solid) + " 100%)," + cssString;
            }
          }
        }
        if (!this.backgroundViaCanvas) {
          cssString = cssString.substring(0, cssString.length - 1);
          cssString = cssStringPreamble + cssString + ";";
          if (document.getElementById("backgroundCanvasOrDiv")) {
            return document.getElementById("backgroundCanvasOrDiv").style.cssText = cssString;
          }
        }
      }
    };

    return BackgroundPainter;

  })();
  return BackgroundPainter;
});

/*
//@ sourceMappingURL=background-painter.js.map
*/