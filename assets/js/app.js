
//variables
let scene, camera, renderer, stars, starGeo, cube;
let directionalLight, lighthelper, ambientLight, light, spotLight, reflectionCamera;

let playing = false;
let rotationCounter = 0.01;
let thunderStriking = false;

//audio initializations
let listener = new THREE.AudioListener();
let sound = new THREE.Audio(listener);
let audioLoader = new THREE.AudioLoader();
audioLoader.load('assets/sounds/rain.mp3', function (buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(2);
  sound.play();
});
let analyser = new THREE.AudioAnalyser(sound, 32);

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.y = 200;
  camera.position.z = 900; 
  camera.position.x = -500;
  scene.background = (new THREE.TextureLoader().load( 'assets/textures/cyberpunk.jpg' ));
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //model loader
  var loader = new THREE.GLTFLoader();
  loader.load( 'assets/models/cartoon_lowpoly/scene.gltf', function ( gltf ) {
    scene.add( gltf.scene );
  }, undefined, function ( error ) {
    console.error( error );
  } );

  //debugging cube
  let cubeTexture = new THREE.TextureLoader().load('assets/textures/thunder.jpg');
  let cubeGeom = new THREE.BoxBufferGeometry(900, 900, 10);
  cube = new THREE.Mesh(cubeGeom, new THREE.MeshBasicMaterial({ map: cubeTexture}));
  cube.position.set(-500, 500, 1000);
  scene.add(cube);

  //lighting
  ambientLight = new THREE.AmbientLight(0x404040);
  ambientLight.intensity += 1;
  scene.add(ambientLight);

  //rain particles
  starGeo = new THREE.Geometry();
    for(let i=0;i<6000;i++) {
      star = new THREE.Vector3(
        Math.random() * -800,
        Math.random() * 900,
        Math.random() * 900
      );
      star.velocity = 0;
      star.acceleration = 0.02;
      starGeo.vertices.push(star);
    }

  //rain material
  let sprite = new THREE.TextureLoader().load( 'assets/textures/water.jpg' );
  let starMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 2,
    map: sprite
  });

  stars = new THREE.Points(starGeo,starMaterial);
  scene.add(stars);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//particle sequence with frequency data 
function animate() {
  starGeo.vertices.forEach(p => {
    p.velocity += p.acceleration
    p.y -= p.velocity;
    if (p.y < -100) {
      p.y = 350;
      p.velocity = 0;
    }
  });
  starGeo.verticesNeedUpdate = true;

  //thunder has 0.2 percent chance of striking
  if (thunderStriking == false){
    let simulation = (Math.random()*10);
    if (simulation > 9.9){
      ambientLight.intensity = 4;
      thunderStriking = true;
      let simulationThunder = (Math.random()*10);
      if (simulationThunder > 5){
        cube.position.z = -1000;
        cube.position.x = -(Math.random()*900);
      }else{
        cube.position.z = -1000;
        cube.position.x = (Math.random()*300);
      }
    }else{
      ambientLight.intensity = 0.3; 
    }
  }else if (thunderStriking == true){
    let thunderCounter = 100;
    while (thunderCounter > 0.2){
      ambientLight.intensity -= 0.0000001;
      thunderCounter --;
    }
    cube.position.set(-500, 500, 1000);
    thunderStriking = false;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
