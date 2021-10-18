let scene, camera, renderer, controls, rayCast;
    
let randomInRange = function(from, to) {
    let x = Math.random() * (to - from);
    return x + from;
};

let createCube = function() {
    let geometry = new THREE.SphereGeometry(3, 16, 20);

    // warna untuk sphere
    const colorList = [
    0xFF3333,
    0xFF9933,
    0x33FF33,
    0x00FFFF,
    0x9933FF,
    0xFF3399
    ];
    let color = colorList[Math.floor(randomInRange(0, 6))];
    let emissive = color + 0.05;
    
    let material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: emissive,
        shineness: 100
    });
    let sphere = new THREE.Mesh( geometry, material );
    
    sphere.position.x = randomInRange(-25, 25);
    sphere.position.y = randomInRange(-25, 25);
    sphere.position.z = randomInRange(-25, 25);

    scene.add(sphere);
};

let scoreCorrect = 1;
let scoreWrong = -1;
let currentScore = 0;
let elementScore = document.getElementById("score");

let selectedObject = []; 
let originalColors = []; 

let onMouseClick = function(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;
    mouse.z = 1;

    rayCast.setFromCamera(mouse, camera);

    let intersects = rayCast.intersectObjects(scene.children, false);

    if(intersects.length == 0){
    
        return;
    } else {   
        selectedObject.push(intersects);
        originalColors.push(intersects[0].object.material.color.getHex());

        console.log(intersects);
        console.log(originalColors);
        console.log(selectedObject);
        
    
        if(selectedObject.length > 1 ) {
     
            if(selectedObject[0][0].object.uuid === selectedObject[1][0].object.uuid){
                selectedObject[0][0].object.material.emissive.setHex(originalColors[0]);
                selectedObject[0][0].object.rotation.x = 0;
                selectedObject[0][0].object.rotation.y = 0;
            } else if(originalColors[0] == (originalColors[1])) {
                

                selectedObject.forEach(object => {
                    object[0].object.geometry.dispose();
                    object[0].object.material.dispose();
                    scene.remove(object[0].object);
                    renderer.renderLists.dispose();
                });

                currentScore += scoreCorrect;
                console.log(currentScore);
                elementScore.innerHTML = currentScore;

            }
            else {
                selectedObject[0][0].object.material.emissive.setHex(originalColors[0]);
                selectedObject[0][0].object.rotation.x = 0;
                selectedObject[0][0].object.rotation.y = 0;
                currentScore += scoreWrong;
                console.log(currentScore);
                elementScore.innerHTML = currentScore;
            }

            selectedObject = [];
            originalColors = [];
        } else if (selectedObject.length > 2) {
          
            selectedObject = [];
            originalColors = [];
            return;
        }
    } 
};


let speed = 2500;
const baseSpeed = 2500;

let generateCube = function() {
    if(scene.children.length >= 56){
        speed = baseSpeed;

        currentScore = 0;
        elementScore.innerHTML = currentScore;

    }
    else{
        speed -= 150;
        createCube();
    }

    setTimeout(generateCube, speed);
}


let init = function() {
   
    scene = new THREE.Scene();
    const Texture = new THREE.TextureLoader().load('./dark.jpg');
    scene.background = Texture;

    camera = new THREE.PerspectiveCamera(70, 
                    window.innerWidth / window.innerHeight, 
                    1, 1000);
    camera.position.z = 70;

    var light = new THREE.SpotLight(0xfffff,0.5);
    var light2 = new THREE.SpotLight(0xfffff,0.5);
    scene.add(new THREE.SpotLightHelper(light)); 
    scene.add(light);
    scene.add(light2);
    light.position.set(0, 30, 0);
    light2.position.set(0, -30, 0);
            
    for(let i = 1; i <= 28; i++)
        createCube();

    generateCube();
    
    renderer = new THREE.WebGLRenderer();   
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(renderer.domElement);
    document.addEventListener("click", onMouseClick, false);  
    
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.enableDamping = true;
    
    rayCast = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse.x = mouse.y = -1;
};
const clock = new THREE.Clock();

let mainLoop = function() {
    const elapsedTime = clock.getElapsedTime();

    if (selectedObject.length == 1) {
        selectedObject[0][0].object.material.emissive.setHex(elapsedTime % 0.5 >= 0.25 ? originalColors[0] : (originalColors[0] * 3));
        selectedObject[0][0].object.rotation.y += 10;
        selectedObject[0][0].object.rotation.x += 10;
    }
    
    renderer.render(scene, camera);
    controls.update();        
    window.requestAnimationFrame(mainLoop);
};

init();
mainLoop();