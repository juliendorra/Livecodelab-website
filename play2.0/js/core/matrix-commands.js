/*
## Takes care of all matrix-related commands.
*/

var isFunction,
  __slice = [].slice;

isFunction = function(functionToCheck) {
  var getType;
  getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
};

define(function() {
  var MatrixCommands;
  MatrixCommands = (function() {
    MatrixCommands.prototype.matrixStack = [];

    function MatrixCommands(liveCodeLabCore_three, liveCodeLabCoreInstance) {
      this.liveCodeLabCore_three = liveCodeLabCore_three;
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
      this.worldMatrix = new this.liveCodeLabCore_three.Matrix4();
    }

    MatrixCommands.prototype.addToScope = function(scope) {
      var _this = this;
      scope.add('pushMatrix', function() {
        return _this.pushMatrix();
      });
      scope.add('discardPushedMatrix', function() {
        return _this.discardPushedMatrix();
      });
      scope.add('popMatrix', function() {
        return _this.popMatrix();
      });
      scope.add('resetMatrix', function() {
        return _this.resetMatrix();
      });
      scope.add('move', function() {
        var theArguments;
        theArguments = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.move.apply(_this, theArguments);
      });
      scope.add('rotate', function() {
        var theArguments;
        theArguments = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.rotate.apply(_this, theArguments);
      });
      return scope.add('scale', function() {
        var theArguments;
        theArguments = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.scale.apply(_this, theArguments);
      });
    };

    MatrixCommands.prototype.getWorldMatrix = function() {
      return this.worldMatrix;
    };

    MatrixCommands.prototype.resetMatrixStack = function() {
      this.matrixStack = [];
      return this.worldMatrix.identity();
    };

    MatrixCommands.prototype.pushMatrix = function() {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      this.matrixStack.push(this.worldMatrix);
      return this.worldMatrix = (new this.liveCodeLabCore_three.Matrix4()).copy(this.worldMatrix);
    };

    MatrixCommands.prototype.discardPushedMatrix = function() {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      if (this.matrixStack.length) {
        return this.matrixStack.pop();
      }
    };

    MatrixCommands.prototype.popMatrix = function() {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      if (this.matrixStack.length) {
        return this.worldMatrix = this.matrixStack.pop();
      } else {
        return this.worldMatrix.identity();
      }
    };

    MatrixCommands.prototype.resetMatrix = function() {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      return this.worldMatrix.identity();
    };

    MatrixCommands.prototype.move = function(a, b, c, d) {
      var appendedFunctionsStartIndex, arg_a, arg_b, arg_c, arg_d, result;
      if (c == null) {
        c = 0;
      }
      if (d == null) {
        d = null;
      }
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      arg_a = a;
      arg_b = b;
      arg_c = c;
      arg_d = d;
      appendedFunctionsStartIndex = void 0;
      if (typeof arg_a !== "number") {
        if (isFunction(arg_a)) {
          appendedFunctionsStartIndex = 0;
        }
        arg_a = Math.sin(this.liveCodeLabCoreInstance.timeKeeper.beat() / 2 * Math.PI);
        arg_b = Math.cos(this.liveCodeLabCoreInstance.timeKeeper.beat() / 2 * Math.PI);
        arg_c = arg_a;
      } else if (typeof arg_b !== "number") {
        if (isFunction(arg_b)) {
          appendedFunctionsStartIndex = 1;
        }
        arg_b = arg_a;
        arg_c = arg_a;
      } else if (typeof arg_c !== "number") {
        if (isFunction(arg_c)) {
          appendedFunctionsStartIndex = 2;
        }
        arg_c = 0;
      } else if (isFunction(arg_d)) {
        appendedFunctionsStartIndex = 3;
      }
      if (appendedFunctionsStartIndex != null) {
        this.pushMatrix();
      }
      this.worldMatrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeTranslation(arg_a, arg_b, arg_c));
      if (appendedFunctionsStartIndex != null) {
        while (isFunction(arguments[appendedFunctionsStartIndex])) {
          result = arguments[appendedFunctionsStartIndex]();
          if (result === null) {
            discardPushedMatrix();
            return;
          }
          appendedFunctionsStartIndex++;
        }
        return this.popMatrix();
      }
    };

    MatrixCommands.prototype.rotate = function(a, b, c, d) {
      var appendedFunctionsStartIndex, arg_a, arg_b, arg_c, arg_d, result;
      if (c == null) {
        c = 0;
      }
      if (d == null) {
        d = null;
      }
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      arg_a = a;
      arg_b = b;
      arg_c = c;
      arg_d = d;
      appendedFunctionsStartIndex = void 0;
      if (typeof arg_a !== "number") {
        if (isFunction(arg_a)) {
          appendedFunctionsStartIndex = 0;
        }
        arg_a = this.liveCodeLabCoreInstance.timeKeeper.beat() / 4 * Math.PI;
        arg_b = arg_a;
        arg_c = 0;
      } else if (typeof arg_b !== "number") {
        if (isFunction(arg_b)) {
          appendedFunctionsStartIndex = 1;
        }
        arg_b = arg_a;
        arg_c = arg_a;
      } else if (typeof arg_c !== "number") {
        if (isFunction(arg_c)) {
          appendedFunctionsStartIndex = 2;
        }
        arg_c = 0;
      } else if (isFunction(arg_d)) {
        appendedFunctionsStartIndex = 3;
      }
      if (appendedFunctionsStartIndex != null) {
        this.pushMatrix();
      }
      this.worldMatrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeRotationFromEuler(new this.liveCodeLabCore_three.Euler(arg_a, arg_b, arg_c, 'XYZ')));
      if (appendedFunctionsStartIndex != null) {
        while (isFunction(arguments[appendedFunctionsStartIndex])) {
          result = arguments[appendedFunctionsStartIndex]();
          if (result === null) {
            discardPushedMatrix();
            return;
          }
          appendedFunctionsStartIndex++;
        }
        return this.popMatrix();
      }
    };

    MatrixCommands.prototype.scale = function(a, b, c, d) {
      var appendedFunctionsStartIndex, arg_a, arg_b, arg_c, arg_d, result;
      if (c == null) {
        c = 1;
      }
      if (d == null) {
        d = null;
      }
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      arg_a = a;
      arg_b = b;
      arg_c = c;
      arg_d = d;
      appendedFunctionsStartIndex = void 0;
      if (typeof arg_a !== "number") {
        if (isFunction(arg_a)) {
          appendedFunctionsStartIndex = 0;
        }
        arg_a = 0.5 + this.liveCodeLabCoreInstance.timeKeeper.pulse();
        arg_b = arg_a;
        arg_c = arg_a;
      } else if (typeof arg_b !== "number") {
        if (isFunction(arg_b)) {
          appendedFunctionsStartIndex = 1;
        }
        arg_b = arg_a;
        arg_c = arg_a;
      } else if (typeof arg_c !== "number") {
        if (isFunction(arg_c)) {
          appendedFunctionsStartIndex = 2;
        }
        arg_c = 1;
      } else if (isFunction(arg_d)) {
        appendedFunctionsStartIndex = 3;
      }
      if (appendedFunctionsStartIndex != null) {
        this.pushMatrix();
      }
      if (arg_a > -0.000000001 && arg_a < 0.000000001) {
        arg_a = 0.000000001;
      }
      if (arg_b > -0.000000001 && arg_b < 0.000000001) {
        arg_b = 0.000000001;
      }
      if (arg_c > -0.000000001 && arg_c < 0.000000001) {
        arg_c = 0.000000001;
      }
      this.worldMatrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeScale(arg_a, arg_b, arg_c));
      if (appendedFunctionsStartIndex != null) {
        while (isFunction(arguments[appendedFunctionsStartIndex])) {
          result = arguments[appendedFunctionsStartIndex]();
          if (result === null) {
            discardPushedMatrix();
            return;
          }
          appendedFunctionsStartIndex++;
        }
        return this.popMatrix();
      }
    };

    return MatrixCommands;

  })();
  return MatrixCommands;
});

/*
//@ sourceMappingURL=matrix-commands.js.map
*/