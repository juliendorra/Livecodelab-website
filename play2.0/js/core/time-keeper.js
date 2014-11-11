/*
## Keeps the time. A small thing to do, but it allows tricks such as
## setting a fake time for testing purposes, and avoiding repeated and
## unnecessary invokation of the Date and getTime browser functions.
*/

var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(['core/event-emitter', 'pulse'], function(EventEmitter, PulseEmpty) {
  var TimeKeeper;
  TimeKeeper = (function(_super) {
    __extends(TimeKeeper, _super);

    function TimeKeeper() {
      this.time = void 0;
      this.millisAtStart = void 0;
      this.milliseconds = void 0;
      this.bpm = 100;
      this.newBpm = void 0;
      this.mspb = 60000 / this.bpm;
      this.lastBeat = void 0;
      this.nextQuarterBeat = 0;
      this.beatCount = 1;
      this.fraction = 0;
      this.pulseClient = new Pulse();
      TimeKeeper.__super__.constructor.call(this);
      this.resetTime();
      this.beatLoop();
    }

    TimeKeeper.prototype.addToScope = function(scope) {
      var _this = this;
      this.scope = scope;
      scope.add('bpm', function(bpm) {
        return _this.setBpmLater(bpm);
      });
      scope.add('beat', function() {
        return _this.beat();
      });
      scope.add('pulse', function(frequency) {
        return _this.pulse(frequency);
      });
      scope.add('wave', function(frequency) {
        return _this.wave(frequency);
      });
      return scope.add('time', this.time);
    };

    TimeKeeper.prototype.setTime = function(value) {
      this.time = value;
      if (this.scope) {
        return this.scope.add('time', this.time);
      }
    };

    /*
    This is the beat loop that runs at 4 quarters to the beat, emitting
    an event for every quarter. It uses setTimeout in stead of setInterval
    because the BPM could change.
    */


    TimeKeeper.prototype.beatLoop = function() {
      var delta, now,
        _this = this;
      now = new Date().getTime();
      this.emit('beat', this.beatCount + this.fraction);
      if (this.fraction === 1) {
        this.fraction = 0;
        this.beatCount += 1;
        if (this.pulseClient.currentConnection() && this.pulseClient.beats.length) {
          this.setBpm(this.pulseClient.bpm);
          if (this.pulseClient.count === 1 && this.lastBeat !== this.pulseClient.beats[this.pulseClient.beats.length - 1]) {
            this.beatCount = 1;
            this.lastBeat = this.pulseClient.beats[this.pulseClient.beats.length - 1];
          } else {
            this.lastBeat = this.pulseClient.beats[this.pulseClient.beats.length - 1] + this.mspb * (this.beatCount - this.pulseClient.count);
          }
        } else {
          this.lastBeat += this.mspb;
        }
      }
      this.fraction += 0.25;
      this.nextQuarterBeat = this.lastBeat + this.mspb * this.fraction;
      delta = this.nextQuarterBeat - new Date().getTime();
      return setTimeout((function() {
        return _this.beatLoop();
      }), delta);
    };

    TimeKeeper.prototype.resetTime = function() {
      this.lastBeat = this.millisAtStart = new Date().getTime();
      return this.updateTime();
    };

    TimeKeeper.prototype.updateTime = function() {
      this.milliseconds = new Date().getTime();
      return this.setTime((this.milliseconds - this.millisAtStart) / 1000);
    };

    TimeKeeper.prototype.setBpmLater = function(bpm) {
      var _this = this;
      if (bpm !== this.newBpm) {
        clearTimeout(this.setBpmTimeout);
        this.newBpm = bpm;
        return this.setBpmTimeout = setTimeout((function() {
          return _this.setBpmOrConnect(bpm);
        }), 1000);
      }
    };

    TimeKeeper.prototype.setBpmOrConnect = function(bpmOrAddress) {
      if (bpmOrAddress == null) {
        return;
      }
      if (typeof bpmOrAddress === 'string') {
        return this.connect(bpmOrAddress);
      } else if (bpmOrAddress !== this.bpm) {
        if (this.pulseClient.currentConnection()) {
          this.pulseClient.disconnect();
        }
        return this.setBpm(bpmOrAddress);
      }
    };

    TimeKeeper.prototype.setBpm = function(bpm) {
      this.bpm = Math.max(20, Math.min(bpm, 250));
      return this.mspb = 60000 / this.bpm;
    };

    /*
    Connects to a pulse server, and read the bpm/beat from there.
    */


    TimeKeeper.prototype.connect = function(address) {
      if (address && !(this.pulseClient.connecting || this.pulseClient.currentConnection() === this.pulseClient.cleanAddress(address))) {
        console.log('Connecting to ' + address);
        this.pulseClient.connect(address);
      }
    };

    TimeKeeper.prototype.beat = function() {
      var passed;
      passed = new Date().getTime() - this.lastBeat;
      return this.beatCount + passed / this.mspb;
    };

    TimeKeeper.prototype.pulse = function(frequency) {
      if (typeof frequency !== "number") {
        frequency = 1;
      }
      return Math.exp(-Math.pow(Math.pow((this.beat() * frequency) % 1, 0.3) - 0.5, 2) / 0.05);
    };

    TimeKeeper.prototype.wave = function(frequency) {
      if (typeof frequency !== "number") {
        frequency = 1;
      }
      return sin((this.beat() * frequency) * Math.PI);
    };

    return TimeKeeper;

  })(EventEmitter);
  return TimeKeeper;
});

/*
//@ sourceMappingURL=time-keeper.js.map
*/