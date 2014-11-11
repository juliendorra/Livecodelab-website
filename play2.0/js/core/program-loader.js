/*
## ProgramLoader takes care of managing the URL and editor content
## when the user navigates through demos and examples - either by
## selecting menu entries, or by clicking back/forward arrow, or by
## landing on a URL with a hashtag.
*/

define(['Three.Detector'], function(Detector) {
  var ProgramLoader;
  ProgramLoader = (function() {
    function ProgramLoader(eventRouter, texteditor, liveCodeLabCoreInstance) {
      var userWarnedAboutWebglExamples;
      this.eventRouter = eventRouter;
      this.texteditor = texteditor;
      this.liveCodeLabCoreInstance = liveCodeLabCoreInstance;
      this.lastHash = "";
      userWarnedAboutWebglExamples = false;
      this.programs = {
        demos: {},
        tutorials: {}
      };
      this.programs.demos.roseDemo = {
        submenu: "Basic",
        title: "Rose",
        code: "// 'B rose' by Guy John (@rumblesan)\n// Mozilla Festival 2012\n// adapted from 'A rose' by Lib4tech\n\nbackground red\nscale 1.5\nanimationStyle paintOver\nrotate frame/100\nfill 255-((frame/2)%255),0,0\nstroke 255-((frame/2)%255),0,0\nscale 1-((frame/2)%255) / 255\nbox"
      };
      this.programs.demos.cheeseAndOlivesDemo = {
        submenu: "Basic",
        title: "Cheese and olives",
        code: "// 'Cheese and olives' by\n// Davina Tirvengadum\n// Mozilla festival 2012\n\nbackground white\nscale .3\nmove 0,-1\nfill yellow\nstroke black\nrotate\nstrokeSize 3\nline 4\nbox\n\nrotate 2,3\nmove 0,3\nscale .3\nfill black\nstroke black\nball\n\nrotate 3\nmove 5\nscale 1\nfill green\nstroke green\nball\n\nrotate 1\nmove -3\nscale 1\nfill yellow\nstroke yellow\nball"
      };
      this.programs.demos.simpleCubeDemo = {
        submenu: "Basic",
        title: "Simple cube",
        code: "// there you go!\n// a simple cube!\n\nbackground yellow\nrotate 0,time/2,time/2\nbox"
      };
      this.programs.demos.webgltwocubesDemo = {
        submenu: "WebGL",
        title: "WebGL: Two cubes",
        code: "background 155,255,255\n2 times\n▶rotate 0, 1, time/2\n▶box"
      };
      this.programs.demos.cubesAndSpikes = {
        submenu: "Basic",
        title: "Cubes and spikes",
        code: "simpleGradient fuchsia,color(100,200,200),yellow\nscale 2.1\n5 times\n▶rotate 0,1,time/5\n▶box 0.1,0.1,0.1\n▶move 0,0.1,0.1\n▶3 times\n▶▶rotate 0,1,1\n▶▶box 0.01,0.01,1"
      };
      this.programs.demos.webglturbineDemo = {
        submenu: "WebGL",
        title: "WebGL: Turbine",
        code: "background 155,55,255\n70 times\n▶rotate time/100,1,time/100\n▶box"
      };
      this.programs.demos.webglzfightartDemo = {
        submenu: "WebGL",
        title: "WebGL: Z-fight!",
        code: "// Explore the artifacts\n// of your GPU!\n// Go Z-fighting, go!\nscale 5\nrotate\nfill red\nbox\nrotate 0.000001\nfill yellow\nbox"
      };
      this.programs.demos.littleSpiralOfCubes = {
        submenu: "Basic",
        title: "Little spiral",
        code: "background orange\nscale 0.1\n10 times\n▶rotate 0,1,time\n▶move 1,1,1\n▶box"
      };
      this.programs.demos.tentacleDemo = {
        submenu: "Basic",
        title: "Tentacle",
        code: "background 155,255,155\nscale 0.15\n3 times\n▶rotate 0,1,1\n▶10 times\n▶▶rotate 0,1,time\n▶▶scale 0.9\n▶▶move 1,1,1\n▶▶box"
      };
      this.programs.demos.lampDemo = {
        submenu: "Basic",
        title: "Lamp",
        code: "animationStyle motionBlur\nsimpleGradient red,yellow,color(255,0,255)\n//animationStyle paintOver\nscale 2\nrotate time/4, time/4,  time/4\n90 times\n▶rotate time/200, time/200,  time/200\n▶line\n▶move 0.5,0,0\n▶line\n▶move -0.5,0,0\n▶line"
      };
      this.programs.demos.trillionfeathersDemo = {
        submenu: "Basic",
        title: "A trillion feathers",
        code: "animationStyle paintOver\nmove 2,0,0\nscale 2\nrotate\n20 times\n▶rotate\n▶move 0.25,0,0\n▶line\n▶move -0.5,0,0\n▶line"
      };
      this.programs.demos.monsterblobDemo = {
        submenu: "Basic",
        title: "Monster blob",
        code: "ballDetail 6\nanimationStyle motionBlur\nrotate time/5\nsimpleGradient fuchsia,aqua,yellow\n5 times\n▶rotate 0,1,time/5\n▶move 0.2,0,0\n▶3 times\n▶▶rotate 1\n▶▶ball -1"
      };
      this.programs.demos.industrialMusicDemo = {
        submenu: "Sound",
        title: "Sound: Industrial",
        code: "bpm 88\nplay 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\nplay 'beepC'  ,'zxzz zzzz xzzx xxxz'\nplay 'beepA'  ,'zzxz zzzz zzxz zzzz'\nplay 'lowFlash'  ,'zzxz zzzz zzzz zzzz'\nplay 'beepB'  ,'xzzx zzzz zxzz zxzz'\nplay 'voltage'  ,'xzxz zxzz xzxx xzxx'\nplay 'tranceKick'  ,'zxzx zzzx xzzz zzxx'"
      };
      this.programs.demos.overScratch = {
        submenu: "Sound",
        title: "Sound: Over-scratch",
        code: "bpm 108\nplay 'tranceKick'  ,'xzxz zx'\nplay 'tranceKick1'  ,'xzxzxzx'\nplay 'scratch' + int(random(14)) ,'x'\nplay 'scratch-med' + int(random(8)) ,'xz'\nplay 'scratch-high' + int(random(2)) ,'xzzz'\nplay 'scratch-rough' + int(random(4)) ,'xz'"
      };
      this.programs.demos.trySoundsDemo = {
        submenu: "Sound",
        title: "Sound: Try them all",
        code: "bpm 88\n// leave this one as base\nplay 'tranceKick'  ,'zxzx zzzx xzzz zzxx'\n\n// uncomment the sounds you want to try\n//play 'alienBeep'  ,'zzxz zzzz zzxz zzzz'\n//play 'beep'  ,'zzxz zzzz zzxz zzzz'\n//play 'beep0'  ,'zzxz zzzz zzxz zzzz'\n//play 'beep1'  ,'zzxz zzzz zzxz zzzz'\n//play 'beep2'  ,'zzxz zzzz zzxz zzzz'\n//play 'beep3'  ,'zzxz zzzz zzxz zzzz'\n//play 'bing'  ,'zzxz zzzz zzxz zzzz'\n//play 'ciack'  ,'zzxz zzzz zzxz zzzz'\n//play 'ciack0'  ,'zzxz zzzz zzxz zzzz'\n//play 'ciack1'  ,'zzxz zzzz zzxz zzzz'\n//play 'cosmos'  ,'zzxz zzzz zzxz zzzz'\n//play 'crash'  ,'zzxz zzzz zzxz zzzz'\n//play 'crash0'  ,'zzxz zzzz zzxz zzzz'\n//play 'crash1'  ,'zzxz zzzz zzxz zzzz'\n//play 'crash2'  ,'zzxz zzzz zzxz zzzz'\n//play 'detune'  ,'zzxz zzzz zzxz zzzz'\n//play 'dish'  ,'zzxz zzzz zzxz zzzz'\n//play 'dish0'  ,'zzxz zzzz zzxz zzzz'\n//play 'dish1'  ,'zzxz zzzz zzxz zzzz'\n//play 'dish2'  ,'zzxz zzzz zzxz zzzz'\n//play 'downstairs'  ,'zzxz zzzz zzxz zzzz'\n//play 'glass'  ,'zzxz zzzz zzxz zzzz'\n//play 'highHatClosed'  ,'zzxz zzzz zzxz zzzz'\n//play 'highHatOpen'  ,'zzxz zzzz zzxz zzzz'\n//play 'hiss'  ,'zzxz zzzz zzxz zzzz'\n//play 'hiss0'  ,'zzxz zzzz zzxz zzzz'\n//play 'hiss1'  ,'zzxz zzzz zzxz zzzz'\n//play 'hiss2'  ,'zzxz zzzz zzxz zzzz'\n//play 'lowFlash'  ,'zzxz zzzz zzxz zzzz'\n//play 'lowFlash0'  ,'zzxz zzzz zzxz zzzz'\n//play 'lowFlash1'  ,'zzxz zzzz zzxz zzzz'\n//play 'mouth'  ,'zzxz zzzz zzxz zzzz'\n//play 'mouth0'  ,'zzxz zzzz zzxz zzzz'\n//play 'mouth1'  ,'zzxz zzzz zzxz zzzz'\n//play 'mouth2'  ,'zzxz zzzz zzxz zzzz'\n//play 'mouth3'  ,'zzxz zzzz zzxz zzzz'\n//play 'mouth4'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta0'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta1'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta2'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta3'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta4'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta5'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta6'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta7'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta8'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta9'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta10'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta11'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta12'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta13'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta14'  ,'zzxz zzzz zzxz zzzz'\n//play 'penta15'  ,'zzxz zzzz zzxz zzzz'\n//play 'ride'  ,'zzxz zzzz zzxz zzzz'\n//play 'snap'  ,'zzxz zzzz zzxz zzzz'\n//play 'snap0'  ,'zzxz zzzz zzxz zzzz'\n//play 'snap1'  ,'zzxz zzzz zzxz zzzz'\n//play 'snare'  ,'zzxz zzzz zzxz zzzz'\n//play 'snare0'  ,'zzxz zzzz zzxz zzzz'\n//play 'snare1'  ,'zzxz zzzz zzxz zzzz'\n//play 'snare2'  ,'zzxz zzzz zzxz zzzz'\n//play 'thump'  ,'zzxz zzzz zzxz zzzz'\n//play 'thump0'  ,'zzxz zzzz zzxz zzzz'\n//play 'thump1'  ,'zzxz zzzz zzxz zzzz'\n//play 'thump2'  ,'zzxz zzzz zzxz zzzz'\n//play 'toc'  ,'zzxz zzzz zzxz zzzz'\n//play 'toc0'  ,'zzxz zzzz zzxz zzzz'\n//play 'toc1'  ,'zzxz zzzz zzxz zzzz'\n//play 'tranceKick'  ,'zzxz zzzz zzxz zzzz'\n//play 'tranceKick0'  ,'zzxz zzzz zzxz zzzz'\n//play 'tranceKick1'  ,'zzxz zzzz zzxz zzzz'\n//play 'voltage'  ,'zzxz zzzz zzxz zzzz'\n//play 'warm'  ,'zzxz zzzz zzxz zzzz'"
      };
      this.programs.demos.springysquaresDemo = {
        submenu: "Basic",
        title: "Springy squares",
        code: "animationStyle motionBlur\nsimpleGradient fuchsia,color(100,200,200),yellow\nscale 0.3\n3 times\n▶move 0,0,0.5\n▶5 times\n▶▶rotate time/2\n▶▶move 0.7,0,0\n▶▶rect"
      };
      this.programs.demos.diceDemo = {
        submenu: "Basic",
        title: "Dice",
        code: "animationStyle motionBlur\nsimpleGradient color(255),moccasin,peachpuff\nstroke 255,100,100,255\nfill red,155\nmove -0.5,0,0\nscale 0.3\n3 times\n▶move 0,0,0.5\n▶1 times\n▶▶rotate time\n▶▶move 2,0,0\n▶▶box"
      };
      this.programs.demos.webglalmostvoronoiDemo = {
        submenu: "WebGL",
        title: "WebGL: Almost Voronoi",
        code: "scale 10\n2 times\n▶rotate 0,1,time/10\n▶ball -1"
      };
      this.programs.demos.webglshardsDemo = {
        submenu: "WebGL",
        title: "WebGL: Shards",
        code: "scale 10\nfill 0\nstrokeSize 7\n5 times\n▶rotate 0,1,time/20\n▶ball\n▶rotate 0,1,1\n▶ball -1.01"
      };
      this.programs.demos.webglredthreadsDemo = {
        submenu: "WebGL",
        title: "WebGL: Red threads",
        code: "scale 10.5\nbackground black\nstroke red\nnoFill\nstrokeSize 7\n5 times\n▶rotate time/20\n▶ball\n▶rotate 0,1,1\n▶ball"
      };
      this.programs.demos.webglribbon = {
        submenu: "WebGL",
        title: "WebGL: Ribbon",
        code: "turns = 1 // 1 = Möbius strip\ndetail = 200 // try up to 400 or so\nspeed = 0.5\nambientLight 255,0,0 // comment out to see the seam\n\nbackground black\nrotate time /5\nscale 0.6\nfor i in [0...detail]\n▶rotate 0,0,2*Math.PI/(detail)\n▶move 2,0,0\n▶▶rotate 0,turns*i*Math.PI/(detail)+time*speed,0\n▶▶rect 1,0.04+1/detail"
      };
      this.programs.demos.theeye = {
        submenu: "WebGL",
        title: "WebGL: The eye",
        code: "turns = Math.floor(time/10)%6\ndetail = 100\nspeed = 3\nif time%10 < 5\n▶ambientLight 255,255,255\n\nbackground black\nrotate time /5\nfor i in [0...detail]\n▶rotate 0,0,2*Math.PI/(detail)\n▶move 2,0,0\n▶▶rotate turns*i*Math.PI/(detail)+time*speed,0,0\n▶▶rect 1"
      };
      this.programs.demos.webglnuclearOctopusDemo = {
        submenu: "WebGL",
        title: "WebGL: Nuclear octopus",
        code: "simpleGradient black,color(0,0,(time/.005)%255),black\nscale 0.2\nmove 5,0,0\nanimationStyle motionBlur\n//animationStyle paintOver\nstroke 255,0,0,120\nfill (time*1000)%255,0,0\npushMatrix\ncount = 0\n3 times\n▶count++\n▶pushMatrix\n▶rotate count+3+time,2+count + time,4+count\n▶120 times\n▶▶scale 0.9\n▶▶move 1,1,0\n▶▶rotate time/.1\n▶▶box\n▶popMatrix"
      };
      this.programs.tutorials.introTutorial = {
        submenu: "Intro",
        title: "intro",
        code: "// Lines beginning with two\n// slashes (like these) are just comments.\n\n// Everything else is run\n// about 30 to 60 times per second\n// in order to create an animation.\n\n// Click the link below to start the tutorial.\n\n// next-tutorial:hello_world"
      };
      this.programs.tutorials.helloworldTutorial = {
        submenu: "Intro",
        title: "hello world",
        code: "// type these three letters\n// in one of these empty lines below:\n// 'b' and 'o' and 'x'\n\n\n\n// (you should then see a box facing you)\n// click below for the next tutorial\n// next-tutorial:some_notes"
      };
      this.programs.tutorials.somenotesTutorial = {
        submenu: "Intro",
        title: "some notes",
        code: "// If this makes sense to you:\n// the syntax is similar to Coffeescript\n// and the commands are almost\n// like Processing.\n\n// If this doesn't make sense to you\n// don't worry.\n\n// next-tutorial:rotate"
      };
      this.programs.tutorials.rotateTutorial = {
        submenu: "Intro",
        title: "a taste of animation",
        code: "// now that we have a box\n// let's rotate it:\n// type 'rotate 1' in the\n// line before the 'box'\n\n\nbox\n\n// click for the next tutorial:\n// next-tutorial:frame"
      };
      this.programs.tutorials.frameTutorial = {
        submenu: "Animation",
        title: "frame",
        code: "// make the box spin\n// by replacing '1' with 'frame'\n\nrotate 1\nbox\n\n// 'frame' contains a number\n// always incrementing as\n// the screen is re-drawn.\n// (use 'frame/100' to slow it down)\n// next-tutorial:time"
      };
      this.programs.tutorials.timeTutorial = {
        submenu: "Animation",
        title: "time",
        code: "// 'frame/100' has one problem:\n// faster computers will make\n// the cube spin too fast.\n// Replace it with 'time/2'.\n\nrotate frame/100\nbox\n\n// 'time' counts the\n// number of seconds since\n// the program started, so it's\n// independent of how fast\n// the computer is at drawing.\n// next-tutorial:move"
      };
      this.programs.tutorials.moveTutorial = {
        submenu: "Placing things",
        title: "move",
        code: "// you can move any object\n// by using 'move'\n\nbox\nmove 1,1,0\nbox\n\n// try to use a rotate before\n// the first box to see how the\n// scene changes.\n// next-tutorial:scale"
      };
      this.programs.tutorials.scaleTutorial = {
        submenu: "Placing things",
        title: "scale",
        code: "// you can make an object bigger\n// or smaller by using 'scale'\n\nrotate 3\nbox\nmove 1\nscale 2\nbox\n\n// try to use scale or move before\n// the first box to see how the\n// scene changes.\n// next-tutorial:times"
      };
      this.programs.tutorials.timesTutorial = {
        submenu: "Repeating stuff",
        title: "times",
        code: "// 'times' (not to be confused with\n// 'time'!) can be used to\n// repeat operations like so:\n\nrotate 1\n3 times\n▶move 0.2,0.2,0.2\n▶box\n\n// note how the tabs indicate\n// exactly the block of code\n// to be repeated.\n// next-tutorial:fill"
      };
      this.programs.tutorials.fillTutorial = {
        submenu: "Graphics",
        title: "fill",
        code: "// 'fill' changes the\n// color of all the faces:\n\nrotate 1\nfill 255,255,0\nbox\n\n// the three numbers indicate\n// red green and blue values.\n// You can also use color names such as 'indigo'\n// Try replacing the numbers with\n// 'angleColor'\n// next-tutorial:stroke"
      };
      this.programs.tutorials.strokeTutorial = {
        submenu: "Graphics",
        title: "stroke",
        code: "// 'stroke' changes all the\n// edges:\n\nrotate 1\nstrokeSize 5\nstroke 255,255,255\nbox\n\n// the three numbers are RGB\n// but you can also use the color names\n// or the special color 'angleColor'\n// Also you can use 'strokeSize'\n// to specify the thickness.\n// next-tutorial:color_names"
      };
      this.programs.tutorials.colornamesTutorial = {
        submenu: "Graphics",
        title: "color by name",
        code: "// you can call colors by name\n// try to un-comment one line:\n//fill greenyellow\n//fill indigo\n//fill lemonchiffon // whaaaat?\n\nrotate 1\nbox\n\n// more color names here:\n// http://html-color-codes.info/color-names/\n// (just use them in lower case)\n// next-tutorial:lights"
      };
      this.programs.tutorials.lightsTutorial = {
        submenu: "Graphics",
        title: "lights",
        code: "// 'ambientLight' creates an\n// ambient light so things have\n// some sort of shading:\n\nambientLight 0,255,255\nrotate time\nbox\n\n// you can turn that light on and\n// off while you build the scene\n// by using 'lights' and 'noLights'\n// next-tutorial:background"
      };
      this.programs.tutorials.backgroundTutorial = {
        submenu: "Graphics",
        title: "background",
        code: "// 'background' creates a\n// solid background:\n\nbackground 0,0,255\nrotate time\nbox\n\n// next-tutorial:gradient"
      };
      this.programs.tutorials.gradientTutorial = {
        submenu: "Graphics",
        title: "gradient",
        code: "// even nicer, you can paint a\n// background gradient:\n\nsimpleGradient color(190,10,10),color(30,90,100),color(0)\nrotate time\nbox\n\n// next-tutorial:line"
      };
      this.programs.tutorials.lineTutorial = {
        submenu: "Graphics",
        title: "line",
        code: "// draw lines like this:\n\n20 times\n▶rotate time/9\n▶line\n\n// next-tutorial:ball"
      };
      this.programs.tutorials.ballTutorial = {
        submenu: "Graphics",
        title: "ball",
        code: "// draw balls like this:\n\nballDetail 10\n3 times\n▶move 0.2,0.2,0.2\n▶ball\n\n// ('ballDetail' is optional)\n// next-tutorial:pushpopMatrix"
      };
      this.programs.tutorials.pushpopMatrixTutorial = {
        submenu: "Graphics",
        title: "push and pop",
        code: "// pushMatrix creates a bookmark of\n// the position, which you can\n// return to later by using popMatrix.\n// You can reset using 'resetMatrix'.\n\nrotate time\npushMatrix // bookmark the position after the rotation\nline\nmove 0.5,0,0\nline\npopMatrix // go back to the bookmarked position\nmove -0.5,0,0\nline\nresetMatrix // resets the position\nline // not affected by initial rotation\n// next-tutorial:animation_style"
      };
      this.programs.tutorials.animationstyleTutorial = {
        submenu: "Graphics",
        title: "animation style",
        code: "// try uncommenting either line\n// with the animationStyle\n\nbackground 255\n//animationStyle motionBlur\n//animationStyle paintOver\nrotate frame/10\nbox\n\n// next-tutorial:do_once"
      };
      this.programs.tutorials.doonceTutorial = {
        submenu: "Controlling flow",
        title: "do once",
        code: "// delete either check mark below\n\nrotate time\n✓doOnce\n▶background 255\n▶fill 255,0,0\n✓doOnce ball\nbox\n\n// ...the line or block of code\n// are ran one time only, after that the\n// check marks immediately re-appear\n// P.S. keep hitting the delete button\n// on that first check mark for seizures.\n// next-tutorial:conditionals"
      };
      this.programs.tutorials.conditionalsTutorial = {
        submenu: "Controlling flow",
        title: "conditionals",
        code: "// you can draw different things\n// (or in general do different things)\n// based on any\n// test condition you want:\n\nrotate\nif frame%3 == 0\n▶box\nelse if frame%3 == 1\n▶ball\nelse\n▶peg\n\n// next-tutorial:autocode"
      };
      this.programs.tutorials.autocodeTutorial = {
        submenu: "Others",
        title: "autocode",
        code: "// the Autocode button invents random\n// variations for you.\n\n// You can interrupt the Autocoder at\n// any time by pressing the button again,\n// or you can press CTRL-Z\n// (or CMD-Z on Macs) to undo (or re-do) some of\n// the steps even WHILE the autocoder is running,\n// if you see that things got\n// boring down a particular path of changes."
      };
    }

    ProgramLoader.prototype.kickOff = function() {
      var _this = this;
      setInterval(function() {
        return _this.pollHash();
      }, 100);
      return this.eventRouter.addListener("url-hash-changed", function(hash) {
        return _this.loadAppropriateDemoOrTutorialBasedOnHash(hash);
      });
    };

    ProgramLoader.prototype.loadDemoOrTutorial = function(demoName) {
      var blendControls, prependMessage, userWarnedAboutWebglExamples,
        _this = this;
      if ((!Detector.webgl || this.liveCodeLabCoreInstance.threeJsSystem.forceCanvasRenderer) && !userWarnedAboutWebglExamples && demoName.indexOf("webgl") === 0) {
        userWarnedAboutWebglExamples = true;
        $("#exampleNeedsWebgl").modal();
        $("#simplemodal-container").height(200);
      }
      this.eventRouter.emit("set-url-hash", "bookmark=" + demoName);
      this.eventRouter.emit("big-cursor-hide");
      this.eventRouter.emit("editor-undim");
      this.liveCodeLabCoreInstance.graphicsCommands.doTheSpinThingy = false;
      prependMessage = "";
      if ((!Detector.webgl || this.liveCodeLabCoreInstance.threeJsSystem.forceCanvasRenderer) && demoName.indexOf("webgl") === 0) {
        prependMessage = "// This drawing makes much more sense\n// in a WebGL-enabled browser.\n\n";
      }
      if (this.programs.demos[demoName] || this.programs.tutorials[demoName]) {
        if (this.programs.demos[demoName]) {
          this.texteditor.setValue(prependMessage + this.programs.demos[demoName].code.replace(/\u25B6/g, "\t"));
        } else if (this.programs.tutorials[demoName]) {
          this.texteditor.setValue(prependMessage + this.programs.tutorials[demoName].code.replace(/\u25B6/g, "\t"));
        }
        setTimeout((function() {
          return _this.texteditor.clearHistory();
        }), 30);
      }
      this.texteditor.setCursor(0, 0);
      blendControls = this.liveCodeLabCoreInstance.blendControls;
      blendControls.animationStyle(blendControls.animationStyles.normal);
      blendControls.animationStyleUpdateIfChanged();
      return this.liveCodeLabCoreInstance.renderer.render(this.liveCodeLabCoreInstance.graphicsCommands);
    };

    ProgramLoader.prototype.loadAppropriateDemoOrTutorialBasedOnHash = function(hash) {
      var matched,
        _this = this;
      matched = hash.match(/bookmark=(.*)/);
      if (matched) {
        return this.loadDemoOrTutorial(matched[1]);
      } else {
        this.texteditor.setValue("");
        return setTimeout((function() {
          return _this.texteditor.clearHistory();
        }), 30);
      }
    };

    ProgramLoader.prototype.pollHash = function() {
      if (this.lastHash !== location.hash) {
        this.lastHash = location.hash;
        return this.loadAppropriateDemoOrTutorialBasedOnHash(this.lastHash);
      }
    };

    return ProgramLoader;

  })();
  return ProgramLoader;
});

/*
//@ sourceMappingURL=program-loader.js.map
*/