/*
## SoundSystem tries to abstract away different ways of playing sound,
## according to weird performance characteristics of each browser
## (and probably, OS). Cross-browser sound playing is really in a sorry
## state, we are trying to make do here.
*/

define(function() {
  var SoundSystem;
  SoundSystem = (function() {
    SoundSystem.prototype.soundLoopTimer = void 0;

    SoundSystem.prototype.beatNumber = 0;

    SoundSystem.prototype.totalCreatedSoundObjects = 0;

    SoundSystem.prototype.soundSystemIsMangled = false;

    SoundSystem.prototype.CHANNELSPERSOUND = 6;

    SoundSystem.prototype.endedFirstPlay = 0;

    SoundSystem.prototype.buzzObjectsPool = [];

    SoundSystem.prototype.soundFilesPaths = {};

    SoundSystem.prototype.soundLoops = [];

    function SoundSystem(eventRouter, timeKeeper, buzz, lowLag, Bowser, samplebank) {
      var _this = this;
      this.eventRouter = eventRouter;
      this.timeKeeper = timeKeeper;
      this.buzz = buzz;
      this.lowLag = lowLag;
      this.Bowser = Bowser;
      this.samplebank = samplebank;
      this.soundLoops.soundIDs = [];
      this.soundLoops.beatStrings = [];
      this.timeKeeper.addListener('beat', function(beat) {
        return _this.soundLoop(beat);
      });
      this.playSound = function(a, b, c) {
        return _this.play_using_LOWLAGJS(a, b, c);
      };
    }

    SoundSystem.prototype.addToScope = function(scope) {
      var _this = this;
      scope.add('bpm', function(a) {
        return _this.bpm(a);
      });
      return scope.add('play', function(a, b) {
        return _this.play(a, b);
      });
    };

    SoundSystem.prototype.resetLoops = function() {
      this.soundLoops.soundIDs = [];
      return this.soundLoops.beatStrings = [];
    };

    SoundSystem.prototype.playStartupSound = function() {
      var startup;
      startup = new this.buzz.sound(this.samplebank.getByName("bing").path);
      return startup.play();
    };

    SoundSystem.prototype.play = function(soundID, beatString) {
      beatString = beatString.replace(/\s*/g, "");
      this.soundLoops.soundIDs.push(soundID);
      return this.soundLoops.beatStrings.push(beatString);
    };

    SoundSystem.prototype.play_using_BUZZ_JS_FIRE_AND_FORGET = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
      var availableBuzzObject, soundFilePath;
      this.buzzObjectsPool = buzzObjectsPool;
      soundFilePath = void 0;
      soundFilePath = soundFilesPaths[loopedSoundID];
      availableBuzzObject = new this.buzz.sound(soundFilePath);
      return availableBuzzObject.play();
    };

    SoundSystem.prototype.play_using_DYNAMICALLY_CREATED_AUDIO_TAG = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
      var audioElement, soundFilePath, source1,
        _this = this;
      this.buzzObjectsPool = buzzObjectsPool;
      audioElement = void 0;
      source1 = void 0;
      soundFilePath = void 0;
      soundFilePath = soundFilesPaths[loopedSoundID];
      audioElement = document.createElement("audio");
      audioElement.setAttribute("preload", "auto");
      audioElement.autobuffer = true;
      source1 = document.createElement("source");
      source1.type = "audio/ogg";
      source1.src = soundFilePath;
      audioElement.appendChild(source1);
      audioElement.addEventListener("load", (function() {
        audioElement.play();
        return $(".filename span").html(audioElement.src);
      }), true);
      return audioElement.play();
    };

    SoundSystem.prototype.play_using_LOWLAGJS = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
      this.buzzObjectsPool = buzzObjectsPool;
      return this.lowLag.play(loopedSoundID);
    };

    SoundSystem.prototype.play_using_BUZZJS_WITH_ONE_POOL_PER_SOUND = function(soundFilesPaths, loopedSoundID, buzzObjectsPool) {
      var allBuzzObjectsForWantedSound, availableBuzzObject, buzzObject, _i, _len;
      this.buzzObjectsPool = buzzObjectsPool;
      availableBuzzObject = void 0;
      allBuzzObjectsForWantedSound = this.buzzObjectsPool[loopedSoundID];
      buzzObject = void 0;
      for (_i = 0, _len = allBuzzObjectsForWantedSound.length; _i < _len; _i++) {
        buzzObject = allBuzzObjectsForWantedSound[_i];
        if (buzzObject.isEnded()) {
          availableBuzzObject = buzzObject;
          break;
        }
      }
      if (availableBuzzObject == null) {
        if (this.totalCreatedSoundObjects > 31) {
          this.soundSystemIsMangled = true;
          $("#soundSystemIsMangledMessage").modal();
          $("#simplemodal-container").height(250);
          return;
        }
        availableBuzzObject = new this.buzz.sound(soundFilesPaths[loopedSoundID]);
        this.buzzObjectsPool[loopedSoundID].push(availableBuzzObject);
        this.totalCreatedSoundObjects += 1;
      }
      return availableBuzzObject.play();
    };

    SoundSystem.prototype.soundLoop = function(beat) {
      var beatString, loopedSoundID, loopingTheSoundIDs, playOrNoPlay, _i, _ref, _results;
      loopedSoundID = void 0;
      playOrNoPlay = void 0;
      beatString = void 0;
      if (this.soundSystemIsMangled) {
        return;
      }
      _results = [];
      for (loopingTheSoundIDs = _i = 0, _ref = this.soundLoops.soundIDs.length; 0 <= _ref ? _i < _ref : _i > _ref; loopingTheSoundIDs = 0 <= _ref ? ++_i : --_i) {
        loopedSoundID = this.soundLoops.soundIDs[loopingTheSoundIDs];
        if (this.soundFilesPaths[loopedSoundID]) {
          beatString = this.soundLoops.beatStrings[loopingTheSoundIDs];
          playOrNoPlay = beatString.charAt(((beat - 1) * 4) % beatString.length);
          if (playOrNoPlay === "x") {
            _results.push(this.playSound(this.soundFilesPaths, loopedSoundID, this.buzzObjectsPool));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    SoundSystem.prototype.isAudioSupported = function() {};

    SoundSystem.prototype.loadAndTestAllTheSounds = function() {
      var cycleSoundDefs, preloadSounds, soundDef, soundInfo, _i, _ref, _results;
      this.lowLag.init({
        sm2url: "js/lib/sm2/swf/"
      });
      soundDef = void 0;
      soundInfo = void 0;
      preloadSounds = void 0;
      soundDef = this.samplebank;
      _results = [];
      for (cycleSoundDefs = _i = 0, _ref = soundDef.sounds.length; 0 <= _ref ? _i < _ref : _i > _ref; cycleSoundDefs = 0 <= _ref ? ++_i : --_i) {
        soundInfo = soundDef.getByNumber(cycleSoundDefs);
        this.soundFilesPaths[soundInfo.name] = soundInfo.path;
        this.lowLag.load(soundInfo.path, soundInfo.name);
        if (!this.Bowser.safari) {
          _results.push(this.eventRouter.emit("all-sounds-loaded-and tested"));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return SoundSystem;

  })();
  return SoundSystem;
});

/*
//@ sourceMappingURL=sound-system.js.map
*/