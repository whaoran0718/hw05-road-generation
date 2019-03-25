import {vec3, vec2} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Terrain from './Terrain';
import Roadmap, { Highway, Street } from './Highway';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  seed: 52,
  seaLevel: 0.5,
  highwayLength: 100,
  highwayAngle: 90,
  displayMode: 0,
  loadScene: function() {
    if (highwayLength != controls.highwayLength
      || highwayAngle != controls.highwayAngle
      || seed != controls.seed
      || seaLevel != controls.seaLevel)
    {
      seed = controls.seed;
      seaLevel = controls.seaLevel;
      highwayLength = controls.highwayLength;
      highwayAngle = controls.highwayAngle;

      ter = new Terrain(resolution, resolution);
      ter.creatFBM(seed);
      ter.createMap(seed, seaLevel);

      highwayMesh = new Square();
      streetMesh = new Square();
      road = new Roadmap(highwayLength, highwayAngle, blockWidth, blockHeight, ter);
      road.process(seed, iteration);
      road.instance(highwayMesh, streetMesh);
    }
  }
};

let square: Square;
let highwayMesh: Square;
let streetMesh: Square;
let time: number = 0.0;
let ter: Terrain;
let iteration: number = 1000;
let highwayLength: number;
let highwayAngle: number;
let seaLevel: number;
let seed: number;
let blockWidth: number = 20;
let blockHeight: number = 8;
let road: Roadmap;
let resolution: number = 512;

function loadScene() {
  highwayLength = controls.highwayLength;
  highwayAngle = controls.highwayAngle;
  seaLevel = controls.seaLevel;
  seed = controls.seed;

  square = new Square();
  square.create();
  ter = new Terrain(resolution, resolution);
  ter.creatFBM(seed);
  ter.createMap(seed, seaLevel);

  highwayMesh = new Square();
  streetMesh = new Square();
  road = new Roadmap(highwayLength, highwayAngle, blockWidth, blockHeight, ter);
  road.process(seed, iteration);
  road.instance(highwayMesh, streetMesh);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, "seed", 0, 100);
  gui.add(controls, "highwayLength", 0, 200);
  gui.add(controls, "highwayAngle", 0, 180);
  gui.add(controls, "seaLevel", 0, 1).step(0.01);
  gui.add(controls, "displayMode", {Terrain: 0, Population: 1, Overlay: 2});
  gui.add(controls, "loadScene");

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);
  flat.setTexture(ter.terrainMap);
  flat.setMode(controls.displayMode);

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    flat.setTexture(ter.terrainMap);
    flat.setMode(controls.displayMode);

    // instancedShader.setTime(time);
    // flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [square]);
    gl.disable(gl.DEPTH_TEST);
    renderer.render(camera, instancedShader, [streetMesh]);
    renderer.render(camera, instancedShader, [highwayMesh]);
    gl.enable(gl.DEPTH_TEST);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
