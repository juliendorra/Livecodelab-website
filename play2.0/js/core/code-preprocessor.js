/*
## CodePreprocessor takes care of translating the simplified syntax
## of livecodelb to a coffeescript that is degestible by the
## coffeescript compiler.
## This pre-processing step can raise some errors - which are
## returned in a dedicated variable.
##
## In order to run the tests just open the
## console and type:
##   testPreprocessor()
## or, to run a subset (useful for bisection in case something goes wrong):
##   testPreprocessor(rangeMin, rangeMax)
*/

var detailedDebug,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

detailedDebug = false;

define(['core/code-preprocessor-tests', 'core/colour-literals'], function(CodePreprocessorTests, ColourLiterals) {
  var CodePreprocessor;
  window.ifFunctional = function(condition, thenCode, elseCode) {
    return function() {
      var afterBlocks;
      afterBlocks = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (condition) {
        return thenCode.apply(this, afterBlocks);
      } else {
        if (elseCode != null) {
          return elseCode.apply(this, afterBlocks);
        } else {
          if (afterBlocks[0] != null) {
            return afterBlocks[0]();
          }
        }
      }
    };
  };
  return CodePreprocessor = (function() {
    CodePreprocessor.prototype.testCases = null;

    CodePreprocessor.prototype.qualifyingCommands = ["rotate", "move", "scale", "fill", "stroke", "noFill", "noStroke"];

    CodePreprocessor.prototype.primitives = ["rect", "line", "box", "ball", "peg", "run"];

    CodePreprocessor.prototype.commandsExcludingScaleRotateMove = ["ballDetail", "pushMatrix", "popMatrix", "resetMatrix", "bpm", "play", "strokeSize", "animationStyle", "background", "simpleGradient", "colorMode", "lights", "noLights", "ambientLight", "pointLight", "connect"];

    CodePreprocessor.prototype.colorCommands = ["fill", "stroke"];

    CodePreprocessor.prototype.expressions = ["abs", "ceil", "constrain", "dist", "exp", "floor", "lerp", "log", "mag", "map", "max", "min", "norm", "pow", "round", "sq", "sqrt", "acos", "asin", "atan", "atan2", "cos", "degrees", "radians", "sin", "tan", "wave", "beat", "pulse", "random", "randomSeed", "noise", "noiseDetail", "noiseSeed", "color"];

    function CodePreprocessor() {
      var colourLiterals, key,
        _this = this;
      this.testCases = (new CodePreprocessorTests()).testCases;
      this.qualifyingCommandsRegex = this.qualifyingCommands.join("|");
      this.primitivesRegex = this.primitives.join("|");
      this.primitivesAndMatrixRegex = this.qualifyingCommandsRegex + "|" + this.primitivesRegex;
      this.allCommandsRegex = (this.commandsExcludingScaleRotateMove.join("|")) + "|" + this.qualifyingCommandsRegex + "|" + this.primitivesRegex;
      this.expressionsRegex = this.expressions.join("|");
      this.colorsRegex = "";
      colourLiterals = new ColourLiterals;
      for (key in colourLiterals.colourNamesValues) {
        if (colourLiterals.colourNamesValues.hasOwnProperty(key)) {
          this.colorsRegex = this.colorsRegex + "|" + key;
        }
      }
      this.colorsRegex = this.colorsRegex.substring(1, this.colorsRegex.length);
      this.colorsCommandsRegex = this.colorCommands.join("|");
      window.testPreprocessor = function(rangeMin, rangeMax) {
        var previousDetailedDebug;
        if (rangeMin == null) {
          rangeMin = void 0;
        }
        if (rangeMax == null) {
          rangeMax = void 0;
        }
        previousDetailedDebug = detailedDebug;
        detailedDebug = false;
        _this.test(rangeMin, rangeMax);
        return detailedDebug = previousDetailedDebug;
      };
    }

    /*
    ## Stops ticked doOnce blocks from running
    ##
    ## doOnce statements which have a tick mark next to them
    ## are not run. This is achieved by replacing the line with
    ## the "doOnce" with "if false" or "//" depending on whether
    ## the doOnce is a multiline or an inline one, like so:
    ##
    ##      ✓doOnce
    ##        background 255
    ##        fill 255,0,0
    ##      ✓doOnce ball
    ##      becomes:
    ##      if false
    ##        background 255
    ##        fill 255,0,0
    ##      //doOnce ball
    ##
    ## @param {string} code    the code to re-write
    ##
    ## @returns {string}
    */


    CodePreprocessor.prototype.removeTickedDoOnce = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/^(\s*)✓[ ]*doOnce[ \t]*$/gm, "$1if false");
      code = code.replace(/^(\s*)✓([ ]*doOnce[ \t]+)/gm, "$1//$2");
      if (detailedDebug) {
        console.log("removeTickedDoOnce\n" + code + " error: " + error);
      }
      if (code.indexOf("✓") !== -1) {
        return [void 0, "✓ must be next to a doOnce"];
      }
      return [code, error];
    };

    CodePreprocessor.prototype.removeStrings = function(code, error) {
      var codeWithoutStrings, stringsTable;
      if (error != null) {
        return [void 0, error];
      }
      stringsTable = [];
      codeWithoutStrings = code.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')/g, function(all, quoted, aposed) {
        var index;
        index = stringsTable.length;
        stringsTable.push(all);
        return "'STRINGS_TABLE>" + index + "<STRINGS_TABLE'";
      });
      return [codeWithoutStrings, stringsTable, error];
    };

    CodePreprocessor.prototype.injectStrings = function(code, stringsTable, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/'STRINGS_TABLE>(\d+)<STRINGS_TABLE'/g, function(all, index) {
        var val;
        val = stringsTable[index];
        return val;
      });
      return [code, error];
    };

    CodePreprocessor.prototype.addTracingInstructionsToDoOnceBlocks = function(code, error) {
      var eachLine, elaboratedSourceByLine, _i, _ref;
      if (error != null) {
        return [void 0, error];
      }
      elaboratedSourceByLine = void 0;
      if (code.indexOf("doOnce") > -1) {
        elaboratedSourceByLine = code.split("\n");
        for (eachLine = _i = 0, _ref = elaboratedSourceByLine.length; 0 <= _ref ? _i < _ref : _i > _ref; eachLine = 0 <= _ref ? ++_i : --_i) {
          elaboratedSourceByLine[eachLine] = elaboratedSourceByLine[eachLine].replace(/(^|\s+)doOnce[ \t]+(.+)$/g, "$1;addDoOnce(" + eachLine + "); 1.times -> $2");
          if (/(^|\s+)doOnce[ \t]*$/g.test(elaboratedSourceByLine[eachLine])) {
            elaboratedSourceByLine[eachLine] = elaboratedSourceByLine[eachLine].replace(/(^|\s+)doOnce[ \t]*$/g, "$11.times ->");
            elaboratedSourceByLine[eachLine + 1] = elaboratedSourceByLine[eachLine + 1].replace(/^(\s*)(.+)$/g, "$1addDoOnce(" + eachLine + "); $2");
          }
        }
        code = elaboratedSourceByLine.join("\n");
      }
      return [code, error];
    };

    CodePreprocessor.prototype.doesProgramContainStringsOrComments = function(code) {
      var characterBeingExamined, nextCharacterBeingExamined;
      characterBeingExamined = void 0;
      nextCharacterBeingExamined = void 0;
      while (code.length) {
        characterBeingExamined = code.charAt(0);
        nextCharacterBeingExamined = code.charAt(1);
        if (characterBeingExamined === "'" || characterBeingExamined === "\"" || (characterBeingExamined === "/" && (nextCharacterBeingExamined === "*" || nextCharacterBeingExamined === "/"))) {
          return true;
        }
        code = code.slice(1);
      }
    };

    CodePreprocessor.prototype.stripCommentsAndStrings = function(code, error) {
      var codeWithoutComments, codeWithoutStringsOrComments;
      if (error != null) {
        return [void 0, void 0, error];
      }
      code = code + "\n";
      codeWithoutComments = void 0;
      codeWithoutStringsOrComments = void 0;
      if (this.doesProgramContainStringsOrComments(code)) {
        code = code.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(\/\/[^\n]*\n)|(\/\*(?:(?!\*\/)(?:.|\n))*\*\/)/g, function(all, quoted, aposed, singleComment, comment) {
          var cycleToRebuildNewLines, numberOfLinesInMultilineComment, rebuiltNewLines, _i;
          numberOfLinesInMultilineComment = void 0;
          rebuiltNewLines = void 0;
          cycleToRebuildNewLines = void 0;
          if (quoted) {
            return quoted;
          }
          if (aposed) {
            return aposed;
          }
          if (singleComment) {
            return "\n";
          }
          numberOfLinesInMultilineComment = comment.split("\n").length - 1;
          rebuiltNewLines = "";
          for (cycleToRebuildNewLines = _i = 0; 0 <= numberOfLinesInMultilineComment ? _i < numberOfLinesInMultilineComment : _i > numberOfLinesInMultilineComment; cycleToRebuildNewLines = 0 <= numberOfLinesInMultilineComment ? ++_i : --_i) {
            rebuiltNewLines = rebuiltNewLines + "\n";
          }
          return rebuiltNewLines;
        });
        codeWithoutComments = code;
        codeWithoutStringsOrComments = code.replace(/("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')/g, "");
      } else {
        codeWithoutStringsOrComments = code;
        codeWithoutComments = code;
      }
      codeWithoutComments = code.substring(0, code.length - 1);
      return [codeWithoutComments, codeWithoutStringsOrComments, error];
    };

    CodePreprocessor.prototype.checkBasicSyntax = function(code, codeWithoutStringsOrComments, error) {
      var aposCount, characterBeingExamined, curlyBrackCount, programHasBasicError, quoteCount, reasonOfBasicError, reasonOfBasicErrorMissing, reasonOfBasicErrorUnbalanced, roundBrackCount, squareBrackCount;
      if (error != null) {
        return [void 0, error];
      }
      aposCount = 0;
      quoteCount = 0;
      roundBrackCount = 0;
      curlyBrackCount = 0;
      squareBrackCount = 0;
      characterBeingExamined = void 0;
      reasonOfBasicError = void 0;
      while (codeWithoutStringsOrComments.length) {
        characterBeingExamined = codeWithoutStringsOrComments.charAt(0);
        if (characterBeingExamined === "'") {
          aposCount += 1;
        } else if (characterBeingExamined === "\"") {
          quoteCount += 1;
        } else if (characterBeingExamined === "(" || characterBeingExamined === ")") {
          roundBrackCount += 1;
        } else if (characterBeingExamined === "{" || characterBeingExamined === "}") {
          curlyBrackCount += 1;
        } else if (characterBeingExamined === "[" || characterBeingExamined === "]") {
          squareBrackCount += 1;
        } else if (characterBeingExamined === ";") {
          return [void 0, "break line instead of using ';'"];
        }
        codeWithoutStringsOrComments = codeWithoutStringsOrComments.slice(1);
      }
      if (aposCount & 1 || quoteCount & 1 || roundBrackCount & 1 || curlyBrackCount & 1 || squareBrackCount & 1) {
        programHasBasicError = true;
        reasonOfBasicError = '';
        reasonOfBasicErrorMissing = '';
        if (aposCount & 1) {
          reasonOfBasicErrorMissing = reasonOfBasicErrorMissing + "', ";
        }
        if (quoteCount & 1) {
          reasonOfBasicErrorMissing = reasonOfBasicErrorMissing + "\", ";
        }
        if ((aposCount & 1) || (quoteCount & 1)) {
          reasonOfBasicErrorMissing = "Missing " + reasonOfBasicErrorMissing;
          reasonOfBasicErrorMissing = reasonOfBasicErrorMissing.substring(0, reasonOfBasicErrorMissing.length - 2);
        }
        reasonOfBasicErrorUnbalanced = '';
        if (roundBrackCount & 1) {
          reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced + "(), ";
        }
        if (curlyBrackCount & 1) {
          reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced + "{}, ";
        }
        if (squareBrackCount & 1) {
          reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced + "[], ";
        }
        if ((roundBrackCount & 1) || (curlyBrackCount & 1) || (squareBrackCount & 1)) {
          reasonOfBasicErrorUnbalanced = "Unbalanced " + reasonOfBasicErrorUnbalanced;
          reasonOfBasicErrorUnbalanced = reasonOfBasicErrorUnbalanced.substring(0, reasonOfBasicErrorUnbalanced.length - 2);
        }
        reasonOfBasicError = reasonOfBasicErrorMissing + " " + reasonOfBasicErrorUnbalanced;
        return [void 0, reasonOfBasicError];
      }
      return [code, error];
    };

    /*
    ## Some of the functions can be used with postfix notation
    ##
    ## e.g.
    ##
    ##      60 bpm
    ##      red fill
    ##      yellow stroke
    ##      black background
    ##
    ## We need to switch this round before coffee script compilation
    adjustPostfixNotations: (code, error) ->
      # if there is an error, just propagate it
      return [undefined, error] if error?
    
      # red background
      # red fill;box
    
      # if there is an error, just propagate it
      return [undefined, error] if error?
    
      code = code.replace(/(\d+)[ ]+bpm(\s|$|;)/g, "bpm $1$2")
      code = code.replace(/([a-zA-Z]+)[ ]+fill(\s|$|;)/g, "fill $1$2")
      code = code.replace(/([a-zA-Z]+)[ ]+stroke(\s|$|;)/g, "stroke $1$2")
      code = code.replace(/([a-zA-Z]+)[ ]+background(\s|$|;)/g, "background $1$2")
      return [code, error]
    */


    CodePreprocessor.prototype.normaliseCode = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/[ ];/gm, "; ");
      if (detailedDebug) {
        console.log("normalise-1:\n" + code + " error: " + error);
      }
      code = code.replace(/;$/gm, "");
      if (detailedDebug) {
        console.log("normalise-2:\n" + code + " error: " + error);
      }
      code = code.replace(/;([^ \r\n])/gm, "; $1");
      if (detailedDebug) {
        console.log("normalise-3:\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.simplifyFunctionDoingSimpleInvocation = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/([\w\d]|,)[\t ]*->[\t ]*([\w\d]*)[\t ]*\([\t ]*\)/gm, "$1 $2");
      if (detailedDebug) {
        console.log("simplifyFunctionDoingSimpleInvocation-1:\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.simplifyFunctionsAloneInParens = function(code, error, userDefinedFunctions, bracketsVariables) {
      var functionsRegex, rx;
      if (error != null) {
        return [void 0, error];
      }
      functionsRegex = this.allCommandsRegex + userDefinedFunctions + bracketsVariables;
      rx = RegExp("\\([ \\t]*(" + functionsRegex + ")[ \\t]*\\)[ \\t]*$", 'gm');
      code = code.replace(rx, "$1");
      if (detailedDebug) {
        console.log("simplifyFunctionsAloneInParens-1:\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.beautifyCode = function(code, error) {
      var allFunctionsRegex, rx;
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/\.times[\\t ]+/gm, ".times ");
      if (detailedDebug) {
        console.log("beautifyCode--1:\n" + code + " error: " + error);
      }
      code = code.replace(/\.times[\\t ]+with[\\t ]+/gm, ".times with ");
      if (detailedDebug) {
        console.log("beautifyCode-0:\n" + code + " error: " + error);
      }
      code = code.replace(/->(?![ \t])/gm, "-> ");
      if (detailedDebug) {
        console.log("beautifyCode-1:\n" + code + " error: " + error);
      }
      code = code.replace(/->[\t ;]+/gm, "-> ");
      if (detailedDebug) {
        console.log("beautifyCode-2:\n" + code + " error: " + error);
      }
      code = code.replace(/->[\t ]+$/gm, "->");
      if (detailedDebug) {
        console.log("beautifyCode-3:\n" + code + " error: " + error);
      }
      code = code.replace(/if[\t ;]+/gm, "if ");
      if (detailedDebug) {
        console.log("beautifyCode-4:\n" + code + " error: " + error);
      }
      code = code.replace(/then[\t ;]+/gm, "then ");
      if (detailedDebug) {
        console.log("beautifyCode-5:\n" + code + " error: " + error);
      }
      code = code.replace(/else[\t ;]+/gm, "else ");
      if (detailedDebug) {
        console.log("beautifyCode-6:\n" + code + " error: " + error);
      }
      code = code.replace(/;[\t ]+/gm, "; ");
      if (detailedDebug) {
        console.log("beautifyCode-7:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*then/g, "$1 then");
      if (detailedDebug) {
        console.log("beautifyCode-8:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*else/g, "$1 else");
      if (detailedDebug) {
        console.log("beautifyCode-9:\n" + code + " error: " + error);
      }
      code = code.replace(/;$/gm, "");
      if (detailedDebug) {
        console.log("beautifyCode-10:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*->/g, "$1 ->");
      if (detailedDebug) {
        console.log("beautifyCode-11:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*!=/g, "$1 !=");
      if (detailedDebug) {
        console.log("beautifyCode-12:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*>=/g, "$1 >=");
      if (detailedDebug) {
        console.log("beautifyCode-13:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*<=/g, "$1 <=");
      if (detailedDebug) {
        console.log("beautifyCode-14:\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;\)])[\t ]*=/g, "$1 =");
      if (detailedDebug) {
        console.log("beautifyCode-15:\n" + code + " error: " + error);
      }
      code = code.replace(/\=([\w\d\(])/g, "= $1");
      if (detailedDebug) {
        console.log("beautifyCode-16:\n" + code + " error: " + error);
      }
      code = code.replace(/\)[\t ]*if/g, "); if");
      if (detailedDebug) {
        console.log("beautifyCode-18:\n" + code + " error: " + error);
      }
      code = code.replace(/,[\t ]*->/gm, ", ->");
      if (detailedDebug) {
        console.log("beautifyCode-18.5:\n" + code + " error: " + error);
      }
      code = code.replace(/;[\t ]+$/gm, "");
      if (detailedDebug) {
        console.log("beautifyCode-19:\n" + code + " error: " + error);
      }
      code = code.replace(/♠/g, "");
      if (detailedDebug) {
        console.log("beautifyCode-20:\n" + code + " error: " + error);
      }
      code = code.replace(/\(\s*(\d+|[$A-Z_][0-9A-Z_$]*)\s*\)\.times/gi, "$1.times");
      if (detailedDebug) {
        console.log("beautifyCode-21:\n" + code + " error: " + error);
      }
      code = code.replace(/\=[\t ]+-/g, "= -");
      if (detailedDebug) {
        console.log("beautifyCode-22:\n" + code + " error: " + error);
      }
      allFunctionsRegex = this.allCommandsRegex + "|" + this.expressionsRegex;
      rx = RegExp("\\( *(" + allFunctionsRegex + ") *\\)", 'g');
      code = code.replace(rx, "$1");
      if (detailedDebug) {
        console.log("beautifyCode-23:\n" + code + " error: " + error);
      }
      code = code.replace(/[ ]*then/g, " then");
      if (detailedDebug) {
        console.log("beautifyCode-24:\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.normaliseTimesNotationFromInput = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/\.times([^\w\d])/gm, " times$1");
      code = code.replace(/(^[\t ]*|[\t ]+)times[\t .]*->/gm, "$1times ");
      code = code.replace(/(^[\t ]*|[\t ]+)times[\t .]*\([\t .]*([\w]*)[\t .]*\)[\t .]*->/gm, "$1times with $2:");
      code = code.replace(/(^[\t ]*|[\t ]+)times[\t .]*with[\t .]*([\w]*)[\t .]*:?[\t .]*->/gm, "$1times with $2:");
      if (detailedDebug) {
        console.log("normaliseTimesNotationFromInput-1:\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.checkBasicErrorsWithTimes = function(code, error) {
      var programHasBasicError, rx;
      if (error != null) {
        return [void 0, error];
      }
      rx = RegExp("(" + this.allCommandsRegex + ")\\s+times(?![\\w\\d])", 'g');
      if (/^\s*times/gm.test(code) || /;\s*times/g.test(code) || /else\s+times/g.test(code) || /then\s+times/g.test(code) || rx.test(code)) {
        programHasBasicError = true;
        return [void 0, "how many times?"];
      }
      return [code, error];
    };

    CodePreprocessor.prototype.unbindFunctionsToArguments = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/⨁/g, "");
      return this.normaliseCode(code, error);
    };

    CodePreprocessor.prototype.bindFunctionsToArguments = function(code, error, userDefinedFunctionsWithArguments) {
      var expsAndUserFunctionsWithArgs, i, rx, _i;
      if (error != null) {
        return [void 0, error];
      }
      rx = RegExp("([^\\w\\d\\r\\n])(" + (this.allCommandsRegex + "|times") + ")(?![\w\d])", 'g');
      code = code.replace(rx, "$1⧻$2");
      if (detailedDebug) {
        console.log("transformTimesSyntax-1\n" + code + " error: " + error);
      }
      expsAndUserFunctionsWithArgs = this.expressionsRegex + userDefinedFunctionsWithArguments;
      rx = RegExp("(^|[^\\w\\d\\r\\n])(" + expsAndUserFunctionsWithArgs + ")([ \\(]+)(?![⧻\\+\\-*/%,⨁])", 'gm');
      for (i = _i = 0; _i < 5; i = ++_i) {
        code = code.replace(rx, "$1$2$3⨁");
        if (detailedDebug) {
          console.log("transformTimesSyntax-2\n" + code + " error: " + error);
        }
      }
      code = code.replace(/⧻/g, "");
      return this.normaliseCode(code, error);
    };

    CodePreprocessor.prototype.transformTimesSyntax = function(code, error) {
      var allFunctionsRegex, rx;
      if (error != null) {
        return [void 0, error];
      }
      if (detailedDebug) {
        console.log("transformTimesSyntax-0\n" + code + " error: " + error);
      }
      code = code.replace(/then/g, "then;");
      code = code.replace(/else/g, ";else;");
      code = code.replace(/(([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+) times[:]?(?![\w\d])/g, "♦ ($1).times ->");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3\n" + code + " error: " + error);
      }
      code = code.replace(/\(\((([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+)\)\)\.times /g, "($1).times ");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.2\n" + code + " error: " + error);
      }
      allFunctionsRegex = this.allCommandsRegex + "|" + this.expressionsRegex;
      rx = RegExp("(" + allFunctionsRegex + ")[\\t ]*;[; ]*\\(?(([\\d\\w\\.\\(\\)]+([\\t ]*[\\+\\-*/⨁%,][\\t ]*))+[\\d\\w\\.\\(\\)]+|[\\d\\w\\.\\(\\)]+)\\)\\.times ->", 'g');
      code = code.replace(rx, "$1()♦ ($2).times ->");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.5\n" + code + " error: " + error);
      }
      code = code.replace(/\((([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+)\)[ \.]*times[\\t ]*[:]?[\\t ]*(?![\w\d])/g, ";($1).times ");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.55\n" + code + " error: " + error);
      }
      code = code.replace(/[ ](([\d\w\.\(\)]+([\t ]*[\+\-*\/⨁%,][\t ]*))+[\d\w\.\(\)]+|[\d\w\.\(\)]+)\.times[\t ]*[:]?[\t ]*(?![\w\d])/g, "; $1.times ");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.56\n" + code + " error: " + error);
      }
      code = code.replace(/⨁;/g, "");
      code = code.replace(/->[\t ]*[♦;\t ]*[\t ]*\(/g, "-> (");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.57\n" + code + " error: " + error);
      }
      code = code.replace(/then[\t ]*[♦;\t ]*[\t ]*\(/g, "then (");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.57\n" + code + " error: " + error);
      }
      code = code.replace(/->\s*;/g, "->");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.6\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d;])[\t ]?;[; ]+\(/g, "$1; (");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.7\n" + code + " error: " + error);
      }
      code = code.replace(/\)[ ]*;[; ]+\(/g, "); (");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.75\n" + code + " error: " + error);
      }
      code = code.replace(/^([\t ]*);[; ]+\(/gm, "$1(");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.8\n" + code + " error: " + error);
      }
      code = code.replace(/^([\t ]*)[♦;][;♦ ]*/gm, "$1");
      if (detailedDebug) {
        console.log("transformTimesSyntax-3.9\n" + code + " error: " + error);
      }
      code = code.replace(/(\()\s*([\w\d])([^;\r\n]*) times[:]?([^\w\d])/g, "$1 ($2$3).times -> $4");
      if (detailedDebug) {
        console.log("transformTimesSyntax-4\n" + code + " error: " + error);
      }
      code = code.replace(/(=)\s*([\w\d])([^;\r\n]*) times[:]?([^\w\d])/g, "$1 ($2$3).times -> $4");
      if (detailedDebug) {
        console.log("transformTimesSyntax-4\n" + code + " error: " + error);
      }
      code = code.replace(/;[ \t]*([\w\d])([^;\r\n]*?) times[:]?([^\w\d])/g, "♦ ($1$2).times -> $3");
      if (detailedDebug) {
        console.log("transformTimesSyntax-5\n" + code + " error: " + error);
      }
      code = code.replace(/if\s*;/g, "if");
      code = code.replace(/then\s*;/g, "then");
      code = code.replace(/else\s*;/g, "else");
      if (detailedDebug) {
        console.log("transformTimesSyntax-5.5\n" + code + " error: " + error);
      }
      code = code.replace(/(->)\s+([\w\d])(.*?) times[:]?([^\w\d])/g, "$1 ($2$3).times -> $4");
      if (detailedDebug) {
        console.log("transformTimesSyntax-6\n" + code + " error: " + error);
      }
      code = code.replace(/([\w\d])(.*?) times[:]?([^\w\d])/g, "($1$2).times -> $3");
      if (detailedDebug) {
        console.log("transformTimesSyntax-7\n" + code + " error: " + error);
      }
      code = code.replace(/;+[\t ]*else/g, " else");
      if (detailedDebug) {
        console.log("transformTimesSyntax-8\n" + code + " error: " + error);
      }
      code = code.replace(/^(\t*) else/gm, "$1else");
      if (detailedDebug) {
        console.log("transformTimesSyntax-9\n" + code + " error: " + error);
      }
      return this.normaliseCode(code, error);
    };

    CodePreprocessor.prototype.transformTimesWithVariableSyntax = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/\.times[\t ]*with[\t ]*(\w+)[\t ]*(:|;|,[\t ]*->)?/g, ".timesWithVariable -> ($1) $2");
      if (detailedDebug) {
        console.log("transformTimesWithVariableSyntax-1\n" + code + " error: " + error);
      }
      code = code.replace(/\.times[\t ]*->[\t ]*with[\t ]*(\w+)[\t ]*(:|;|,[\t ]*->)?/g, ".timesWithVariable -> ($1) ->");
      if (detailedDebug) {
        console.log("transformTimesWithVariableSyntax-2\n" + code + " error: " + error);
      }
      code = code.replace(/\.timesWithVariable[\t ]*->[\t ]*/g, ".timesWithVariable ");
      if (detailedDebug) {
        console.log("transformTimesWithVariableSyntax-3\n" + code + " error: " + error);
      }
      return this.normaliseCode(code, error);
    };

    CodePreprocessor.prototype.adjustFunctionalReferences = function(code, error, userDefinedFunctions, bracketsVariables) {
      var allFunctionsRegex, expressionsAndUserDefinedFunctionsRegex, rx;
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/->/g, "→");
      expressionsAndUserDefinedFunctionsRegex = this.expressionsRegex + userDefinedFunctions + bracketsVariables;
      allFunctionsRegex = this.allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex;
      rx = RegExp("<[\\s]*((" + allFunctionsRegex + ")[\\t ]*)>", 'gm');
      code = code.replace(rx, "($1♠)");
      rx = RegExp("<[\\s]*((" + allFunctionsRegex + ")[^\\r\\n]*?)>", 'gm');
      code = code.replace(rx, "((parametersForBracketedFunctions)->($1, -> (if parametersForBracketedFunctions? then parametersForBracketedFunctions() else null)))");
      code = code.replace(/→/g, "->");
      if (detailedDebug) {
        console.log("adjustFunctionalReferences-1\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.fixParamPassingInBracketedFunctions = function(code, error, userDefinedFunctions) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/\(\),? -> \(if parametersForBracketedFunctions/g, " -> (if parametersForBracketedFunctions");
      if (detailedDebug) {
        console.log("fixParamPassingInBracketedFunctions-1\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.adjustImplicitCalls = function(code, error, userDefinedFunctions, userDefinedFunctionsWithArguments, bracketsVariables) {
      var allFunctionsRegex, delimitersForCommands, delimitersForExpressions, expressionsAndUserDefinedFunctionsRegex, i, rx, _i, _j, _k;
      if (error != null) {
        return [void 0, error];
      }
      expressionsAndUserDefinedFunctionsRegex = this.expressionsRegex + userDefinedFunctions + bracketsVariables;
      allFunctionsRegex = this.allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex + bracketsVariables;
      if (detailedDebug) {
        console.log("adjustImplicitCalls-1\n" + code + " error: " + error);
      }
      rx = RegExp("^([ \\t]*)(" + allFunctionsRegex + ")[ ]*$", 'gm');
      code = code.replace(rx, "$1$2();");
      if (detailedDebug) {
        console.log("adjustImplicitCalls-2\n" + code + " error: " + error);
      }
      rx = RegExp("^([ \\t]*)(" + allFunctionsRegex + ")[ ]*;", 'gm');
      code = code.replace(rx, "$1$2();");
      if (detailedDebug) {
        console.log("adjustImplicitCalls-3\n" + code + " error: " + error);
      }
      delimitersForCommands = ":|;|\\,|\\?|\\)|//|\\#|\\s+if|\\s+else|\\s+then";
      delimitersForExpressions = delimitersForCommands + "|" + "\\+|-|\\*|/|%|&|]|<|>|==|!=|>=|<=|!(?![=])|\\s+and\\s+|\\s+or\\s+|\\s+not\\s+|\\|";
      code = code.replace(/->/g, "→");
      if (detailedDebug) {
        console.log("adjustImplicitCalls-4 brackets vars:" + bracketsVariables);
      }
      rx = RegExp("([^\\w\\d\\r\\n])(" + this.allCommandsRegex + bracketsVariables + ")[ \\t]*(" + delimitersForCommands + ")", 'g');
      for (i = _i = 1; _i <= 2; i = ++_i) {
        code = code.replace(rx, "$1$2()$3");
      }
      if (detailedDebug) {
        console.log("adjustImplicitCalls-4\n" + code + " error: " + error);
      }
      rx = RegExp("([^\\w\\d\\r\\n])(" + expressionsAndUserDefinedFunctionsRegex + ")([ \\t]*)(" + delimitersForExpressions + ")", 'g');
      for (i = _j = 1; _j <= 2; i = ++_j) {
        code = code.replace(rx, "$1$2()$3$4");
      }
      if (detailedDebug) {
        console.log("adjustImplicitCalls-5\n" + code + " error: " + error);
      }
      userDefinedFunctionsWithArguments = userDefinedFunctionsWithArguments.substring(1);
      if (userDefinedFunctionsWithArguments !== "") {
        rx = RegExp("([^\\w\\d\\r\\n])(" + userDefinedFunctionsWithArguments + ")\\(\\)", 'g');
        for (i = _k = 1; _k <= 2; i = ++_k) {
          code = code.replace(rx, "$1$2");
        }
        if (detailedDebug) {
          console.log("adjustImplicitCalls-6\n" + code + " error: " + error);
        }
      }
      rx = RegExp("([^\\w\\d\\r\\n])(" + allFunctionsRegex + ")[ \\t]*$", 'gm');
      code = code.replace(rx, "$1$2()");
      code = code.replace(/→/g, "->");
      if (detailedDebug) {
        console.log("adjustImplicitCalls-7\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.addCommandsSeparations = function(code, error, userDefinedFunctions) {
      var allFunctionsRegex, expressionsAndUserDefinedFunctionsRegex, rx;
      if (error != null) {
        return [void 0, error];
      }
      expressionsAndUserDefinedFunctionsRegex = this.expressionsRegex + userDefinedFunctions;
      allFunctionsRegex = this.allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex;
      rx = RegExp("(" + this.allCommandsRegex + ")([ \\t]*)(" + this.allCommandsRegex + ")([ ]*)($)?", 'gm');
      code = code.replace(rx, "$1();$2$3$4$5");
      if (detailedDebug) {
        console.log("addCommandsSeparations 1: " + code);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.findQualifiers = function(code, error, bracketsVariables) {
      var previousCodeTransformations, primitivesAndMatrixAndDiamondRegex, replacement, rx;
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/([^\w\d;])then(?![\w\d])/g, "$1;then");
      code = code.replace(/([^\w\d;])else(?![\w\d])/g, "$1;else");
      code = code.replace(/\s*>\s*,/g, "♠");
      primitivesAndMatrixAndDiamondRegex = this.primitivesAndMatrixRegex + bracketsVariables + '|♦';
      previousCodeTransformations = '';
      code = code.replace(/->/g, "→");
      while (code !== previousCodeTransformations) {
        previousCodeTransformations = code;
        rx = RegExp("(^|[^\\w\\d\\r\\n])(" + this.primitivesAndMatrixRegex + bracketsVariables + ")(?![\\w\\d\\(])([^\\r\\n;'♠→]*?)(" + primitivesAndMatrixAndDiamondRegex + ")([^\\w\\d\\r\\n]*)", 'gm');
        replacement = '$1$2ing❤QUALIFIER$3$4$5';
        code = code.replace(rx, replacement);
      }
      code = code.replace(/→/g, "->");
      code = code.replace(/♠/g, ">,");
      if (detailedDebug) {
        console.log("findQualifiers 4: " + code);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.fleshOutQualifiers = function(code, error, bracketsVariables, bracketsVariablesArray) {
      var i, previousCodeTransformations, primtvsAndQualsRegex, replacement, rx, _i, _j, _k, _ref, _ref1, _ref2;
      if (error != null) {
        return [void 0, error];
      }
      primtvsAndQualsRegex = '';
      for (i = _i = 0, _ref = this.qualifyingCommands.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        primtvsAndQualsRegex = primtvsAndQualsRegex + this.qualifyingCommands[i] + '|' + this.qualifyingCommands[i] + "ing❤QUALIFIER|";
      }
      for (i = _j = 0, _ref1 = this.primitives.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        primtvsAndQualsRegex = primtvsAndQualsRegex + this.primitives[i] + '|' + this.primitives[i] + "ing❤QUALIFIER|";
      }
      for (i = _k = 0, _ref2 = bracketsVariablesArray.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        primtvsAndQualsRegex = primtvsAndQualsRegex + bracketsVariablesArray[i] + '|' + bracketsVariablesArray[i] + "ing❤QUALIFIER|";
      }
      primtvsAndQualsRegex = primtvsAndQualsRegex + '♦';
      previousCodeTransformations = '';
      while (code !== previousCodeTransformations) {
        previousCodeTransformations = code;
        if (detailedDebug) {
          console.log("fleshOutQualifiers 0: @primitivesAndMatrixRegex: " + this.primitivesAndMatrixRegex + " bracketsVariables: " + bracketsVariables + " primtvsAndQualsRegex: " + primtvsAndQualsRegex);
        }
        rx = RegExp("(^|[^\\w\\d\\r\\n])((" + this.primitivesAndMatrixRegex + bracketsVariables + ")ing❤QUALIFIER)(?![\\w\\d\\(])([^\\r\\n;→]*?)(" + primtvsAndQualsRegex + ")([^;\\r\\n]*)(.*)", 'gm');
        replacement = '$1$3$4→ $5$6;$7';
        code = code.replace(rx, replacement);
        if (detailedDebug) {
          console.log("fleshOutQualifiers 1: " + code);
        }
        rx = RegExp("(^|[^\\w\\d\\r\\n])((" + this.primitivesAndMatrixRegex + bracketsVariables + ")ing❤QUALIFIER)(?![\\w\\d\\(])([^\\r\\n;→♦❤]*?)♦", 'g');
        replacement = '$1$3$4 →';
        code = code.replace(rx, replacement);
        if (detailedDebug) {
          console.log("fleshOutQualifiers 2: " + code);
        }
      }
      code = code.replace(/<→/g, "→ <");
      code = code.replace(/♦[♦\t ]*/g, "; ");
      code = code.replace(/;+[\t ]*else/gm, " else");
      code = code.replace(/^(\t*) else/gm, "$1else");
      code = code.replace(/\);([; ]*)/g, "); ");
      code = code.replace(/->\s*→/g, "->");
      code = code.replace(/→\s*->/g, "->");
      if (detailedDebug) {
        console.log("fleshOutQualifiers 7: " + code);
      }
      rx = RegExp("(^|[^\\w\\d\\r\\n])(" + this.primitivesAndMatrixRegex + bracketsVariables + ")(?![\\w\\d\\(])(\\s*\\(?→)", 'gm');
      replacement = '$1$2 ->';
      code = code.replace(rx, replacement);
      if (detailedDebug) {
        console.log("fleshOutQualifiers 9: " + code);
      }
      code = code.replace(/([^,])\s+([\(]?)→/g, "$1, $2->");
      if (detailedDebug) {
        console.log("fleshOutQualifiers 10: " + code);
      }
      code = code.replace(/→/g, "->");
      if (detailedDebug) {
        console.log("fleshOutQualifiers 11: " + code);
      }
      code = code.replace(/;+[\t ]*else/g, " else");
      code = code.replace(/^(\t*) else/gm, "$1else");
      code = code.replace(/;*[\t ]*then/g, " then");
      return [code, error];
    };

    CodePreprocessor.prototype.wasFunctionNameAlreadyFound = function(str, strArray) {
      var j;
      j = 0;
      while (j < strArray.length) {
        if (strArray[j].match(str)) {
          return true;
        }
        j++;
      }
      return false;
    };

    CodePreprocessor.prototype.findUserDefinedFunctions = function(code, error) {
      var functionName, match, rx, userDefinedFunctions, userDefinedFunctionsWithArguments;
      if (error != null) {
        return [void 0, error];
      }
      userDefinedFunctions = [];
      userDefinedFunctionsWithArguments = [];
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*->", 'gm');
      while (match = rx.exec(code)) {
        userDefinedFunctions.push(match[1]);
      }
      if (detailedDebug) {
        console.log("findUserDefinedFunctions-1\n" + code + " error: " + error);
      }
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*\\([ \\t]*\\)[ \\t]*->", 'gm');
      while (match = rx.exec(code)) {
        userDefinedFunctions.push(match[1]);
      }
      if (detailedDebug) {
        console.log("findUserDefinedFunctions-2\n" + code + " error: " + error);
      }
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*[\\(-]([^>\\r\\n]*)>", 'gm');
      while (match = rx.exec(code)) {
        functionName = match[1];
        if (!this.wasFunctionNameAlreadyFound(functionName, userDefinedFunctions)) {
          userDefinedFunctions.push(functionName);
          userDefinedFunctionsWithArguments.push(functionName);
        }
      }
      if (detailedDebug) {
        console.log("findUserDefinedFunctions-3\n" + code + " error: " + error);
      }
      userDefinedFunctions = userDefinedFunctions.join("|");
      if (userDefinedFunctions !== "") {
        userDefinedFunctions = "|" + userDefinedFunctions;
      }
      userDefinedFunctionsWithArguments = userDefinedFunctionsWithArguments.join("|");
      if (userDefinedFunctionsWithArguments !== "") {
        userDefinedFunctionsWithArguments = "|" + userDefinedFunctionsWithArguments;
      }
      return [code, error, userDefinedFunctions, userDefinedFunctionsWithArguments];
    };

    CodePreprocessor.prototype.findBracketVariables = function(code, error) {
      var bracketsVariables, bracketsVariablesArray, match, rx;
      if (error != null) {
        return [void 0, error];
      }
      bracketsVariablesArray = [];
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*<", 'gm');
      while (match = rx.exec(code)) {
        bracketsVariablesArray.push(match[1]);
        if (detailedDebug) {
          console.log("findbracketsVariables-1 pushing " + match[1]);
        }
      }
      if (detailedDebug) {
        console.log("findbracketsVariables-2\n" + code + " error: " + error);
      }
      bracketsVariables = bracketsVariablesArray.join("|");
      if (bracketsVariables !== "") {
        bracketsVariables = "|" + bracketsVariables;
      }
      if (detailedDebug) {
        console.log("bracketsVariables: >" + bracketsVariables + "<");
      }
      rx = RegExp("([a-zA-Z\\d]+)([ \\t]*)=[ \\t]*<", 'gm');
      code = code.replace(rx, "BRACKETVAR$1BRACKETVAR = <");
      if (detailedDebug) {
        console.log("findbracketsVariables-3\n" + code + " error: " + error);
      }
      return [code, error, bracketsVariables, bracketsVariablesArray];
    };

    CodePreprocessor.prototype.putBackBracketVarOriginalName = function(code, error) {
      var rx;
      if (error != null) {
        return [void 0, error];
      }
      rx = RegExp("BRACKETVAR([a-zA-Z\\d]+)BRACKETVAR", 'gm');
      code = code.replace(rx, "$1");
      if (detailedDebug) {
        console.log("putBackBracketVarOriginalName-1\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.evaluateAllExpressions = function(code, error, userDefinedFunctions) {
      var allFunctionsRegex, delimitersForCommandsMod, delimitersForExpressions, expressionsAndUserDefinedFunctionsRegex, rx;
      if (error != null) {
        return [void 0, error];
      }
      expressionsAndUserDefinedFunctionsRegex = this.expressionsRegex + userDefinedFunctions;
      allFunctionsRegex = this.allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex;
      rx = RegExp("(" + expressionsAndUserDefinedFunctionsRegex + ")([ \\t]*)times", 'g');
      code = code.replace(rx, "$1()$2times");
      rx = RegExp("([^;>\\( \\t\\r\\n])([ ])(" + this.allCommandsRegex + ")([^\\w\\d\\r\\n])", 'gm');
      code = code.replace(rx, "$1;$2$3$4");
      if (detailedDebug) {
        console.log("evaluateAllExpressions-1\n" + code + " error: " + error);
      }
      code = code.replace(/else;/g, "else");
      rx = RegExp("([^\\w\\d\\r\\n])(" + allFunctionsRegex + ")([ \\t]*);", 'g');
      code = code.replace(rx, "$1$2();");
      if (detailedDebug) {
        console.log("evaluateAllExpressions-2\n" + code + " error: " + error);
      }
      rx = RegExp("([^\\w\\d\\r\\n])(" + allFunctionsRegex + ")([ \\t]*)$", 'gm');
      code = code.replace(rx, "$1$2();");
      if (detailedDebug) {
        console.log("evaluateAllExpressions-3\n" + code + " error: " + error);
      }
      delimitersForCommandsMod = ":|;|\\,|\\?|//|\\#|\\selse|\\sthen";
      delimitersForExpressions = delimitersForCommandsMod + "|if|" + "\\+|-|\\*|/|%|&|]|<|>|=|\\|";
      delimitersForExpressions = delimitersForExpressions + userDefinedFunctions;
      rx = RegExp("(" + delimitersForExpressions + ")([ \\t]*);", 'g');
      code = code.replace(rx, "$1$2");
      if (detailedDebug) {
        console.log("evaluateAllExpressions-4\n" + code + " error: " + error);
      }
      return this.normaliseCode(code, error);
    };

    CodePreprocessor.prototype.adjustDoubleSlashSyntaxForComments = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/\/\//g, "#");
      return [code, error];
    };

    CodePreprocessor.prototype.removeDoubleChevrons = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/>>/g, " ");
      return [code, error];
    };

    /*
    Errors cases, subdivided by number of colors involved
    
    --- 0 colors
    stroke stroke -> redundant stroke
    fill fill -> redundant fill
    
    --- 1 color
    stroke color1 stroke -> redundant stroke
    fill color1 fill -> redundant fill
    noColor fill color stroke noColor -> missing color
    
    ---2 colors
    noFill/Stroke color color noFill/Stroke -> redundant color
    fill color color noFill/Stroke -> redundant color
    noFill/Stroke color color fill -> redundant color
    noFill/Stroke color fill colour noFill/Stroke
    
    ----3 colors
    color stroke/fill color color
    color color stroke/fill color
    color color color
    */


    CodePreprocessor.prototype.rearrangeColorCommands = function(code, error) {
      var rx;
      if (error != null) {
        return [void 0, error];
      }
      if (/(^[\\t ]*|[^\w\d\r\n])stroke[\t ]+stroke([^\w\d\r\n]|$)/gm.test(code)) {
        return [void 0, "redundant stroke"];
      }
      if (/(^[\\t ]*|[^\w\d\r\n])fill[\t ]+fill([^\w\d\r\n]|$)/gm.test(code)) {
        return [void 0, "redundant fill"];
      }
      rx = RegExp("(^[\\t ]*|;| )([\\t ]*)(" + this.colorsRegex + ")(?![\\w\\d])", 'gm');
      code = code.replace(rx, "$1$2♦$3♦");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-1\n" + code + " error: " + error);
      }
      rx = RegExp("(^[\\t ]*|[^\\w\\d\\r\\n])stroke[\\t ]+♦([^♦]*)♦[\\t ]+stroke([^\\w\\d\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        return [void 0, "redundant stroke"];
      }
      rx = RegExp("(^[\\t ]*|[^\\w\\d\\r\\n])fill[\\t ]+♦([^♦]*)♦[\\t ]+fill([^\\w\\d\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        return [void 0, "redundant fill"];
      }
      rx = RegExp("(^[\\t ]*| )♦([^♦]*)♦[\\t ]+(" + this.colorsCommandsRegex + ")[\\t ]+♦([^♦]*)♦[\\t ]+♦([^♦]*)♦([^\\w\\d\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        return [void 0, "redundant color"];
      }
      rx = RegExp("(^[\\t ]*| )♦([^♦]*)♦[\\t ]+♦([^♦]*)♦[\\t ]+(" + this.colorsCommandsRegex + ")[\\t ]+♦([^♦]*)♦([^\\w\\d\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        return [void 0, "redundant color"];
      }
      rx = RegExp("(^[\\t ]*| )♦([^♦]*)♦[\\t ]+♦([^♦]*)♦[\\t ]+♦([^♦]*)♦( |$)", 'gm');
      if (rx.test(code)) {
        return [void 0, "redundant color"];
      }
      rx = RegExp("(^[\\t ]*|[^♦\\r\\n][\\t ]+)(" + this.colorsCommandsRegex + ")[\\t ]+♦([^♦]*)♦[\\t ]+(" + this.colorsCommandsRegex + ")[\\t ]+([^♦\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        return [void 0, "missing color"];
      }
      rx = RegExp("(^|;| )([\\t ]*)(" + this.colorsCommandsRegex + ")(?![\\w\\d])", 'gm');
      code = code.replace(rx, "$1$2♠$3♠");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-2\n" + code + " error: " + error);
      }
      rx = RegExp("(^[\\t ]*|[^♦\\r\\n][\\t ]+)♠(" + this.colorsCommandsRegex + ")♠[\\t ]+♦([^♦]*)♦[\\t ]+♦([^♦]*)♦[\\t ]+([^♠\\r\\n]*|$)", 'gm');
      code = code.replace(rx, "$1♠$2♠ ♦$3♦ fill ♦$4♦ $5");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-2.5\n" + code + " error: " + error);
      }
      rx = RegExp("(^[\\t ]*|[^♠\\r\\n][\\t ]+)♦([^♦]*)♦[\\t ]+♠(" + this.colorsCommandsRegex + ")♠[\\t ]+♦([^♦]*)♦[\\t ]+([^♠\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        if (detailedDebug) {
          console.log("missing color command - 3");
        }
        return [void 0, "missing color command"];
      }
      rx = RegExp("(^[\\t ]*|[^♠\\r\\n][\\t ]+)♦([^♦]*)♦[\\t ]+♦([^♦]*)♦[\\t ]+([^♠\\r\\n]|$)", 'gm');
      if (rx.test(code)) {
        if (detailedDebug) {
          console.log("redundant color");
        }
        return [void 0, "redundant color"];
      }
      rx = RegExp("^([\\t ]*)♦([^♦]*)♦([ \\t]*)$", 'gm');
      code = code.replace(rx, "$1♠fill♠ ♦$2♦ $3");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-3\n" + code + " error: " + error);
      }
      rx = RegExp("(^[\\t ]*|; |([\\w\\d] *))♦([^♦]*)♦[ \\t]+([^♠\\r\\n])", 'gm');
      code = code.replace(rx, "$1♠fill♠ ♦$3♦ $4");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-3\n" + code + " error: " + error);
      }
      rx = RegExp("([\\t ]*)♦([^♦]*)♦[\\t ]+([,][\\t ]*)(([\\d\\w\\.\\(\\),]+([\\t ]*[\\+\\-*\\/⨁%,][\\t ]*))+[\\d\\w\\.\\(\\)]+|[\\d\\w\\.\\(\\)]+)*[\\t ]+♦([^♦]*)♦[\\t ]+♠(" + this.colorsCommandsRegex + ")♠[\\t ]+(?!♦)", 'gm');
      code = code.replace(rx, "$1♦$2♦$3$4 ♠$7♠ ♦$6♦");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-4\n" + code + " error: " + error);
      }
      rx = RegExp("(^[\\t ]*|[^♠\\r\\n][\\t ]*)♦([^♦]*)♦[\\t ]*♠(" + this.colorsCommandsRegex + ")♠([\\t ]+(?!♦)|$)", 'gm');
      code = code.replace(rx, "$1♠$3♠ ♦$2♦ $4");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-5\n" + code + " error: " + error);
      }
      rx = RegExp("(^[\\t ]*|[^♠\\r\\n][\\t ]*)♦([^♦]*)♦[\\t ]*♠(" + this.colorsCommandsRegex + ")♠[\\t ]*♠", 'gm');
      code = code.replace(rx, "$1♠$3♠ ♦$2♦ ");
      if (detailedDebug) {
        console.log("rearrangeColorCommands-6\n" + code + " error: " + error);
      }
      code = code.replace(/[♠♦]/g, "");
      return [code, error];
    };

    CodePreprocessor.prototype.avoidLastArgumentInvocationOverflowing = function(code, error, userDefinedFunctionsWithArguments) {
      var expsAndUserFunctionsWithArgs, i, match, match2, match3, numOfExpr, previousCodeTransformations, qualifyingFunctionsRegex, rx, rx2, _i;
      if (error != null) {
        return [void 0, error];
      }
      expsAndUserFunctionsWithArgs = this.expressionsRegex + userDefinedFunctionsWithArguments;
      qualifyingFunctionsRegex = this.qualifyingCommandsRegex + userDefinedFunctionsWithArguments;
      rx = RegExp(",\\s*(\\()(" + this.primitivesRegex + ")", 'g');
      code = code.replace(rx, ", ->★$2");
      rx = RegExp(", *->", 'g');
      code = code.replace(rx, "☆");
      while (code !== previousCodeTransformations) {
        previousCodeTransformations = code;
        rx = RegExp("(" + qualifyingFunctionsRegex + ")([^☆\\r\\n]*)(☆)", '');
        match = rx.exec(code);
        if (!match) {
          code = code.replace(rx, "$1$2, →");
          continue;
        }
        match2 = match[2];
        rx2 = RegExp("((" + expsAndUserFunctionsWithArgs + ") +)", 'g');
        match3 = match2.match(rx2);
        if (!match3) {
          code = code.replace(rx, "$1$2, →");
          continue;
        }
        numOfExpr = match3.length;
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing--1 number of matches: " + match3.length);
        }
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing--1 finding qualifiers in: " + match2);
        }
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing--1 finding using regex: " + rx2);
        }
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing--1 number of parens to add: " + numOfExpr);
        }
        code = code.replace(rx, "$1$2" + (Array(numOfExpr + 1).join(")")) + "$3");
        for (i = _i = 0; 0 <= numOfExpr ? _i < numOfExpr : _i > numOfExpr; i = 0 <= numOfExpr ? ++_i : --_i) {
          rx = RegExp("(" + qualifyingFunctionsRegex + ")([^☆]*)((" + expsAndUserFunctionsWithArgs + ") +)([^☆\\r\\n]*)(☆)", '');
          if (detailedDebug) {
            console.log("avoidLastArgumentInvocationOverflowing-0 regex: " + rx);
          }
          if (detailedDebug) {
            console.log("avoidLastArgumentInvocationOverflowing-0 on: " + code);
          }
          code = code.replace(rx, "$1$2$4($5☆");
        }
        rx = RegExp("(" + qualifyingFunctionsRegex + ")([^☆]*)((" + expsAndUserFunctionsWithArgs + ") *)([^☆\\r\\n]*)(☆)", '');
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing-0.5 regex: " + rx);
        }
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing-0.5 on: " + code);
        }
        code = code.replace(rx, "$1$2$4$5, →");
        if (detailedDebug) {
          console.log("avoidLastArgumentInvocationOverflowing-1\n" + code + " error: " + error);
        }
      }
      code = code.replace(/☆/g, ", ->");
      code = code.replace(/→/g, "->");
      code = code.replace(/, ->★/g, ", (");
      while (code !== previousCodeTransformations) {
        previousCodeTransformations = code;
        code = code.replace(/\(\(\)\)/g, "()");
      }
      return [code, error];
    };

    CodePreprocessor.prototype.substituteIfsInBracketsWithFunctionalVersion = function(code, error) {
      if (error != null) {
        return [void 0, error];
      }
      code = code.replace(/(\w+\s*=\s*<\s*if\s*.*)>(.*>)/g, "$1›$2");
      code = code.replace(/(\w+)\s*=\s*<\s*if\s*(.*)(>)/g, "$1 = ifFunctional($2>)");
      code = code.replace(/(\w+\s*=\s*ifFunctional\s*.*)then(.*>\))/g, "$1,<$2");
      code = code.replace(/(\w+\s*=\s*ifFunctional\s*.*)else(.*>\))/g, "$1>, <$2");
      code = code.replace(/›/g, ">");
      if (detailedDebug) {
        console.log("substituteIfsInBracketsWithFunctionalVersion-1\n" + code + " error: " + error);
      }
      return [code, error];
    };

    CodePreprocessor.prototype.preprocess = function(code, bracketsVariables) {
      var a, bracketsVariablesArray, codeWithoutStringsOrComments, error, ignore, stringsTable, userDefinedFunctions, userDefinedFunctionsWithArguments, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref2, _ref20, _ref21, _ref22, _ref23, _ref24, _ref25, _ref26, _ref27, _ref28, _ref29, _ref3, _ref30, _ref31, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      error = void 0;
      if (detailedDebug) {
        console.log("preprocess-0\n" + code + " error: " + error);
      }
      _ref = this.removeStrings(code, error), code = _ref[0], stringsTable = _ref[1], error = _ref[2];
      if (detailedDebug) {
        console.log("preprocess-1\n" + code + " error: " + error);
      }
      _ref1 = this.findUserDefinedFunctions(code, error), code = _ref1[0], error = _ref1[1], userDefinedFunctions = _ref1[2], userDefinedFunctionsWithArguments = _ref1[3];
      if (detailedDebug) {
        console.log("preprocess-2\n" + code + " error: " + error);
      }
      _ref2 = this.findBracketVariables(code, error), code = _ref2[0], error = _ref2[1], bracketsVariables = _ref2[2], bracketsVariablesArray = _ref2[3];
      if (detailedDebug) {
        console.log("preprocess-3\n" + code + " error: " + error);
      }
      _ref3 = this.removeTickedDoOnce(code, error), code = _ref3[0], error = _ref3[1];
      if (detailedDebug) {
        console.log("preprocess-4\n" + code + " error: " + error);
      }
      _ref4 = this.stripCommentsAndStrings(code, error), code = _ref4[0], codeWithoutStringsOrComments = _ref4[1], error = _ref4[2];
      if (detailedDebug) {
        console.log("preprocess-5\n" + code + " error: " + error);
      }
      _ref5 = this.checkBasicSyntax(code, codeWithoutStringsOrComments, error), code = _ref5[0], error = _ref5[1];
      if (detailedDebug) {
        console.log("preprocess-6\n" + code + " error: " + error);
      }
      _ref6 = this.substituteIfsInBracketsWithFunctionalVersion(code, error), code = _ref6[0], error = _ref6[1];
      if (detailedDebug) {
        console.log("preprocess-6.5\n" + code + " error: " + error);
      }
      _ref7 = this.removeDoubleChevrons(code, error), code = _ref7[0], error = _ref7[1];
      if (detailedDebug) {
        console.log("preprocess-7\n" + code + " error: " + error);
      }
      _ref8 = this.rearrangeColorCommands(code, error), code = _ref8[0], error = _ref8[1];
      if (detailedDebug) {
        console.log("preprocess-8\n" + code + " error: " + error);
      }
      _ref9 = this.normaliseTimesNotationFromInput(code, error), code = _ref9[0], error = _ref9[1];
      if (detailedDebug) {
        console.log("preprocess-10\n" + code + " error: " + error);
      }
      _ref10 = this.checkBasicErrorsWithTimes(code, error), code = _ref10[0], error = _ref10[1];
      if (detailedDebug) {
        console.log("preprocess-11\n" + code + " error: " + error);
      }
      if (detailedDebug) {
        console.log("preprocess-12\n" + code + " error: " + error);
      }
      _ref11 = this.addTracingInstructionsToDoOnceBlocks(code, error), code = _ref11[0], error = _ref11[1];
      _ref12 = this.identifyBlockStarts(code, error), ignore = _ref12[0], a = _ref12[1], ignore = _ref12[2];
      _ref13 = this.completeImplicitFunctionPasses(code, a, error, userDefinedFunctionsWithArguments, bracketsVariables), code = _ref13[0], error = _ref13[1];
      if (detailedDebug) {
        console.log("completeImplicitFunctionPasses:\n" + code + " error: " + error);
      }
      _ref14 = this.bindFunctionsToArguments(code, error, userDefinedFunctionsWithArguments), code = _ref14[0], error = _ref14[1];
      if (detailedDebug) {
        console.log("preprocess-13\n" + code + " error: " + error);
      }
      _ref15 = this.transformTimesSyntax(code, error), code = _ref15[0], error = _ref15[1];
      if (detailedDebug) {
        console.log("preprocess-14\n" + code + " error: " + error);
      }
      _ref16 = this.transformTimesWithVariableSyntax(code, error), code = _ref16[0], error = _ref16[1];
      if (detailedDebug) {
        console.log("preprocess-15\n" + code + " error: " + error);
      }
      _ref17 = this.unbindFunctionsToArguments(code, error), code = _ref17[0], error = _ref17[1];
      if (detailedDebug) {
        console.log("preprocess-16\n" + code + " error: " + error);
      }
      _ref18 = this.findQualifiers(code, error, bracketsVariables), code = _ref18[0], error = _ref18[1];
      if (detailedDebug) {
        console.log("preprocess-17\n" + code + " error: " + error);
      }
      _ref19 = this.fleshOutQualifiers(code, error, bracketsVariables, bracketsVariablesArray), code = _ref19[0], error = _ref19[1];
      if (detailedDebug) {
        console.log("preprocess-18\n" + code + " error: " + error);
      }
      _ref20 = this.adjustFunctionalReferences(code, error, userDefinedFunctions, bracketsVariables), code = _ref20[0], error = _ref20[1];
      if (detailedDebug) {
        console.log("preprocess-19\n" + code + " error: " + error);
      }
      _ref21 = this.addCommandsSeparations(code, error, userDefinedFunctions), code = _ref21[0], error = _ref21[1];
      if (detailedDebug) {
        console.log("preprocess-20\n" + code + " error: " + error);
      }
      _ref22 = this.adjustImplicitCalls(code, error, userDefinedFunctions, userDefinedFunctionsWithArguments, bracketsVariables), code = _ref22[0], error = _ref22[1];
      if (detailedDebug) {
        console.log("preprocess-21\n" + code + " error: " + error);
      }
      _ref23 = this.adjustDoubleSlashSyntaxForComments(code, error), code = _ref23[0], error = _ref23[1];
      if (detailedDebug) {
        console.log("preprocess-22\n" + code + " error: " + error);
      }
      _ref24 = this.evaluateAllExpressions(code, error, userDefinedFunctions), code = _ref24[0], error = _ref24[1];
      if (detailedDebug) {
        console.log("preprocess-23\n" + code + " error: " + error);
      }
      _ref25 = this.avoidLastArgumentInvocationOverflowing(code, error, userDefinedFunctionsWithArguments), code = _ref25[0], error = _ref25[1];
      if (detailedDebug) {
        console.log("preprocess-24\n" + code + " error: " + error);
      }
      _ref26 = this.fixParamPassingInBracketedFunctions(code, error, userDefinedFunctions), code = _ref26[0], error = _ref26[1];
      if (detailedDebug) {
        console.log("preprocess-25\n" + code + " error: " + error);
      }
      _ref27 = this.putBackBracketVarOriginalName(code, error), code = _ref27[0], error = _ref27[1];
      if (detailedDebug) {
        console.log("preprocess-26\n" + code + " error: " + error);
      }
      _ref28 = this.beautifyCode(code, error), code = _ref28[0], error = _ref28[1];
      if (detailedDebug) {
        console.log("preprocess-27\n" + code + " error: " + error);
      }
      _ref29 = this.simplifyFunctionDoingSimpleInvocation(code, error, userDefinedFunctions), code = _ref29[0], error = _ref29[1];
      if (detailedDebug) {
        console.log("preprocess-29\n" + code + " error: " + error);
      }
      _ref30 = this.simplifyFunctionsAloneInParens(code, error, userDefinedFunctions, bracketsVariables), code = _ref30[0], error = _ref30[1];
      if (detailedDebug) {
        console.log("preprocess-29.5\n" + code + " error: " + error);
      }
      _ref31 = this.injectStrings(code, stringsTable, error), code = _ref31[0], error = _ref31[1];
      if (detailedDebug) {
        console.log("preprocess-29\n" + code + " error: " + error);
      }
      return [code, error, userDefinedFunctions];
    };

    CodePreprocessor.prototype.test = function(rangeMin, rangeMax) {
      var allFunctionsRegex, appendString, error, errorMoot, errorMootAppend, errorMootPrepend, expressionsAndUserDefinedFunctionsRegex, failedIdempotency, failedMootAppends, failedMootPrepends, failedTests, ignore, knownIssues, mootInput, mootInputAppend, mootInputPrepend, prependString, rx, successfulTest, testCase, testCaseNumber, testIdempotency, testMoots, transformed, transformedMootAppend, transformedMootPrepend, transformedTwice, userDefinedFunctions, _i, _j, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
      if (rangeMin == null) {
        rangeMin = void 0;
      }
      if (rangeMax == null) {
        rangeMax = void 0;
      }
      console.log("launching all tests");
      failedTests = successfulTest = knownIssues = failedIdempotency = failedMootAppends = failedMootPrepends = 0;
      if (rangeMin == null) {
        rangeMin = 0;
        rangeMax = this.testCases.length;
      }
      console.log("launching tests: " + (function() {
        _results = [];
        for (var _i = rangeMin; rangeMin <= rangeMax ? _i < rangeMax : _i > rangeMax; rangeMin <= rangeMax ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this));
      for (testCaseNumber = _j = rangeMin; rangeMin <= rangeMax ? _j < rangeMax : _j > rangeMax; testCaseNumber = rangeMin <= rangeMax ? ++_j : --_j) {
        testCase = this.testCases[testCaseNumber];
        testCase.input = testCase.input.replace(/\u25B6/g, "\t");
        if (testCase.expected != null) {
          testCase.expected = testCase.expected.replace(/\u25B6/g, "\t");
        }
        _ref = this.preprocess(testCase.input), transformed = _ref[0], error = _ref[1], userDefinedFunctions = _ref[2];
        testIdempotency = (error == null) && !(testCase.notIdempotent != null);
        testMoots = (error == null) && !(testCase.failsMootAppends != null);
        if (testIdempotency) {
          _ref1 = this.preprocess(transformed.replace(/;/g, "")), transformedTwice = _ref1[0], error = _ref1[1];
        }
        expressionsAndUserDefinedFunctionsRegex = this.expressionsRegex + userDefinedFunctions;
        allFunctionsRegex = this.allCommandsRegex + "|" + expressionsAndUserDefinedFunctionsRegex;
        if (testMoots) {
          appendString = 's';
          prependString = 't';
          _ref2 = this.stripCommentsAndStrings(testCase.input, null), mootInput = _ref2[0], ignore = _ref2[1], errorMoot = _ref2[2];
          _ref3 = this.beautifyCode(mootInput, errorMoot), mootInput = _ref3[0], ignore = _ref3[1], errorMoot = _ref3[2];
          if (errorMoot == null) {
            rx = RegExp("((" + allFunctionsRegex + "|times|doOnce)([^\\w\\d]|$))", 'gm');
            mootInputAppend = mootInput.replace(rx, "$2" + appendString + "$3");
            mootInputPrepend = mootInput.replace(rx, prependString + "$2$3");
            mootInputAppend = this.normaliseCode(mootInputAppend, null)[0];
            _ref4 = this.preprocess(mootInputAppend), transformedMootAppend = _ref4[0], errorMootAppend = _ref4[1];
            mootInputPrepend = this.normaliseCode(mootInputPrepend, null)[0];
            _ref5 = this.preprocess(mootInputPrepend), transformedMootPrepend = _ref5[0], errorMootPrepend = _ref5[1];
          }
          if (errorMootAppend == null) {
            if (userDefinedFunctions !== "") {
              rx = RegExp("(" + userDefinedFunctions + ")" + appendString + "\\(\\)", 'gm');
              transformedMootAppend = transformedMootAppend.replace(rx, "$1" + appendString);
            }
            transformedMootAppend = this.stripCommentsAndStrings(transformedMootAppend, null)[0];
            if (mootInputAppend !== transformedMootAppend) {
              failedMootAppends++;
              console.log("unexpected transformation");
              console.log("moot input:\n" + mootInputAppend);
              console.log("transformed into:\n" + transformedMootAppend);
            }
          }
          if ((errorMootPrepend == null) && testMoots) {
            if (userDefinedFunctions !== "") {
              rx = RegExp(prependString + "(" + userDefinedFunctions + ")\\(\\)", 'gm');
              transformedMootPrepend = transformedMootPrepend.replace(rx, prependString + "$1");
            }
            transformedMootPrepend = this.stripCommentsAndStrings(transformedMootPrepend, null)[0];
            if (mootInputPrepend !== transformedMootPrepend) {
              failedMootPrepends++;
              console.log("unexpected transformation");
              console.log("moot input:\n" + mootInputPrepend);
              console.log("transformed into:\n" + transformedMootPrepend);
            }
          }
        }
        if (transformed === testCase.expected && error === testCase.error && (transformed === transformedTwice || !testIdempotency)) {
          console.log("testCase " + testCaseNumber + ": pass");
          successfulTest++;
        } else {
          if (testCase.knownIssue) {
            console.log("!!!!!!!!!! testCase " + testCaseNumber + " known fail");
            knownIssues++;
          } else {
            console.log("!!!!!!!!!! testCase " + testCaseNumber + " fail:");
            if (testIdempotency && transformed !== transformedTwice) {
              if (transformed === testCase.expected) {
                failedIdempotency++;
                console.log("\nNot idempotent but 1st result OK\n");
              } else {
                console.log("\nNot idempotent and 1st result not OK\n");
              }
              console.log("\n 2nd run result: \n");
              console.log(transformedTwice);
            }
            console.log('\ninput: \n' + testCase.input + '\nobtained: \n' + transformed + '\nwith error:\n' + error + '\ninstead of:\n' + testCase.expected + '\nwith error:\n' + testCase.error);
            failedTests++;
          }
        }
      }
      console.log("######### summary #######");
      console.log("      passed: " + successfulTest);
      console.log("      failed: " + failedTests);
      console.log("      failed moot appends: " + failedMootAppends);
      console.log("      failed moot prepends: " + failedMootPrepends);
      console.log("      out of which only idempotency fails: " + failedIdempotency);
      console.log("known issues: " + knownIssues);
    };

    CodePreprocessor.prototype.identifyBlockStarts = function(code, error) {
      var blockStart, eachLine, line, linesWithBlockStart, match, rx, sourceByLine, startOfPreviousLine, startOfThisLine, _i, _ref;
      if (error != null) {
        return [void 0, void 0, error];
      }
      sourceByLine = code.split("\n");
      startOfPreviousLine = "";
      linesWithBlockStart = [];
      for (eachLine = _i = 0, _ref = sourceByLine.length; 0 <= _ref ? _i < _ref : _i > _ref; eachLine = 0 <= _ref ? ++_i : --_i) {
        line = sourceByLine[eachLine];
        rx = RegExp("^(\\s*)", 'gm');
        match = rx.exec(line);
        if (match == null) {
          continue;
        }
        startOfThisLine = match[1];
        if (startOfThisLine.length > startOfPreviousLine.length) {
          linesWithBlockStart.push(eachLine - 1);
          blockStart = eachLine - 1;
        }
        startOfPreviousLine = startOfThisLine;
      }
      return [code, linesWithBlockStart, void 0];
    };

    CodePreprocessor.prototype.identifyBlockEnd = function(sourceByLine, startLine) {
      var bottomOfProgram, eachLine, lengthToBeat, line, linesWithBlockStart, match, rx, startOfThisLine, _i, _ref;
      if (typeof error !== "undefined" && error !== null) {
        return [void 0, void 0, error];
      }
      rx = RegExp("^(\\s*)", 'gm');
      match = rx.exec(sourceByLine[startLine]);
      lengthToBeat = match[1].length;
      linesWithBlockStart = [];
      for (eachLine = _i = startLine, _ref = sourceByLine.length; startLine <= _ref ? _i < _ref : _i > _ref; eachLine = startLine <= _ref ? ++_i : --_i) {
        line = sourceByLine[eachLine];
        rx = RegExp("^(\\s*)", 'gm');
        match = rx.exec(line);
        if (match == null) {
          continue;
        }
        startOfThisLine = match[1];
        if (startOfThisLine.length < lengthToBeat) {
          return eachLine - 1;
        }
      }
      bottomOfProgram = sourceByLine.length - 1;
      return bottomOfProgram;
    };

    CodePreprocessor.prototype.completeImplicitFunctionPasses = function(code, linesWithBlockStart, error, userDefinedFunctionsWithArguments, bracketsVariables) {
      var countingLines, line, match, qualifyingFunctions, rx, sourceByLine, transformedCode, transformedLines, _i, _len;
      if (error != null) {
        return [void 0, error];
      }
      qualifyingFunctions = this.primitivesAndMatrixRegex + userDefinedFunctionsWithArguments + bracketsVariables;
      sourceByLine = code.split("\n");
      transformedLines = [];
      countingLines = -1;
      for (_i = 0, _len = sourceByLine.length; _i < _len; _i++) {
        line = sourceByLine[_i];
        countingLines++;
        if (__indexOf.call(linesWithBlockStart, countingLines) >= 0) {
          rx = RegExp("->\\s*$", 'gm');
          match = rx.exec(line);
          if (match != null) {
            transformedLines.push(line);
            continue;
          }
          rx = RegExp("[^\\w\\d\\r\\n]times\\s*$", 'gm');
          match = rx.exec(line);
          if (match != null) {
            transformedLines.push(line);
            continue;
          }
          rx = RegExp("(^|;| )\\s*(" + qualifyingFunctions + ")\\s*$", 'gm');
          match = rx.exec(line);
          if (match != null) {
            transformedLines.push(line + " ->");
            continue;
          }
          rx = RegExp("(^|;| )\\s*(" + qualifyingFunctions + ")(?![\\w\\d])([^;\r\n]*)$", 'gm');
          match = rx.exec(line);
          if (match != null) {
            transformedLines.push(line + ", ->");
            continue;
          }
          transformedLines.push(line);
        } else {
          transformedLines.push(line);
        }
      }
      transformedCode = transformedLines.join("\n");
      return [transformedCode, void 0];
    };

    return CodePreprocessor;

  })();
});

/*
//@ sourceMappingURL=code-preprocessor.js.map
*/