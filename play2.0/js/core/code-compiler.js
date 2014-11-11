/*
## CodeCompiler makes available the user sketch
## (written in simplified syntax) as a runnable javascript function.
## Also note that CodeCompiler might return a program
## that substituted the program passed as input.
## This is because doOnce statements get transformed by pre-prending a
## tick once they are run, which prevents them from being run again.
## Note that CodeCompiler doesn't run the user sketch, it just
## makes it available to the ProgramRunner.
*/

define(['core/code-preprocessor', 'coffeescript'], function(CodePreprocessor, CoffeescriptCompiler) {
  var CodeCompiler;
  return CodeCompiler = (function() {
    CodeCompiler.prototype.currentCodeString = null;

    CodeCompiler.prototype.codePreprocessor = null;

    function CodeCompiler(eventRouter, liveCodeLabCoreInstance) {
      this.eventRouter = eventRouter;
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
      this.codePreprocessor = new CodePreprocessor();
    }

    CodeCompiler.prototype.updateCode = function(code) {
      var compiledOutput, e, error, functionFromCompiledCode, programHasBasicError, _ref;
      this.currentCodeString = code;
      if (code === "") {
        this.liveCodeLabCoreInstance.graphicsCommands.resetTheSpinThingy = true;
        programHasBasicError = false;
        this.eventRouter.emit("clear-error");
        this.liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
        functionFromCompiledCode = new Function("");
        this.liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction(null);
        this.liveCodeLabCoreInstance.drawFunctionRunner.lastStableDrawFunction = null;
        return functionFromCompiledCode;
      }
      _ref = this.codePreprocessor.preprocess(code), code = _ref[0], error = _ref[1];
      if (error != null) {
        this.eventRouter.emit("compile-time-error-thrown", error);
        return;
      }
      try {
        compiledOutput = CoffeescriptCompiler.compile(code, {
          bare: "on"
        });
      } catch (_error) {
        e = _error;
        this.eventRouter.emit("compile-time-error-thrown", e);
        return;
      }
      programHasBasicError = false;
      this.eventRouter.emit("clear-error");
      this.liveCodeLabCoreInstance.drawFunctionRunner.consecutiveFramesWithoutRunTimeError = 0;
      compiledOutput = compiledOutput.replace(/var frame/, ";");
      functionFromCompiledCode = new Function(compiledOutput);
      this.liveCodeLabCoreInstance.drawFunctionRunner.setDrawFunction(functionFromCompiledCode);
      return functionFromCompiledCode;
    };

    CodeCompiler.prototype.addCheckMarksAndUpdateCodeAndNotifyChange = function(CodeCompiler, doOnceOccurrencesLineNumbers) {
      var drawFunction, eachLine, elaboratedSource, elaboratedSourceByLine, _i, _len;
      elaboratedSource = void 0;
      elaboratedSourceByLine = void 0;
      drawFunction = void 0;
      elaboratedSource = this.currentCodeString;
      elaboratedSourceByLine = elaboratedSource.split("\n");
      for (_i = 0, _len = doOnceOccurrencesLineNumbers.length; _i < _len; _i++) {
        eachLine = doOnceOccurrencesLineNumbers[_i];
        elaboratedSourceByLine[eachLine] = elaboratedSourceByLine[eachLine].replace(/(^|\s+)doOnce([ \t]*.*)$/gm, "$1✓doOnce$2");
      }
      elaboratedSource = elaboratedSourceByLine.join("\n");
      this.eventRouter.emit("code-updated-by-livecodelab", elaboratedSource);
      drawFunction = this.updateCode(elaboratedSource);
      return drawFunction;
    };

    return CodeCompiler;

  })();
});

/*
//@ sourceMappingURL=code-compiler.js.map
*/