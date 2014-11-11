/*
## ProgramRunner manages the running function as it runs. E.g. this is not a
## translation step, this is managing things such as the actually running of the
## latest "stable" function and keeping track of when a function appears
## to be stable, and reinstating the last stable function if the current one
## throws a runtime error.
*/

var isFunction;

isFunction = function(functionToCheck) {
  var getType;
  getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
};

define(function() {
  var ProgramRunner;
  ProgramRunner = (function() {
    var consecutiveFramesWithoutRunTimeError, currentCodeString, doOnceOccurrencesLineNumbers, drawFunction, lastStableDrawFunction;

    doOnceOccurrencesLineNumbers = [];

    drawFunction = "";

    consecutiveFramesWithoutRunTimeError = 0;

    lastStableDrawFunction = null;

    currentCodeString = "";

    function ProgramRunner(eventRouter, liveCodeLabCoreInstance) {
      this.eventRouter = eventRouter;
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
    }

    ProgramRunner.prototype.addToScope = function(scope) {
      var _this = this;
      scope.add('addDoOnce', function(a) {
        return _this.addDoOnce(a);
      });
      return scope.add('run', function(a, b) {
        return _this.run(a, b);
      });
    };

    ProgramRunner.prototype.run = function(functionToBeRun, chainedFunction) {
      if (isFunction(functionToBeRun)) {
        functionToBeRun();
      }
      if (isFunction(chainedFunction)) {
        return chainedFunction();
      }
    };

    ProgramRunner.prototype.addDoOnce = function(lineNum) {
      return this.doOnceOccurrencesLineNumbers.push(lineNum);
    };

    ProgramRunner.prototype.setDrawFunction = function(drawFunc) {
      return this.drawFunction = drawFunc;
    };

    ProgramRunner.prototype.resetTrackingOfDoOnceOccurrences = function() {
      return this.doOnceOccurrencesLineNumbers = [];
    };

    ProgramRunner.prototype.putTicksNextToDoOnceBlocksThatHaveBeenRun = function() {
      var codeCompiler;
      codeCompiler = this.liveCodeLabCoreInstance.codeCompiler;
      if (this.doOnceOccurrencesLineNumbers.length) {
        return this.setDrawFunction(codeCompiler.addCheckMarksAndUpdateCodeAndNotifyChange(codeCompiler, this.doOnceOccurrencesLineNumbers));
      }
    };

    ProgramRunner.prototype.runDrawFunction = function() {
      this.drawFunction();
      this.consecutiveFramesWithoutRunTimeError += 1;
      if (this.consecutiveFramesWithoutRunTimeError === 5) {
        this.lastStableDrawFunction = this.drawFunction;
        return this.eventRouter.emit("livecodelab-running-stably");
      }
    };

    ProgramRunner.prototype.reinstateLastWorkingDrawFunction = function() {
      this.consecutiveFramesWithoutRunTimeError = 0;
      return this.drawFunction = this.lastStableDrawFunction;
    };

    return ProgramRunner;

  })();
  return ProgramRunner;
});

/*
//@ sourceMappingURL=program-runner.js.map
*/