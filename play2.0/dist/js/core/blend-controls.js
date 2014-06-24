/*
## BlendControls manages the three different blending styles.
## One can decide for either 'normal' (e.g. next frame completely
## replaces the previous one) or 'paintOver' (new frame is painted
## over the previous one, meaning that the previous frame shows through
## the transparent bits of the new frame) or 'motionBlur'
## (previous frame is shown faintly below the current one so to give
## a vague effect of motion blur).
*/

define(function() {
  var BlendControls;
  BlendControls = (function() {
    BlendControls.prototype.previousanimationStyleValue = 0;

    BlendControls.prototype.animationStyleValue = 0;

    BlendControls.prototype.animationStyles = {};

    BlendControls.prototype.blendAmount = 0;

    function BlendControls(liveCodeLabCoreInstance) {
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
      this.animationStyles.normal = 0;
      this.animationStyles.paintOver = 1;
      this.animationStyles.motionBlur = 2;
    }

    BlendControls.prototype.addToScope = function(scope) {
      var _this = this;
      scope.add('normal', this.animationStyles.normal);
      scope.add('paintOver', this.animationStyles.paintOver);
      scope.add('motionBlur', this.animationStyles.mothinBlur);
      return scope.add('animationStyle', function(a) {
        return _this.animationStyle(a);
      });
    };

    BlendControls.prototype.animationStyle = function(a) {
      if (a === false || (a == null)) {
        return;
      }
      return this.animationStyleValue = a;
    };

    BlendControls.prototype.animationStyleUpdateIfChanged = function() {
      var isWebGLUsed;
      if (this.animationStyleValue === this.previousanimationStyleValue) {
        return;
      }
      this.previousanimationStyleValue = this.animationStyleValue;
      isWebGLUsed = this.liveCodeLabCoreInstance.threeJsSystem.isWebGLUsed;
      this.animationStyles = this.animationStyles;
      if (isWebGLUsed && this.animationStyleValue === this.animationStyles.motionBlur) {
        this.liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 0.7;
      } else if (!isWebGLUsed && this.animationStyleValue === this.animationStyles.motionBlur) {
        this.blendAmount = 0.6;
      }
      if (isWebGLUsed && this.animationStyleValue === this.animationStyles.paintOver) {
        this.liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 1;
      } else if (!isWebGLUsed && this.animationStyleValue === this.animationStyles.paintOver) {
        this.blendAmount = 1;
      }
      if (isWebGLUsed && this.animationStyleValue === this.animationStyles.normal) {
        return this.liveCodeLabCoreInstance.threeJsSystem.effectBlend.uniforms.mixRatio.value = 0;
      } else if (!isWebGLUsed && this.animationStyleValue === this.animationStyles.normal) {
        return this.blendAmount = 0;
      }
    };

    return BlendControls;

  })();
  return BlendControls;
});

/*
//@ sourceMappingURL=blend-controls.js.map
*/