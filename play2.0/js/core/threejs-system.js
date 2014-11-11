/*
## Sets up canvas or webgl Threejs renderer based on browser capabilities
## and flags passed in the constructor. Sets up all the post-filtering steps.
*/

define(['ui/ui', 'Three.CanvasRenderer', 'Three.Projector', 'globals/debounce'], function(Ui) {
  var ThreeJsSystem;
  ThreeJsSystem = (function() {
    ThreeJsSystem.isWebGLUsed = false;

    ThreeJsSystem.composer = null;

    ThreeJsSystem.timesInvoked = false;

    ThreeJsSystem.sizeTheForegroundCanvas = function(blendedThreeJsSceneCanvas) {
      var multiplier, sx, sy;
      multiplier = 1;
      sx = Math.floor((window.innerWidth + 40) / Ui.foregroundCanvasFractionOfWindowSize);
      sy = Math.floor((window.innerHeight + 40) / Ui.foregroundCanvasFractionOfWindowSize);
      blendedThreeJsSceneCanvas.style.width = sx + "px";
      blendedThreeJsSceneCanvas.style.height = sy + "px";
      blendedThreeJsSceneCanvas.width = multiplier * sx;
      return blendedThreeJsSceneCanvas.height = multiplier * sy;
    };

    ThreeJsSystem.attachEffectsAndSizeTheirBuffers = function(thrsystem, renderer) {
      var camera, composer, effectBlend, effectSaveTarget, liveCodeLabCore_three, mixR, multiplier, renderModel, renderTarget, renderTargetParameters, scene, screenPass, sx, sy,
        _this = this;
      liveCodeLabCore_three = thrsystem.liveCodeLabCore_three;
      renderTargetParameters = thrsystem.renderTargetParameters;
      camera = thrsystem.camera;
      scene = thrsystem.scene;
      multiplier = 1;
      sx = Math.floor((window.innerWidth + 40) / Ui.foregroundCanvasFractionOfWindowSize);
      sy = Math.floor((window.innerHeight + 40) / Ui.foregroundCanvasFractionOfWindowSize);
      if (thrsystem.isWebGLUsed) {
        if (thrsystem.renderTarget != null) {
          thrsystem.renderTarget.dispose();
        }
        renderTarget = new liveCodeLabCore_three.WebGLRenderTarget(sx * multiplier, sy * multiplier, renderTargetParameters);
        if (thrsystem.effectSaveTarget != null) {
          thrsystem.effectSaveTarget.renderTarget.dispose();
        }
        effectSaveTarget = new liveCodeLabCore_three.SavePass(new liveCodeLabCore_three.WebGLRenderTarget(sx * multiplier, sy * multiplier, {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          format: THREE.RGBAFormat,
          stencilBuffer: true
        }));
        effectSaveTarget.clear = false;
        composer = new liveCodeLabCore_three.EffectComposer(renderer, renderTarget);
        if (thrsystem.effectBlend != null) {
          mixR = thrsystem.effectBlend.uniforms.mixRatio.value;
        } else {
          mixR = 0;
        }
        effectBlend = new liveCodeLabCore_three.ShaderPass(liveCodeLabCore_three.ShaderExtras.blend, "tDiffuse1");
        effectBlend.uniforms.tDiffuse2.value = effectSaveTarget.renderTarget;
        effectBlend.uniforms.mixRatio.value = 0;
        setTimeout((function() {
          return thrsystem.effectBlend.uniforms.mixRatio.value = 0;
        }), 1);
        setTimeout((function() {
          return thrsystem.effectBlend.uniforms.mixRatio.value = mixR;
        }), 90);
        screenPass = new liveCodeLabCore_three.ShaderPass(liveCodeLabCore_three.ShaderExtras.screen);
        renderModel = new liveCodeLabCore_three.RenderPass(scene, camera);
        composer.addPass(renderModel);
        composer.addPass(effectBlend);
        composer.addPass(effectSaveTarget);
        composer.addPass(screenPass);
        screenPass.renderToScreen = true;
        ThreeJsSystem.timesInvoked = true;
        return [renderTarget, effectSaveTarget, effectBlend, composer];
      } else {
        thrsystem.currentFrameThreeJsSceneCanvas.width = multiplier * sx;
        thrsystem.currentFrameThreeJsSceneCanvas.height = multiplier * sy;
        thrsystem.previousFrameThreeJSSceneRenderForBlendingCanvas.width = multiplier * sx;
        return thrsystem.previousFrameThreeJSSceneRenderForBlendingCanvas.height = multiplier * sy;
      }
    };

    ThreeJsSystem.sizeRendererAndCamera = function(renderer, camera, scale) {
      var multiplier, sx, sy;
      camera.aspect = (window.innerWidth + 40) / (window.innerHeight + 40);
      camera.updateProjectionMatrix();
      multiplier = 1;
      sx = Math.floor((window.innerWidth + 40) / Ui.foregroundCanvasFractionOfWindowSize);
      sy = Math.floor((window.innerHeight + 40) / Ui.foregroundCanvasFractionOfWindowSize);
      return renderer.setSize(sx * multiplier, sy * multiplier, false);
    };

    ThreeJsSystem.attachResizingBehaviourToResizeEvent = function(thrsystem, renderer, camera) {
      var callback, debouncedCallback, scale,
        _this = this;
      scale = Ui.foregroundCanvasFractionOfWindowSize;
      callback = function() {
        var _ref;
        _this.sizeTheForegroundCanvas(thrsystem.blendedThreeJsSceneCanvas);
        _this.sizeRendererAndCamera(renderer, camera, scale);
        return _ref = ThreeJsSystem.attachEffectsAndSizeTheirBuffers(thrsystem, renderer), thrsystem.renderTarget = _ref[0], thrsystem.effectSaveTarget = _ref[1], thrsystem.effectBlend = _ref[2], thrsystem.composer = _ref[3], _ref;
      };
      debouncedCallback = debounce(callback, 250);
      window.addEventListener("resize", debouncedCallback, false);
      return {
        /**
        Stop watching window resize
        */

        stop: function() {
          window.removeEventListener("resize", callback);
        }
      };
    };

    function ThreeJsSystem(Detector, blendedThreeJsSceneCanvas, forceCanvasRenderer, testMode, liveCodeLabCore_three) {
      var currentFrameThreeJsSceneCanvas, fxaaPass, previousFrameThreeJSSceneRenderForBlendingCanvas, renderModel, screenPass, _ref;
      this.blendedThreeJsSceneCanvas = blendedThreeJsSceneCanvas;
      this.forceCanvasRenderer = forceCanvasRenderer;
      if (!this.blendedThreeJsSceneCanvas) {
        this.blendedThreeJsSceneCanvas = document.createElement("canvas");
        this.blendedThreeJsSceneCanvas.width = window.innerWidth;
        this.blendedThreeJsSceneCanvas.height = window.innerHeight;
      }
      this.liveCodeLabCore_three = liveCodeLabCore_three;
      if (!this.forceCanvasRenderer && Detector.webgl) {
        this.ballDefaultDetLevel = 16;
        this.blendedThreeJsSceneCanvasContext = this.blendedThreeJsSceneCanvas.getContext("experimental-webgl");
        this.renderer = new liveCodeLabCore_three.WebGLRenderer({
          canvas: this.blendedThreeJsSceneCanvas,
          antialias: false,
          premultipliedAlpha: false,
          devicePixelRatio: 1
        });
        this.isWebGLUsed = true;
      } else {
        this.ballDefaultDetLevel = 6;
        this.currentFrameThreeJsSceneCanvas = document.createElement("canvas");
        currentFrameThreeJsSceneCanvas = this.currentFrameThreeJsSceneCanvas;
        currentFrameThreeJsSceneCanvas.width = this.blendedThreeJsSceneCanvas.width;
        currentFrameThreeJsSceneCanvas.height = this.blendedThreeJsSceneCanvas.height;
        this.currentFrameThreeJsSceneCanvasContext = currentFrameThreeJsSceneCanvas.getContext("2d");
        this.previousFrameThreeJSSceneRenderForBlendingCanvas = document.createElement("canvas");
        previousFrameThreeJSSceneRenderForBlendingCanvas = this.previousFrameThreeJSSceneRenderForBlendingCanvas;
        previousFrameThreeJSSceneRenderForBlendingCanvas.width = this.blendedThreeJsSceneCanvas.width;
        previousFrameThreeJSSceneRenderForBlendingCanvas.height = this.blendedThreeJsSceneCanvas.height;
        this.previousFrameThreeJSSceneRenderForBlendingCanvasContext = this.previousFrameThreeJSSceneRenderForBlendingCanvas.getContext("2d");
        this.blendedThreeJsSceneCanvasContext = this.blendedThreeJsSceneCanvas.getContext("2d");
        this.renderer = new THREE.CanvasRenderer({
          canvas: currentFrameThreeJsSceneCanvas,
          antialias: false,
          preserveDrawingBuffer: testMode,
          devicePixelRatio: 1
        });
      }
      this.scene = new liveCodeLabCore_three.Scene();
      this.scene.matrixAutoUpdate = false;
      this.camera = new liveCodeLabCore_three.PerspectiveCamera(35, this.blendedThreeJsSceneCanvas.width / this.blendedThreeJsSceneCanvas.height, 1, 10000);
      this.camera.position.set(0, 0, 5);
      this.scene.add(this.camera);
      this.constructor.attachResizingBehaviourToResizeEvent(this, this.renderer, this.camera);
      this.constructor.sizeTheForegroundCanvas(this.blendedThreeJsSceneCanvas);
      this.constructor.sizeRendererAndCamera(this.renderer, this.camera, Ui.foregroundCanvasFractionOfWindowSize);
      if (this.isWebGLUsed) {
        this.renderTargetParameters = void 0;
        this.renderTarget = void 0;
        this.effectSaveTarget = void 0;
        fxaaPass = void 0;
        screenPass = void 0;
        renderModel = void 0;
        this.renderTargetParameters = {
          format: liveCodeLabCore_three.RGBAFormat,
          stencilBuffer: true
        };
        _ref = this.constructor.attachEffectsAndSizeTheirBuffers(this, this.renderer), this.renderTarget = _ref[0], this.effectSaveTarget = _ref[1], this.effectBlend = _ref[2], this.composer = _ref[3];
      }
    }

    return ThreeJsSystem;

  })();
  return ThreeJsSystem;
});

/*
//@ sourceMappingURL=threejs-system.js.map
*/