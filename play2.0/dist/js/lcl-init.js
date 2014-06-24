/*
## Init.js takes care of the setup of the whole environment up to
## cruise speed
*/

require(['Three.Stats', 'core/event-emitter', 'core/livecodelab-core', 'core/program-loader', 'ui/url-router', 'ui/big-cursor', 'ui/text-dimming', 'ui/ui', 'editor/editor', 'autocoder/autocoder', 'codemirror', 'jquery', 'mousewheel', 'codemirror-lcl-mode', 'globals/browsercontrols', 'globals/math', 'globals/numbertimes', 'globals/requestAnimFrame'], function(Stats, EventEmitter, LiveCodeLabCore, ProgramLoader, UrlRouter, BigCursor, EditorDimmer, Ui, Editor, Autocoder, CodeMirror, $) {
  var canvasIsSupportedAndNotIE9, startEnvironment;
  canvasIsSupportedAndNotIE9 = function() {
    var div, elem, isIE9;
    div = document.createElement("div");
    div.innerHTML = "<!--[if IE 9 ]><i></i><![endif]-->";
    isIE9 = div.getElementsByTagName("i").length === 1;
    if (isIE9) {
      return false;
    }
    elem = document.createElement("canvas");
    return !!(elem.getContext && elem.getContext("2d"));
  };
  startEnvironment = function(paramsObject) {
    var autocoder, bigCursor, editor, editorDimmer, eventRouter, liveCodeLabCore, programLoader, stats, ui, urlRouter,
      _this = this;
    if (!canvasIsSupportedAndNotIE9()) {
      $("#noCanvasMessage").modal({
        onClose: function() {
          $("#loading").text("sorry :-(");
          return $.modal.close();
        }
      });
      $("#simplemodal-container").height(200);
      return;
    }
    eventRouter = new EventEmitter();
    stats = new Stats;
    liveCodeLabCore = new LiveCodeLabCore({
      blendedThreeJsSceneCanvas: paramsObject.blendedThreeJsSceneCanvas,
      canvasForBackground: paramsObject.canvasForBackground,
      forceCanvasRenderer: paramsObject.forceCanvasRenderer,
      eventRouter: eventRouter,
      statsWidget: stats,
      testMode: paramsObject.testMode
    });
    urlRouter = new UrlRouter(eventRouter);
    bigCursor = new BigCursor(eventRouter);
    eventRouter.addListener("big-cursor-show", function() {
      return bigCursor.unshrinkBigCursor();
    });
    eventRouter.addListener("big-cursor-hide", function() {
      return bigCursor.shrinkBigCursor();
    });
    editor = new Editor(eventRouter, CodeMirror);
    attachMouseWheelHandler(editor);
    programLoader = new ProgramLoader(eventRouter, editor, liveCodeLabCore);
    eventRouter.addListener("load-program", function(demoName) {
      return programLoader.loadDemoOrTutorial(demoName);
    });
    ui = new Ui(eventRouter, stats, programLoader);
    autocoder = new Autocoder(eventRouter, editor, liveCodeLabCore.colourLiterals.colourNames);
    eventRouter.addListener("reset", function() {
      return autocoder.toggle(false);
    });
    eventRouter.addListener("toggle-autocoder", function() {
      return autocoder.toggle();
    });
    editorDimmer = new EditorDimmer(eventRouter, bigCursor);
    eventRouter.addListener("editor-dim", function() {
      return editorDimmer.dimEditor();
    });
    eventRouter.addListener("editor-undim", function() {
      return editorDimmer.undimEditor();
    });
    eventRouter.addListener("editor-toggle-dim", function(autoDim) {
      return editorDimmer.toggleDimCode(autoDim);
    });
    eventRouter.addListener("reset", function() {
      return liveCodeLabCore.paintARandomBackground();
    });
    eventRouter.emit("editor-toggle-dim", false);
    eventRouter.addListener("livecodelab-running-stably", function() {
      return ui.showStatsWidget();
    });
    eventRouter.addListener("code-changed", function(updatedCodeAsString) {
      var _this = this;
      if (updatedCodeAsString !== "") {
        eventRouter.emit("big-cursor-hide");
      } else {
        setTimeout((function() {
          return editor.clearHistory();
        }), 30);
        eventRouter.emit("set-url-hash", "");
        eventRouter.emit("big-cursor-show");
        ui.hideStatsWidget();
      }
      return liveCodeLabCore.updateCode(updatedCodeAsString);
    });
    eventRouter.addListener("runtime-error-thrown", function(e) {
      eventRouter.emit("report-runtime-or-compile-time-error", e);
      if (autocoder.active) {
        editor.undo();
      } else {
        liveCodeLabCore.runLastWorkingDrawFunction();
      }
      if (paramsObject.bubbleUpErrorsForDebugging) {
        throw e;
      }
    });
    eventRouter.addListener("compile-time-error-thrown", function(e) {
      eventRouter.emit("report-runtime-or-compile-time-error", e);
      if (autocoder.active) {
        return editor.undo();
      }
    });
    eventRouter.addListener("clear-error", function() {
      return ui.clearError();
    });
    eventRouter.addListener("all-sounds-loaded-and tested", function() {
      return ui.soundSystemOk();
    });
    liveCodeLabCore.loadAndTestAllTheSounds();
    liveCodeLabCore.paintARandomBackground();
    liveCodeLabCore.startAnimationLoop();
    if (!Detector.webgl || paramsObject.forceCanvasRenderer) {
      $("#noWebGLMessage").modal({
        onClose: $.modal.close
      });
      $("#simplemodal-container").height(200);
    }
    editor.focus();
    if (!urlRouter.urlPointsToDemoOrTutorial()) {
      setTimeout((function() {
        return liveCodeLabCore.playStartupSound();
      }), 650);
      bigCursor.toggleBlink(true);
    }
    ui.setup();
    return setTimeout((function() {
      return programLoader.kickOff();
    }), 650);
  };
  if (typeof setupForNormalLCLPage !== "undefined" && setupForNormalLCLPage !== null) {
    $(document).ready(function() {
      var canvasName;
      canvasName = "blendedThreeJsSceneCanvas";
      document.getElementById(canvasName).width = window.innerWidth;
      document.getElementById(canvasName).height = window.innerHeight;
      return startEnvironment({
        blendedThreeJsSceneCanvas: document.getElementById(canvasName),
        canvasForBackground: document.getElementById("backgroundCanvasOrDiv"),
        forceCanvasRenderer: false,
        bubbleUpErrorsForDebugging: false,
        testMode: false
      });
    });
  }
  if (typeof setupForTestPage !== "undefined" && setupForTestPage !== null) {
    return $(document).ready(function() {
      var execJasmine, jasmineEnv, reporter;
      console.log('describing ImageTest');
      execJasmine = function() {
        return jasmineEnv.execute();
      };
      prettyPrint();
      jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;
      reporter = new jasmine.HtmlReporter();
      jasmineEnv.addReporter(reporter);
      jasmineEnv.specFilter = function(spec) {
        return reporter.specFilter(spec);
      };
      return execJasmine();
    });
  }
});

/*
//@ sourceMappingURL=lcl-init.js.map
*/