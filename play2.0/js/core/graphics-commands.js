/*
## Please reference the colour-functions.js file for all colour-related
## functions and lights-functions.js for lights, which use a similar
## structure for caching and counting of light instances.

## Fundamentals
## ============
## There are a couple of fundamentals of LiveCodeLab and a couple of
## complications of Three.js that shape the way
## graphic primitives work in this file.

## LiveCodeLab uses immediate mode graphics
## ----------------------
## First off, like Processing, LiveCodeLab adopts an "immediate" graphics
## mode instead of a "retained" mode.
## For context, "immediate mode" graphics means that when the user uses a
## graphic primitive, he is
## NOT given a handle that he can use to modify properties of that element at a
## later stage, contrarily to flash, DOM, CSS, openGL and Three.JS
## (to different degrees).
## Retained graphic modes keep structures in memory that make easy for example
## to do event handling (which object did I click?), hierarchy management
## (parent/child relationships, container/content, etc), property tweaking
## (change property X of object Y), and sometimes animation ( CoreAnimation from
## Apple for example), collision/overlap detection. Note that openGL is retained
## in that there are handles to geometry and textures, but little else is given
## (no events, no input, no physics/overlap/collision/animation).
## Also, retained graphics mode usually is smart about updating
## only minimal parts of the screen that need updating rather than redrawing the
## whole screen (again, openGL doesn't do that apart from basic frustum culling,
## but for example there is nothing to detect occlusions and avoid painting
## occluded objects).
## There are a few drawbacks in retained modes: a) programs that manage
## handles are more lengthy than programs that don't
## b) they are often not needed for example in
## 2d sprites-based videogames c) most importantly,
## they require deeper understanding of the underlying
## model (e.g. which property can I change?
## What are those called?
## How do I change parent/child relationship?
## How do events bubble up and where should I catch them?).
## Processing and LiveCodeLab go for immediate mode instead.
## Once the primitive is invoked, it
## becomes pixels and there is no built-in way to do input/event/hierarchies...
## Rather, there are a few properties that are set as a global state and apply
## to all objects. Examples are "fill" and "stroke".

## Relationship between objects, meshes, geometry, materials...
## ----------------------
## A Three.js object (or to be more precise, Object3D) can be a line or a mesh.
## A line is a line, a mesh can be anything else depending on what the geometry
## of the mesh is. There are more possible types such as particles, etc. but
## they are not currently used in LiveCodeLab.
## An object needs one more thing: a material.

## Caching of objects
## ----------------------
## Once created, objects are kept cached together with all possible materials
## that can be associated with it. Each object has to have its own set of
## materials because one can decide to draw one object in solid fill, one in
## normal color, one with an ambient light (i.e. lambert material), etc.

## Objects are kept in the scene
## ----------------------
## Once an object is added to the scene, it's never removed. Rather, it's hidden
## if it's not used, but it's never removed. This is because adding/removing
## objects from the scene is rather expensive. Note that Mr Doob mentioned via
## email that subsequent versions of three.js have improved performance a lot,
## so it's worth trying another approach.

## Strokes are managed via separate objects for stroke and fill
## ----------------------
## There is a particular flag in Three.js materials for drawing wireframes.
## But materials cannot be combined, i.e. only one is associated at any time
## with a geometry. So one can either draw a wireframe or a fill. In previous
## versions of Three.js more than one material could be associated, but that has
## been deprecated, see https://github.com/mrdoob/three.js/issues/751 and
## instead a createMultiMaterialObject utility was put in place, which basically
## creates multiple objects one for each material, see
## https://github.com/mrdoob/three.js/blob/dev/src/extras/SceneUtils.js#L29
## So the solution here is to create two disting objects.
## One for the fills and one, slightly "larger", for the strokes. In that way,
## the strokes are visible "in front" of the fills, and the fills cover the
## strokes "at the back"

## The order of materials matters
## ----------------------
## When an object is created, it must be first rendered with the most complex
## material, because internally in Three.js/WebGL memory is allocated only once.
## So a special mechanism is put in place by which new objects are drawn with
## the normalMaterial with scale 0 (which so far is the most complex
## material we apply), so they are rendered but they are invisible.
## In the next frame (i.e. after the first render) the correct material is used.

## "Spinning"
## ----------------------
## "Spinning" applies to all objects added to an empty frame: it makes all
## objects spin for a few frames. This has been implemented for two reasons
## a) cosmetic
## b) the user is likely to first use "box", and without spinning that
##    would look like a boring square that appears without animation.
## Spinning gives many more cues:
## the environment is 3d, the lighting is special by default and all faces have
## primary colors, things animate. Without spinning, all those cues need to be
## further explained and demonstrated.
*/

var isFunction;

isFunction = function(functionToCheck) {
  var getType;
  getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === "[object Function]";
};

define(function() {
  var GraphicsCommands;
  GraphicsCommands = (function() {
    GraphicsCommands.prototype.fillStack = [];

    GraphicsCommands.prototype.strokeStack = [];

    GraphicsCommands.prototype.primitiveTypes = {};

    GraphicsCommands.prototype.minimumBallDetail = 2;

    GraphicsCommands.prototype.maximumBallDetail = 30;

    GraphicsCommands.prototype.doFill = true;

    GraphicsCommands.prototype.doStroke = true;

    GraphicsCommands.prototype.reflectValue = 1;

    GraphicsCommands.prototype.refractValue = 0.98;

    GraphicsCommands.prototype.currentStrokeAlpha = void 0;

    GraphicsCommands.prototype.currentStrokeColor = void 0;

    GraphicsCommands.prototype.geometriesBank = [];

    GraphicsCommands.prototype.SPIN_DURATION_IN_FRAMES = 30;

    GraphicsCommands.prototype.currentFillAlpha = void 0;

    GraphicsCommands.prototype.currentFillColor = void 0;

    GraphicsCommands.prototype.objectPools = [];

    GraphicsCommands.prototype.ballDetLevel = 8;

    GraphicsCommands.prototype.currentStrokeSize = 1;

    GraphicsCommands.prototype.objectsUsedInFrameCounts = [];

    GraphicsCommands.prototype.doTheSpinThingy = true;

    GraphicsCommands.prototype.resetTheSpinThingy = false;

    GraphicsCommands.prototype.defaultNormalFill = true;

    GraphicsCommands.prototype.defaultNormalStroke = true;

    GraphicsCommands.prototype.exclusionPrincipleWobble = true;

    GraphicsCommands.prototype.lastPositionOfPrimitiveType = [];

    GraphicsCommands.prototype.numberOfOverlappingPrimitives = [];

    GraphicsCommands.prototype.atLeastOneObjectIsDrawn = false;

    GraphicsCommands.prototype.atLeastOneObjectWasDrawn = false;

    function GraphicsCommands(liveCodeLabCore_three, liveCodeLabCoreInstance, colourLiterals) {
      var ballProportion, boxProportion, i, lineProportion, numberOfPrimitives, pegProportion, rectProportion, _i, _j, _k, _ref, _ref1, _ref2;
      this.liveCodeLabCore_three = liveCodeLabCore_three;
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
      this.colourLiterals = colourLiterals;
      numberOfPrimitives = 0;
      this.primitiveTypes.ambientLight = numberOfPrimitives++;
      this.primitiveTypes.line = numberOfPrimitives++;
      this.primitiveTypes.rect = numberOfPrimitives++;
      this.primitiveTypes.box = numberOfPrimitives++;
      this.primitiveTypes.peg = numberOfPrimitives++;
      this.primitiveTypes.ball = numberOfPrimitives++;
      this.angleColor = this.colourLiterals.getColour('angleColor');
      this.objectPools[this.primitiveTypes.line] = [];
      this.objectPools[this.primitiveTypes.rect] = [];
      this.objectPools[this.primitiveTypes.box] = [];
      this.objectPools[this.primitiveTypes.peg] = [];
      for (i = _i = 0, _ref = this.maximumBallDetail - this.minimumBallDetail + 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.objectPools[this.primitiveTypes.ball + i] = [];
      }
      /*
      Since you can't change the geometry of an object once it's created, we keep
      around a pool of objects for each mesh type. There is one pool for lines,
      one for rectangles, one for boxes. There is one pool for each detail level
      of balls (since they are different) meshes. For the time being there is
      no detail level for cylinders so there is only one pool for cylinders.
      
      For how the mechanism works now, all pooled objects end up in the scene
      graph.  The scene graph is traversed at each frame and only the used
      objects are marked as visible, the other unused objects are hidden. This
      is because adding/removing objects from the scene is expensive. Note that
      this might have changed with more recent versions of Three.js of
      the past 4 months.
      
      All object pools start empty. Note that each ball detail level must have
      its own pool, because you can't change the geometry of an object.
      If one doesn't like the idea of creating dozens of empty arrays that
      won't ever be used (since probably only a few ball detail levels will
      be used in a session) then one could leave all these arrays undefined
      and define them at runtime only when needed.
      */

      boxProportion = 1;
      lineProportion = 1.4;
      rectProportion = 1.2;
      pegProportion = 1.1;
      ballProportion = 0.64;
      this.geometriesBank[this.primitiveTypes.line] = new this.liveCodeLabCore_three.Geometry();
      this.geometriesBank[this.primitiveTypes.line].vertices.push(new this.liveCodeLabCore_three.Vector3(0, -0.5 * lineProportion, 0));
      this.geometriesBank[this.primitiveTypes.line].vertices.push(new this.liveCodeLabCore_three.Vector3(0, 0.5 * lineProportion, 0));
      this.geometriesBank[this.primitiveTypes.line].mergeVertices();
      this.geometriesBank[this.primitiveTypes.rect] = new this.liveCodeLabCore_three.PlaneGeometry(1 * rectProportion, 1 * rectProportion);
      this.geometriesBank[this.primitiveTypes.box] = new this.liveCodeLabCore_three.BoxGeometry(1 * boxProportion, 1 * boxProportion, 1 * boxProportion);
      this.geometriesBank[this.primitiveTypes.peg] = new this.liveCodeLabCore_three.CylinderGeometry(0.5 * pegProportion, 0.5 * pegProportion, 1 * pegProportion, 32);
      for (i = _j = 0, _ref1 = this.maximumBallDetail - this.minimumBallDetail + 1; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        this.geometriesBank[this.primitiveTypes.ball + i] = new this.liveCodeLabCore_three.SphereGeometry(1 * ballProportion, this.minimumBallDetail + i, this.minimumBallDetail + i);
      }
      for (i = _k = 0, _ref2 = numberOfPrimitives + (this.maximumBallDetail - this.minimumBallDetail + 1); 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        this.lastPositionOfPrimitiveType[i] = new this.liveCodeLabCore_three.Matrix4();
        this.numberOfOverlappingPrimitives[i] = 0;
      }
    }

    GraphicsCommands.prototype.resetFillStack = function() {
      this.fillStack = [];
      this.fill(0xFFFFFFFF);
      return this.defaultNormalFill = true;
    };

    GraphicsCommands.prototype.resetStrokeStack = function() {
      this.strokeStack = [];
      this.stroke(0xFFFFFFFF);
      return this.defaultNormalStroke = true;
    };

    GraphicsCommands.prototype.pushFill = function(defaultNormalFill, currentFillColor, currentFillAlpha, doFill) {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      this.fillStack.push(defaultNormalFill);
      this.fillStack.push(currentFillColor);
      this.fillStack.push(currentFillAlpha);
      return this.fillStack.push(doFill);
    };

    GraphicsCommands.prototype.pushStroke = function(defaultNormalStroke, currentStrokeColor, currentStrokeAlpha, doStroke) {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      this.strokeStack.push(defaultNormalStroke);
      this.strokeStack.push(currentStrokeColor);
      this.strokeStack.push(currentStrokeAlpha);
      return this.strokeStack.push(doStroke);
    };

    GraphicsCommands.prototype.popFill = function() {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      if (this.fillStack.length) {
        this.doFill = this.fillStack.pop();
        this.currentFillAlpha = this.fillStack.pop();
        this.currentFillColor = this.fillStack.pop();
        return this.defaultNormalFill = this.fillStack.pop();
      } else {
        return this.resetFillStack();
      }
    };

    GraphicsCommands.prototype.popStroke = function() {
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      if (this.strokeStack.length) {
        this.doStroke = this.strokeStack.pop();
        this.currentStrokeAlpha = this.strokeStack.pop();
        this.currentStrokeColor = this.strokeStack.pop();
        return this.defaultNormalStroke = this.strokeStack.pop();
      } else {
        return this.resetStrokeStack();
      }
    };

    GraphicsCommands.prototype.addToScope = function(scope) {
      var _this = this;
      scope.add('line', function(a, b, c, d) {
        return _this.line(a, b, c, d);
      });
      scope.add('rect', function(a, b, c, d) {
        return _this.rect(a, b, c, d);
      });
      scope.add('box', function(a, b, c, d) {
        return _this.box(a, b, c, d);
      });
      scope.add('peg', function(a, b, c, d) {
        return _this.peg(a, b, c, d);
      });
      scope.add('ball', function(a, b, c, d) {
        return _this.ball(a, b, c, d);
      });
      scope.add('ballDetail', function(a) {
        return _this.ballDetail(a);
      });
      scope.add('fill', function(a, b, c, d, e) {
        return _this.fill(a, b, c, d, e);
      });
      scope.add('noFill', function(a) {
        return _this.noFill(a);
      });
      scope.add('stroke', function(a, b, c, d, e) {
        return _this.stroke(a, b, c, d, e);
      });
      scope.add('noStroke', function(a) {
        return _this.noStroke(a);
      });
      return scope.add('strokeSize', function(a) {
        return _this.strokeSize(a);
      });
    };

    GraphicsCommands.prototype.createObjectIfNeededAndDressWithCorrectMaterial = function(a, b, c, primitiveProperties, strokeTime, colorToBeUsed, alphaToBeUsed, applyDefaultNormalColor) {
      var arrayEqual, objectIsNew, objectPool, overlapPrimtives, pert, pooledObjectWithMaterials, primitiveID, theAngle;
      this.atLeastOneObjectIsDrawn = true;
      objectIsNew = false;
      pooledObjectWithMaterials = void 0;
      theAngle = void 0;
      primitiveID = primitiveProperties.primitiveType + primitiveProperties.detailLevel;
      objectPool = this.objectPools[primitiveID];
      pooledObjectWithMaterials = objectPool[this.objectsUsedInFrameCounts[primitiveID]];
      if (pooledObjectWithMaterials == null) {
        pooledObjectWithMaterials = {
          lineMaterial: void 0,
          basicMaterial: void 0,
          lambertMaterial: void 0,
          normalMaterial: void 0,
          threejsObject3D: new primitiveProperties.threeObjectConstructor(this.geometriesBank[primitiveID]),
          initialSpinCountdown: this.SPIN_DURATION_IN_FRAMES
        };
        objectIsNew = true;
        objectPool.push(pooledObjectWithMaterials);
      }
      if (primitiveProperties.primitiveType === this.primitiveTypes.line) {
        if (pooledObjectWithMaterials.lineMaterial == null) {
          pooledObjectWithMaterials.lineMaterial = new this.liveCodeLabCore_three.LineBasicMaterial();
        }
        if (this.currentStrokeColor === this.angleColor || this.defaultNormalStroke) {
          theAngle = (new this.liveCodeLabCore_three.Vector3(0, 1, 0)).applyProjection(pooledObjectWithMaterials.threejsObject3D.matrix).normalize();
          pooledObjectWithMaterials.lineMaterial.color.setHex(this.liveCodeLabCoreInstance.colourFunctions.color(((theAngle.x + 1) / 2) * 255, ((theAngle.y + 1) / 2) * 255, ((theAngle.z + 1) / 2) * 255));
        } else {
          pooledObjectWithMaterials.lineMaterial.color.setHex(this.currentStrokeColor);
        }
        pooledObjectWithMaterials.lineMaterial.linewidth = this.currentStrokeSize;
        pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.lineMaterial;
      } else if (objectIsNew || (colorToBeUsed === this.angleColor || applyDefaultNormalColor)) {
        if (pooledObjectWithMaterials.normalMaterial == null) {
          pooledObjectWithMaterials.normalMaterial = new this.liveCodeLabCore_three.MeshNormalMaterial();
        }
        pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.normalMaterial;
      } else if (!this.liveCodeLabCoreInstance.lightSystem.lightsAreOn) {
        if (pooledObjectWithMaterials.basicMaterial == null) {
          pooledObjectWithMaterials.basicMaterial = new this.liveCodeLabCore_three.MeshBasicMaterial();
        }
        pooledObjectWithMaterials.basicMaterial.color.setHex(colorToBeUsed);
        pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.basicMaterial;
      } else {
        if (pooledObjectWithMaterials.lambertMaterial == null) {
          pooledObjectWithMaterials.lambertMaterial = new this.liveCodeLabCore_three.MeshLambertMaterial();
        }
        pooledObjectWithMaterials.lambertMaterial.color.setHex(colorToBeUsed);
        pooledObjectWithMaterials.threejsObject3D.material = pooledObjectWithMaterials.lambertMaterial;
      }
      pooledObjectWithMaterials.threejsObject3D.material.side = primitiveProperties.sidedness;
      pooledObjectWithMaterials.threejsObject3D.material.opacity = alphaToBeUsed;
      if (alphaToBeUsed < 1) {
        pooledObjectWithMaterials.threejsObject3D.material.transparent = true;
      }
      pooledObjectWithMaterials.threejsObject3D.material.wireframe = strokeTime;
      pooledObjectWithMaterials.threejsObject3D.material.wireframeLinewidth = this.currentStrokeSize;
      pooledObjectWithMaterials.threejsObject3D.material.reflectivity = this.reflectValue;
      pooledObjectWithMaterials.threejsObject3D.material.refractionRatio = this.refractValue;
      if (this.resetTheSpinThingy) {
        pooledObjectWithMaterials.initialSpinCountdown = this.SPIN_DURATION_IN_FRAMES;
        this.resetTheSpinThingy = false;
        this.doTheSpinThingy = true;
      }
      if (this.doTheSpinThingy) {
        pooledObjectWithMaterials.initialSpinCountdown -= 1;
      }
      if (pooledObjectWithMaterials.initialSpinCountdown === -1) {
        this.doTheSpinThingy = false;
      }
      pooledObjectWithMaterials.threejsObject3D.primitiveType = primitiveProperties.primitiveType;
      pooledObjectWithMaterials.threejsObject3D.detailLevel = primitiveProperties.detailLevel;
      this.objectsUsedInFrameCounts[primitiveID] += 1;
      if (this.doTheSpinThingy && pooledObjectWithMaterials.initialSpinCountdown > 0) {
        this.liveCodeLabCoreInstance.matrixCommands.pushMatrix();
        this.liveCodeLabCoreInstance.matrixCommands.rotate(pooledObjectWithMaterials.initialSpinCountdown / 50);
      }
      /*
      see
      https://github.com/mrdoob/three.js/wiki/Using-Matrices-&-Object3Ds-in-THREE
      for info on how this works.
      Around 11% of the time is spent doing matrix multiplications, which
      happens every time there is a scale or rotate or move.
      */

      pooledObjectWithMaterials.threejsObject3D.matrixAutoUpdate = false;
      pooledObjectWithMaterials.threejsObject3D.matrix.copy(this.liveCodeLabCoreInstance.matrixCommands.getWorldMatrix());
      pooledObjectWithMaterials.threejsObject3D.matrixWorldNeedsUpdate = true;
      if (this.doTheSpinThingy && pooledObjectWithMaterials.initialSpinCountdown > 0) {
        this.liveCodeLabCoreInstance.matrixCommands.popMatrix();
      }
      if (objectIsNew) {
        pooledObjectWithMaterials.threejsObject3D.matrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeScale(0.0001, 0.0001, 0.0001));
      } else if (a !== 1 || b !== 1 || c !== 1) {
        if (strokeTime) {
          pooledObjectWithMaterials.threejsObject3D.matrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeScale(a + 0.001, b + 0.001, c + 0.001));
        } else {
          if (a > -0.000000001 && a < 0.000000001) {
            a = 0.000000001;
          }
          if (b > -0.000000001 && b < 0.000000001) {
            b = 0.000000001;
          }
          if (c > -0.000000001 && c < 0.000000001) {
            c = 0.000000001;
          }
          pooledObjectWithMaterials.threejsObject3D.matrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeScale(a, b, c));
        }
      }
      if (this.exclusionPrincipleWobble && !(this.doFill && strokeTime)) {
        arrayEqual = function(a, b) {
          var i, _i;
          for (i = _i = 0; _i <= 15; i = ++_i) {
            if (a[i] !== b[i]) {
              return false;
            }
          }
          return true;
        };
        if (arrayEqual(pooledObjectWithMaterials.threejsObject3D.matrix.elements, this.lastPositionOfPrimitiveType[primitiveID].elements)) {
          this.numberOfOverlappingPrimitives[primitiveID]++;
          overlapPrimtives = this.numberOfOverlappingPrimitives[primitiveID];
          pert = sin(time * 10) * sin(overlapPrimtives + time * 10) / 40;
          pooledObjectWithMaterials.threejsObject3D.matrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeRotationFromEuler(new this.liveCodeLabCore_three.Euler(pert, pert, pert, 'XYZ')));
          pooledObjectWithMaterials.threejsObject3D.matrix.multiply(new this.liveCodeLabCore_three.Matrix4().makeTranslation(pert, pert, pert));
        } else {
          this.lastPositionOfPrimitiveType[primitiveID].copy(pooledObjectWithMaterials.threejsObject3D.matrix);
        }
      }
      if (objectIsNew) {
        return this.liveCodeLabCoreInstance.threeJsSystem.scene.add(pooledObjectWithMaterials.threejsObject3D);
      }
    };

    GraphicsCommands.prototype.commonPrimitiveDrawingLogic = function(a, b, c, d, primitiveProperties) {
      var appendedFunction;
      if (this.liveCodeLabCoreInstance.animationLoop.noDrawFrame) {
        return;
      }
      if (typeof a !== "number") {
        if (isFunction(a)) {
          appendedFunction = a;
        }
        a = 1;
        b = 1;
        c = 1;
      } else if (typeof b !== "number") {
        if (isFunction(b)) {
          appendedFunction = b;
        }
        b = a;
        c = a;
      } else if (typeof c !== "number") {
        if (isFunction(c)) {
          appendedFunction = c;
        }
        c = 1;
      } else if (isFunction(d)) {
        appendedFunction = d;
      }
      if (!this.doStroke && (!this.doFill || !primitiveProperties.canFill)) {
        if (appendedFunction != null) {
          appendedFunction();
        }
        return;
      }
      if ((primitiveProperties.canFill && this.doFill && (this.currentStrokeSize === 0 || !this.doStroke || (this.currentStrokeSize <= 1 && !this.defaultNormalFill && !this.defaultNormalStroke && this.currentStrokeColor === this.currentFillColor && this.currentFillAlpha === 1 && this.currentStrokeAlpha === 1))) || (this.currentStrokeSize <= 1 && this.defaultNormalFill && this.defaultNormalStroke)) {
        this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, this.currentFillColor, this.currentFillAlpha, this.defaultNormalFill);
      } else if ((!this.doFill || !primitiveProperties.canFill) && this.doStroke) {
        this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, this.currentStrokeColor, this.currentStrokeAlpha, this.defaultNormalStroke);
      } else {
        this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, true, this.currentStrokeColor, this.currentStrokeAlpha, this.defaultNormalStroke);
        this.createObjectIfNeededAndDressWithCorrectMaterial(a, b, c, primitiveProperties, false, this.currentFillColor, this.currentFillAlpha, this.defaultNormalFill);
      }
      if (appendedFunction != null) {
        appendedFunction();
      }
    };

    GraphicsCommands.prototype.reset = function() {
      var i, _i, _ref, _results;
      this.atLeastOneObjectIsDrawn = false;
      this.resetFillStack();
      this.resetStrokeStack();
      this.currentStrokeSize = 1;
      this.ballDetLevel = this.liveCodeLabCoreInstance.threeJsSystem.ballDefaultDetLevel;
      this.objectsUsedInFrameCounts[this.primitiveTypes.ambientLight] = 0;
      this.objectsUsedInFrameCounts[this.primitiveTypes.line] = 0;
      this.objectsUsedInFrameCounts[this.primitiveTypes.rect] = 0;
      this.objectsUsedInFrameCounts[this.primitiveTypes.box] = 0;
      this.objectsUsedInFrameCounts[this.primitiveTypes.peg] = 0;
      _results = [];
      for (i = _i = 0, _ref = this.maximumBallDetail - this.minimumBallDetail + 1; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.objectsUsedInFrameCounts[this.primitiveTypes.ball + i] = 0);
      }
      return _results;
    };

    GraphicsCommands.prototype.line = function(a, b, c, d) {
      var primitiveProperties, rememberIfThereWasAFill, rememberPreviousStrokeSize;
      if (d == null) {
        d = null;
      }
      if (this.liveCodeLabCoreInstance.lightSystem.lightsAreOn) {
        rememberIfThereWasAFill = this.doFill;
        rememberPreviousStrokeSize = this.currentStrokeSize;
        if (this.currentStrokeSize < 2) {
          this.currentStrokeSize = 2;
        }
        if (a == null) {
          a = 1;
        }
        this.rect(0, a, 0, d);
        this.doFill = rememberIfThereWasAFill;
        this.currentStrokeSize = rememberPreviousStrokeSize;
        return;
      }
      primitiveProperties = {
        canFill: false,
        primitiveType: this.primitiveTypes.line,
        sidedness: this.liveCodeLabCore_three.FrontSide,
        threeObjectConstructor: this.liveCodeLabCore_three.Line,
        detailLevel: 0
      };
      return this.commonPrimitiveDrawingLogic(a, b, c, d, primitiveProperties);
    };

    GraphicsCommands.prototype.rect = function(a, b, c, d) {
      var primitiveProperties;
      if (d == null) {
        d = null;
      }
      primitiveProperties = {
        canFill: true,
        primitiveType: this.primitiveTypes.rect,
        sidedness: this.liveCodeLabCore_three.DoubleSide,
        threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
        detailLevel: 0
      };
      return this.commonPrimitiveDrawingLogic(a, b, c, d, primitiveProperties);
    };

    GraphicsCommands.prototype.box = function(a, b, c, d) {
      var primitiveProperties;
      if (d == null) {
        d = null;
      }
      primitiveProperties = {
        canFill: true,
        primitiveType: this.primitiveTypes.box,
        sidedness: this.liveCodeLabCore_three.FrontSide,
        threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
        detailLevel: 0
      };
      return this.commonPrimitiveDrawingLogic(a, b, c, d, primitiveProperties);
    };

    GraphicsCommands.prototype.peg = function(a, b, c, d) {
      var primitiveProperties;
      if (d == null) {
        d = null;
      }
      primitiveProperties = {
        canFill: true,
        primitiveType: this.primitiveTypes.peg,
        sidedness: this.liveCodeLabCore_three.FrontSide,
        threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
        detailLevel: 0
      };
      return this.commonPrimitiveDrawingLogic(a, b, c, d, primitiveProperties);
    };

    GraphicsCommands.prototype.ballDetail = function(a) {
      if (a == null) {
        return;
      }
      if (a < 2) {
        a = 2;
      }
      if (a > 30) {
        a = 30;
      }
      return this.ballDetLevel = Math.round(a);
    };

    GraphicsCommands.prototype.ball = function(a, b, c, d) {
      var primitiveProperties;
      if (d == null) {
        d = null;
      }
      primitiveProperties = {
        canFill: true,
        primitiveType: this.primitiveTypes.ball,
        sidedness: this.liveCodeLabCore_three.FrontSide,
        threeObjectConstructor: this.liveCodeLabCore_three.Mesh,
        detailLevel: this.ballDetLevel - this.minimumBallDetail
      };
      return this.commonPrimitiveDrawingLogic(a, b, c, d, primitiveProperties);
    };

    GraphicsCommands.prototype.fill = function(r, g, b, a, f) {
      var appendedFunction;
      if (typeof r !== "number") {
        if (isFunction(r)) {
          appendedFunction = r;
        }
        r = void 0;
        g = void 0;
        b = void 0;
        a = void 0;
        f = void 0;
      } else if (typeof g !== "number") {
        if (isFunction(g)) {
          appendedFunction = g;
        }
        g = void 0;
        b = void 0;
        a = void 0;
        f = void 0;
      } else if (typeof b !== "number") {
        if (isFunction(b)) {
          appendedFunction = b;
        }
        b = void 0;
        a = void 0;
        f = void 0;
      } else if (typeof a !== "number") {
        if (isFunction(a)) {
          appendedFunction = a;
        }
        a = void 0;
        f = void 0;
      } else if (typeof f !== "number") {
        if (isFunction(f)) {
          appendedFunction = f;
        }
        f = void 0;
      } else {
        appendedFunction = void 0;
      }
      if (appendedFunction != null) {
        this.pushFill(this.defaultNormalFill, this.currentFillColor, this.currentFillAlpha, this.doFill);
      }
      this.doFill = true;
      if (r !== this.angleColor) {
        this.defaultNormalFill = false;
        this.currentFillColor = this.liveCodeLabCoreInstance.colourFunctions.color(r, g, b);
        this.currentFillAlpha = this.liveCodeLabCoreInstance.colourFunctions.alphaZeroToOne(this.liveCodeLabCoreInstance.colourFunctions.color(r, g, b, a));
      } else {
        this.defaultNormalFill = true;
        this.currentFillColor = this.angleColor;
        if ((b == null) && (g == null)) {
          this.currentFillAlpha = g / this.liveCodeLabCoreInstance.colourFunctions.colorModeA;
        } else {
          this.currentFillAlpha = 1;
        }
      }
      if (appendedFunction != null) {
        appendedFunction();
        return this.popFill();
      }
    };

    /*
    The noFill() function disables filling geometry.
    If both <b>noStroke()</b> and <b>noFill()</b>
    are called, no shapes will be drawn to the screen.
    
    @see #fill()
    */


    GraphicsCommands.prototype.noFill = function(a) {
      var appendedFunction;
      if (isFunction(a)) {
        appendedFunction = a;
      }
      if (appendedFunction != null) {
        this.pushFill(this.defaultNormalFill, this.currentFillColor, this.currentFillAlpha, this.doFill);
      }
      this.doFill = false;
      this.defaultNormalFill = false;
      if (appendedFunction != null) {
        appendedFunction();
        return this.popFill();
      }
    };

    /*
    The stroke() function sets the color used to
    draw lines and borders around shapes.
    This color is either specified in terms
    of the RGB or HSB color depending on the
    current <b>colorMode()</b> (the default color space is RGB, with each
    value in the range from 0 to 255).
    <br><br>When using hexadecimal notation to specify a color, use "#" or
    "0x" before the values (e.g. #CCFFAA, 0xFFCCFFAA). The # syntax uses six
    digits to specify a color (the way colors are specified in HTML and CSS).
    When using the hexadecimal notation starting with "0x", the hexadecimal
    value must be specified with eight characters; the first two characters
    define the alpha component and the remainder the red, green, and blue
    components.
    <br><br>The value for the parameter "gray" must be less than or equal
    to the current maximum value as specified by <b>colorMode()</b>.
    The default maximum value is 255.
    
    @param {int|float} gray    number specifying value between white and black
    @param {int|float} value1  red or hue value
    @param {int|float} value2  green or saturation value
    @param {int|float} value3  blue or brightness value
    @param {int|float} alpha   opacity of the stroke
    @param {Color} color       any value of the color datatype
    @param {int} hex           color value in hex notation
                               (i.e. #FFCC00 or 0xFFFFCC00)
    
    @see #fill()
    @see #noStroke()
    @see #tint()
    @see #background()
    @see #colorMode()
    */


    GraphicsCommands.prototype.stroke = function(r, g, b, a, f) {
      var appendedFunction;
      if (typeof r !== "number") {
        if (isFunction(r)) {
          appendedFunction = r;
        }
        r = void 0;
        g = void 0;
        b = void 0;
        a = void 0;
        f = void 0;
      } else if (typeof g !== "number") {
        if (isFunction(g)) {
          appendedFunction = g;
        }
        g = void 0;
        b = void 0;
        a = void 0;
        f = void 0;
      } else if (typeof b !== "number") {
        if (isFunction(b)) {
          appendedFunction = b;
        }
        b = void 0;
        a = void 0;
        f = void 0;
      } else if (typeof a !== "number") {
        if (isFunction(a)) {
          appendedFunction = a;
        }
        a = void 0;
        f = void 0;
      } else if (typeof f !== "number") {
        if (isFunction(f)) {
          appendedFunction = f;
        }
        f = void 0;
      } else {
        appendedFunction = void 0;
      }
      if (appendedFunction != null) {
        this.pushStroke(this.defaultNormalStroke, this.currentStrokeColor, this.currentStrokeAlpha, this.doStroke);
      }
      this.doStroke = true;
      if (r !== this.angleColor) {
        this.defaultNormalStroke = false;
        this.currentStrokeColor = this.liveCodeLabCoreInstance.colourFunctions.color(r, g, b);
        this.currentStrokeAlpha = this.liveCodeLabCoreInstance.colourFunctions.alphaZeroToOne(this.liveCodeLabCoreInstance.colourFunctions.color(r, g, b, a));
      } else {
        this.defaultNormalStroke = true;
        this.currentStrokeColor = this.angleColor;
        if ((b == null) && (g == null)) {
          this.currentStrokeAlpha = g / this.liveCodeLabCoreInstance.colourFunctions.colorModeA;
        } else {
          this.currentStrokeAlpha = 1;
        }
      }
      if (appendedFunction != null) {
        appendedFunction();
        return this.popStroke();
      }
    };

    /*
    The noStroke() function disables drawing the stroke (outline).
    If both <b>noStroke()</b> and <b>noFill()</b> are called, no shapes
    will be drawn to the screen.
    
    @see #stroke()
    */


    GraphicsCommands.prototype.noStroke = function(a) {
      var appendedFunction;
      if (isFunction(a)) {
        appendedFunction = a;
      }
      if (appendedFunction != null) {
        this.pushStroke(this.defaultNormalStroke, this.currentStrokeColor, this.currentStrokeAlpha, this.doStroke);
      }
      this.doStroke = false;
      if (appendedFunction != null) {
        appendedFunction();
        return this.popStroke();
      }
    };

    GraphicsCommands.prototype.strokeSize = function(a) {
      if (a == null) {
        a = 1;
      } else {
        if (a < 0) {
          a = 0;
        }
      }
      return this.currentStrokeSize = a;
    };

    return GraphicsCommands;

  })();
  return GraphicsCommands;
});

/*
//@ sourceMappingURL=graphics-commands.js.map
*/