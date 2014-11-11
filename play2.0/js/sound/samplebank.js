/*
## The SampleBank is responsible for holding the filepaths to any audio that
## needs to be loaded by the browser.
##
## It automatically handles returning the ogg or mp3 file path.
*/

define(function() {
  var SampleBank;
  SampleBank = (function() {
    SampleBank.prototype.sounds = [];

    SampleBank.prototype.soundsByName = {};

    SampleBank.prototype.fileType = void 0;

    function SampleBank(buzz) {
      this.fileType = void 0;
      if (buzz.isMP3Supported()) {
        this.fileType = "mp3";
      } else if (buzz.isOGGSupported()) {
        this.fileType = "ogg";
      } else {
        return;
      }
      this.load("alienBeep", "./sound/audioFiles/132389__blackie666__alienbleep");
      this.load("beep", "./sound/audioFiles/100708__steveygos93__bleep_a");
      this.load("beep0", "./sound/audioFiles/100708__steveygos93__bleep_a");
      this.load("beep1", "./sound/audioFiles/100708__steveygos93__bleep_b");
      this.load("beep2", "./sound/audioFiles/100708__steveygos93__bleep_c");
      this.load("beep3", "./sound/audioFiles/100708__steveygos93__bleep_d");
      this.load("bing", "./sound/audioFiles/start_bing");
      this.load("ciack", "./sound/audioFiles/ciack");
      this.load("ciack0", "./sound/audioFiles/ciack");
      this.load("ciack1", "./sound/audioFiles/a-ciack2");
      this.load("cosmos", "./sound/audioFiles/cosmos");
      this.load("crash", "./sound/audioFiles/CRASH_1");
      this.load("crash0", "./sound/audioFiles/CRASH_1");
      this.load("crash1", "./sound/audioFiles/CRASH_5");
      this.load("crash2", "./sound/audioFiles/CRASH_6");
      this.load("detune", "./sound/audioFiles/detune");
      this.load("dish", "./sound/audioFiles/dish");
      this.load("dish0", "./sound/audioFiles/dish");
      this.load("dish1", "./sound/audioFiles/a-dish2");
      this.load("dish2", "./sound/audioFiles/a-dish3");
      this.load("downstairs", "./sound/audioFiles/downstairs");
      this.load("glass", "./sound/audioFiles/glass");
      this.load("growl", "./sound/audioFiles/growl1");
      this.load("growl0", "./sound/audioFiles/growl1");
      this.load("growl1", "./sound/audioFiles/growl2");
      this.load("growl2", "./sound/audioFiles/growl3");
      this.load("growl3", "./sound/audioFiles/growl4");
      this.load("growl4", "./sound/audioFiles/growl5");
      this.load("growl5", "./sound/audioFiles/growl6");
      this.load("highHatClosed", "./sound/audioFiles/AMB_HHCL");
      this.load("highHatOpen", "./sound/audioFiles/AMB_HHOP");
      this.load("hiss", "./sound/audioFiles/a-hiss1");
      this.load("hiss0", "./sound/audioFiles/a-hiss1");
      this.load("hiss1", "./sound/audioFiles/a-hiss2");
      this.load("hiss2", "./sound/audioFiles/a-hiss3");
      this.load("hoover", "./sound/audioFiles/hoover1");
      this.load("hoover0", "./sound/audioFiles/hoover1");
      this.load("hoover1", "./sound/audioFiles/hoover2");
      this.load("lowFlash", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04");
      this.load("lowFlash0", "./sound/audioFiles/9569__thanvannispen__industrial-low-flash04");
      this.load("lowFlash1", "./sound/audioFiles/9570__thanvannispen__industrial-low-flash07");
      this.load("mouth", "./sound/audioFiles/a-mouth1");
      this.load("mouth0", "./sound/audioFiles/a-mouth1");
      this.load("mouth1", "./sound/audioFiles/a-mouth2");
      this.load("mouth2", "./sound/audioFiles/a-mouth3");
      this.load("mouth3", "./sound/audioFiles/a-mouth4");
      this.load("mouth4", "./sound/audioFiles/a-mouth5");
      this.load("penta0", "./sound/audioFiles/toneMatrix-1");
      this.load("penta1", "./sound/audioFiles/toneMatrix-2");
      this.load("penta2", "./sound/audioFiles/toneMatrix-3");
      this.load("penta3", "./sound/audioFiles/toneMatrix-4");
      this.load("penta4", "./sound/audioFiles/toneMatrix-5");
      this.load("penta5", "./sound/audioFiles/toneMatrix-6");
      this.load("penta6", "./sound/audioFiles/toneMatrix-7");
      this.load("penta7", "./sound/audioFiles/toneMatrix-8");
      this.load("penta8", "./sound/audioFiles/toneMatrix-9");
      this.load("penta9", "./sound/audioFiles/toneMatrix-10");
      this.load("penta10", "./sound/audioFiles/toneMatrix-11");
      this.load("penta11", "./sound/audioFiles/toneMatrix-12");
      this.load("penta12", "./sound/audioFiles/toneMatrix-13");
      this.load("penta13", "./sound/audioFiles/toneMatrix-14");
      this.load("penta14", "./sound/audioFiles/toneMatrix-15");
      this.load("penta15", "./sound/audioFiles/toneMatrix-16");
      this.load("pianoLDChord", "./sound/audioFiles/pianoLDChordsA");
      this.load("pianoLDChord0", "./sound/audioFiles/pianoLDChordsA");
      this.load("pianoLDChord1", "./sound/audioFiles/pianoLDChordsB");
      this.load("pianoLDChord2", "./sound/audioFiles/pianoLDChordsC");
      this.load("pianoLDChord3", "./sound/audioFiles/pianoLDChordsE");
      this.load("pianoLHChord", "./sound/audioFiles/pianoLHChordsA");
      this.load("pianoLHChord0", "./sound/audioFiles/pianoLHChordsA");
      this.load("pianoLHChord1", "./sound/audioFiles/pianoLHChordsB");
      this.load("pianoLHChord2", "./sound/audioFiles/pianoLHChordsC");
      this.load("pianoLHChord3", "./sound/audioFiles/pianoLHChordsE");
      this.load("pianoRHChord", "./sound/audioFiles/pianoRHChordsA");
      this.load("pianoRHChord0", "./sound/audioFiles/pianoRHChordsA");
      this.load("pianoRHChord1", "./sound/audioFiles/pianoRHChordsB");
      this.load("pianoRHChord2", "./sound/audioFiles/pianoRHChordsC");
      this.load("pianoRHChord3", "./sound/audioFiles/pianoRHChordsE");
      this.load("ride", "./sound/audioFiles/RIDE_1");
      this.load("rust", "./sound/audioFiles/rust1");
      this.load("rust0", "./sound/audioFiles/rust1");
      this.load("rust1", "./sound/audioFiles/rust2");
      this.load("rust2", "./sound/audioFiles/rust3");
      this.load("scratch", "./sound/audioFiles/scratch1");
      this.load("scratch0", "./sound/audioFiles/scratch1");
      this.load("scratch1", "./sound/audioFiles/scratch2");
      this.load("scratch2", "./sound/audioFiles/scratch4");
      this.load("scratch3", "./sound/audioFiles/scratch5");
      this.load("scratch4", "./sound/audioFiles/scratch6");
      this.load("scratch5", "./sound/audioFiles/scratch7");
      this.load("scratch6", "./sound/audioFiles/scratch8");
      this.load("scratch7", "./sound/audioFiles/scratch9");
      this.load("scratch8", "./sound/audioFiles/scratch10");
      this.load("scratch9", "./sound/audioFiles/scratch11");
      this.load("scratch10", "./sound/audioFiles/scratch17");
      this.load("scratch11", "./sound/audioFiles/scratch21");
      this.load("scratch12", "./sound/audioFiles/scratch22");
      this.load("scratch13", "./sound/audioFiles/scratch24");
      this.load("scratch-high", "./sound/audioFiles/scratch19");
      this.load("scratch-high0", "./sound/audioFiles/scratch19");
      this.load("scratch-high1", "./sound/audioFiles/scratch20");
      this.load("scratch-long", "./sound/audioFiles/scratch3");
      this.load("scratch-long0", "./sound/audioFiles/scratch3");
      this.load("scratch-long1", "./sound/audioFiles/scratch26");
      this.load("scratch-long2", "./sound/audioFiles/scratch27");
      this.load("scratch-long3", "./sound/audioFiles/scratch28");
      this.load("scratch-med", "./sound/audioFiles/scratch12");
      this.load("scratch-med0", "./sound/audioFiles/scratch12");
      this.load("scratch-med1", "./sound/audioFiles/scratch13");
      this.load("scratch-med2", "./sound/audioFiles/scratch14");
      this.load("scratch-med3", "./sound/audioFiles/scratch15");
      this.load("scratch-med4", "./sound/audioFiles/scratch16");
      this.load("scratch-med5", "./sound/audioFiles/scratch18");
      this.load("scratch-med6", "./sound/audioFiles/scratch23");
      this.load("scratch-med7", "./sound/audioFiles/scratch25");
      this.load("scratch-med8", "./sound/audioFiles/scratch31");
      this.load("scratch-rough", "./sound/audioFiles/scratch32");
      this.load("scratch-rough0", "./sound/audioFiles/scratch32");
      this.load("scratch-rough1", "./sound/audioFiles/scratch33");
      this.load("scratch-rough2", "./sound/audioFiles/scratch34");
      this.load("scratch-rough3", "./sound/audioFiles/scratch35");
      this.load("siren", "./sound/audioFiles/siren1");
      this.load("siren0", "./sound/audioFiles/siren1");
      this.load("siren1", "./sound/audioFiles/siren2");
      this.load("siren2", "./sound/audioFiles/siren3");
      this.load("siren3", "./sound/audioFiles/siren4");
      this.load("snap", "./sound/audioFiles/snap");
      this.load("snap0", "./sound/audioFiles/snap");
      this.load("snap1", "./sound/audioFiles/a-snap2");
      this.load("snare", "./sound/audioFiles/AMB_SN13");
      this.load("snare0", "./sound/audioFiles/AMB_SN13");
      this.load("snare1", "./sound/audioFiles/AMB_SN_5");
      this.load("snare2", "./sound/audioFiles/a-snare2");
      this.load("thump", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2");
      this.load("thump0", "./sound/audioFiles/8938__patchen__piano-hits-hand-03v2");
      this.load("thump1", "./sound/audioFiles/thump2");
      this.load("thump2", "./sound/audioFiles/a-thump2");
      this.load("tap", "./sound/audioFiles/tap6");
      this.load("tap0", "./sound/audioFiles/tap6");
      this.load("tap1", "./sound/audioFiles/tap3");
      this.load("tap2", "./sound/audioFiles/tap4");
      this.load("tap3", "./sound/audioFiles/tap1");
      this.load("tap4", "./sound/audioFiles/tap5");
      this.load("tap5", "./sound/audioFiles/tap7");
      this.load("tense", "./sound/audioFiles/tense1");
      this.load("tense0", "./sound/audioFiles/tense1");
      this.load("tense1", "./sound/audioFiles/tense2");
      this.load("tense2", "./sound/audioFiles/tense3");
      this.load("tense3", "./sound/audioFiles/tense4");
      this.load("tense4", "./sound/audioFiles/tense5");
      this.load("tense5", "./sound/audioFiles/tense6");
      this.load("toc", "./sound/audioFiles/AMB_LTM2");
      this.load("toc0", "./sound/audioFiles/AMB_LTM2");
      this.load("toc1", "./sound/audioFiles/AMB_RIM1");
      this.load("tranceKick", "./sound/audioFiles/33325__laya__trance-kick01");
      this.load("tranceKick0", "./sound/audioFiles/33325__laya__trance-kick01");
      this.load("tranceKick1", "./sound/audioFiles/24004__laya__dance-kick3");
      this.load("tranceKick2", "./sound/audioFiles/anotherKick");
      this.load("tweet", "./sound/audioFiles/tweet1-shaped");
      this.load("tweet1", "./sound/audioFiles/tweet1-shaped");
      this.load("tweet2", "./sound/audioFiles/tweet2-shaped");
      this.load("tweet3", "./sound/audioFiles/tweet3-shaped");
      this.load("tweet4", "./sound/audioFiles/tweet4-shaped");
      this.load("tweet5", "./sound/audioFiles/tweet5-shaped");
      this.load("tweet6", "./sound/audioFiles/tweet6-shaped");
      this.load("tweet7", "./sound/audioFiles/tweet7-shaped");
      this.load("tweet8", "./sound/audioFiles/tweet8-shaped");
      this.load("tweet9", "./sound/audioFiles/tweet9-shaped");
      this.load("tweet10", "./sound/audioFiles/tweet10-shaped");
      this.load("tweet11", "./sound/audioFiles/tweet11-shaped");
      this.load("tweet12", "./sound/audioFiles/tweet12-shaped");
      this.load("tweet13", "./sound/audioFiles/tweet13-shaped");
      this.load("voltage", "./sound/audioFiles/49255__keinzweiter__bonobob-funk");
      this.load("warm", "./sound/audioFiles/warm");
    }

    SampleBank.prototype.load = function(name, path) {
      var soundNumber;
      soundNumber = this.sounds.length;
      this.sounds.push({
        name: name,
        path: path + "." + this.fileType
      });
      this.soundsByName[name] = soundNumber;
      return soundNumber;
    };

    SampleBank.prototype.getByName = function(name) {
      return this.sounds[this.soundsByName[name]];
    };

    SampleBank.prototype.getByNumber = function(number) {
      return this.sounds[number];
    };

    return SampleBank;

  })();
  return SampleBank;
});

/*
//@ sourceMappingURL=samplebank.js.map
*/