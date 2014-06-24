require(['core/event-emitter', 'core/colour-literals', 'core/livecodelab-core'], function(EventEmitter, ColourLiterals, LiveCodeLabCore) {
  return describe("ImageTest", function() {
    beforeEach(function() {
      return this.addMatchers(imagediff.jasmine);
    });
    it("A simple ball", function() {
      var Bowser, a, b, colourNames, eventRouter, liveCodeLabCoreInstance, testCanvas;
      a = new Image();
      b = new Image();
      Bowser = createBowser();
      if (Bowser.firefox) {
        b.src = "test-page-files/images/ballCanvasFirefox.png";
      } else if (Bowser.safari) {
        b.src = "test-page-files/images/ballCanvasSafari.png";
      } else {
        if (Bowser.chrome) {
          b.src = "test-page-files/images/ballCanvasChrome.png";
        }
      }
      console.log(b.src);
      testCanvas = document.createElement("canvas");
      testCanvas.width = 300;
      testCanvas.height = 300;
      eventRouter = new EventEmitter();
      colourNames = new ColourLiterals();
      liveCodeLabCoreInstance = new LiveCodeLabCore({
        blendedThreeJsSceneCanvas: testCanvas,
        canvasForBackground: null,
        forceCanvasRenderer: true,
        eventRouter: eventRouter,
        statsWidget: null,
        testMode: true
      });
      waits(10);
      runs(function() {
        liveCodeLabCoreInstance.updateCode("ball");
        return liveCodeLabCoreInstance.startAnimationLoop();
      });
      waits(1500);
      runs(function() {
        return a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF");
      });
      waits(200);
      return runs(function() {
        return expect(a).toImageDiffEqual(b, 0);
      });
    });
    return it("A simple box", function() {
      var Bowser, a, b, colourNames, eventRouter, liveCodeLabCoreInstance, testCanvas;
      a = new Image();
      b = new Image();
      Bowser = createBowser();
      if (Bowser.firefox) {
        b.src = "test-page-files/images/ballCanvasFirefox.png";
      } else if (Bowser.safari) {
        b.src = "test-page-files/images/ballCanvasSafari.png";
      } else {
        if (Bowser.chrome) {
          b.src = "test-page-files/images/ballCanvasChrome.png";
        }
      }
      console.log(b.src);
      testCanvas = document.createElement("canvas");
      testCanvas.width = 300;
      testCanvas.height = 300;
      eventRouter = new EventEmitter();
      colourNames = new ColourLiterals();
      liveCodeLabCoreInstance = new LiveCodeLabCore({
        blendedThreeJsSceneCanvas: testCanvas,
        canvasForBackground: null,
        forceCanvasRenderer: true,
        eventRouter: eventRouter,
        statsWidget: null,
        testMode: true
      });
      waits(10);
      runs(function() {
        liveCodeLabCoreInstance.updateCode("box ball rect line peg");
        return liveCodeLabCoreInstance.startAnimationLoop();
      });
      waits(1500);
      runs(function() {
        return a = liveCodeLabCoreInstance.getForeground3DSceneImage("#FFFFFF");
      });
      waits(200);
      return runs(function() {
        return expect(a).toImageDiffEqual(b, 0);
      });
    });
  });
});
