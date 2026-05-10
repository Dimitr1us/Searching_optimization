import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import SphereFunction from './SphereFunction.js';
import HimmelblauFunction from './HimmelblauFunction.js';
import RosenbrockFunction from './RosenbrockFunction.js';
import TestAlgorithm1 from './TestAlgorithm1.js';
import GradientDescent from './GradientDescent.js';
import GeneticAlgorithm from './GeneticAlgorithm.js';
import ParticleSwarm from './ParticleSwarm.js';
import BeesAlgorithm from './BeesAlgorithm.js';
import SchafferN2Function from './SchafferN2Function.js';
import StyblinskiTangFunction from './StyblinskiTangFunction.js';
import RastriginFunction from './RastriginFunction.js';

import SimplexMethod from './SimplexMethod.js';
import SimplexMethodFabric from './SimplexMethodFabric.js';
import SimplexFunction1 from './SimplexFunction1.js';
import SimplexFunction2 from './SimplexFunction2.js';
import ArtificialImmuneNetwork from './ArtificialImmuneNetwork.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
new OrbitControls(camera, renderer.domElement);

const funcSelector = document.getElementById('funcSelector');
const algoSelector = document.getElementById('algoSelector');
const algo1Panel = document.getElementById('algo1Panel');
const maxIter = document.getElementById('maxIter');
const simplexMaxIter = document.getElementById("simplexMaxIter");
const algo3Panel = document.getElementById('algo3Panel');
const algo4Panel = document.getElementById('algo4Panel');
const algo5Panel = document.getElementById('algo5Panel');
const algo6Panel = document.getElementById('algo6Panel');
const algo7Panel = document.getElementById('algo7Panel');
const algo8Panel = document.getElementById('algo8Panel');
 

const lrInput = document.getElementById('lrInput');
const trajCountInput = document.getElementById('trajCountInput');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const pointsOutput = document.getElementById("pointsOutput");
const swarmSizeInput = document.getElementById('swarmSize');
const inertiaInput = document.getElementById('inertia');
const cognitiveInput = document.getElementById('cognitive');
const socialInput = document.getElementById('social');


const popSizeInput = document.getElementById('popSize');
const pcInput = document.getElementById('pc');
const pmInput = document.getElementById('pm');


const immunePopSizeInput = document.getElementById('immunePopSize');
const cloneMultiplierInput = document.getElementById('cloneMultiplier');
const mutationRateInput = document.getElementById('mutationRate');
const suppressionThresholdInput = document.getElementById('suppressionThreshold');



const functions = {
    '1': SphereFunction, '2': HimmelblauFunction, '3': RosenbrockFunction,
    '4': SchafferN2Function,
    '5': StyblinskiTangFunction, 
    '6': RastriginFunction,
    '7': SimplexFunction1,
    '8': SimplexFunction2    

};

let isPaused = false;
let funcClass = SphereFunction;
let funcMesh = null;
let algorithm = new TestAlgorithm1();
let pointsMesh = null;
let iterInterval = null;


function createFuncMesh() {
    if (funcMesh) scene.remove(funcMesh);
    
    
    funcMesh = funcClass.getSurfaceMesh(5, 80);
    scene.add(funcMesh);
    
    
    if (!window.lightsAdded) {
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 2, 1);
        scene.add(ambientLight);
        scene.add(directionalLight);
        window.lightsAdded = true;
    }
}


function createPointsMesh(points, size=0.07) {

    if (pointsMesh) scene.remove(pointsMesh);
    
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(size, 15, 15);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    points.forEach(p => {
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(p.y, p.z, p.x);
        group.add(sphere);
    });
    
    pointsMesh = group;
    scene.add(pointsMesh);

}


function startAnimation() {
    isPaused = false;
    pauseBtn.textContent = "Pause";

    setpointsOutputSizeUsual();

    if (iterInterval) clearInterval(iterInterval);

    algorithm.currentIter = 0;
    algorithm.maxIterations = parseInt(maxIter.value);

    // if (algorithm instanceof TestAlgorithm2)
    //     algorithm.xMin = parseFloat(xMin.value);

    const points = algorithm.getPopulation();
    createPointsMesh(points);
    displayPoints(points);

    runIterations();

}


function setpointsOutputSizeUsual() {
    pointsOutput.style.width = '250px';
    pointsOutput.style.height = '250px';
}


function setpointsOutputSizeForSimplex() {
    pointsOutput.style.width = '450px';
    pointsOutput.style.maxHeight = '500px';  
    pointsOutput.style.overflow = 'auto';     
}


function showSolution(simplex_algorithm) { 

    simplex_algorithm.setMaxIter(parseInt(simplexMaxIter.value));

    setpointsOutputSizeForSimplex();

    pointsOutput.textContent = simplex_algorithm.solveProblem().resString;
    let x = simplex_algorithm.solveProblem().solution_x_y.x
    let y = simplex_algorithm.solveProblem().solution_x_y.y
    let z = funcClass.evaluate(x,y)
    pointsOutput.textContent += `\nОптимальное значение исходной задачи F = ${z}`;



    createPointsMesh([{y,z,x}], 0.08);


}






funcSelector.addEventListener('change', (e) => {
    funcClass = functions[e.target.value];
    createFuncMesh();

    algorithm = createAlgorithm();
    if (algorithm instanceof SimplexMethod){
        showSolution(algorithm); 
    }
    else { startAnimation(); } 
});

algoSelector.addEventListener('change', (e) => {
    if (iterInterval) clearInterval(iterInterval);
    algorithm = createAlgorithm();

    algo1Panel.style.display = e.target.value === '1' ? 'block' : 'none';    
    algo3Panel.style.display = e.target.value === '3' ? 'block' : 'none';
    algo4Panel.style.display = e.target.value === '4' ? 'block' : 'none';
    algo5Panel.style.display = e.target.value === '5' ? 'block' : 'none';
    algo6Panel.style.display = e.target.value === '6' ? 'block' : 'none';
    algo7Panel.style.display = e.target.value === '7' ? 'block' : 'none';
    algo8Panel.style.display = e.target.value === '8' ? 'block' : 'none';

    if (algorithm instanceof SimplexMethod){
        showSolution(algorithm); 
    }
    else { startAnimation(); } 
});


restartBtn.addEventListener('click', () => {

    algorithm = createAlgorithm();
    if (algorithm instanceof SimplexMethod){
        showSolution(algorithm);
    }
    else { startAnimation();}
});


pauseBtn.addEventListener('click', () => {

    if (!isPaused) {
        clearInterval(iterInterval);
        pauseBtn.textContent = "Resume";
        isPaused = true;
    } else {
        runIterations();
        pauseBtn.textContent = "Pause";
        isPaused = false;
    }

});

function runIterations() {

    iterInterval = setInterval(() => {

        if (algorithm.currentIter >= algorithm.maxIterations) {
            clearInterval(iterInterval);
            return;
        }

        const points = algorithm.nextIteration();
        createPointsMesh(points);
        displayPoints(points);

    }, 500);

}

function displayPoints(points) {

    const maxPoints = Math.min(points.length, 10);
    let text = "";

    for (let i = 0; i < maxPoints; i++) {
        const p = points[i];
        text += `Point ${i}: x=${p.x.toFixed(3)}  y=${p.y.toFixed(3)}  z=${p.z.toFixed(3)}\n`;
    }

    if (points.length > 10) {
        text += `\n... (${points.length - 10} more points)`;
    }

    pointsOutput.textContent = text;
}

maxIter.addEventListener('input', () => { 
    if (algorithm instanceof TestAlgorithm1 || 
        algorithm instanceof GeneticAlgorithm || 
        algorithm instanceof ParticleSwarm) startAnimation(); 
});

maxIter.addEventListener('input', () => { if (algorithm instanceof TestAlgorithm1) startAnimation(); });
lrInput.addEventListener('input', () => {if (algorithm instanceof GradientDescent) startAnimation();});
trajCountInput.addEventListener('input', () => {if (algorithm instanceof GradientDescent) startAnimation();});


popSizeInput.addEventListener('change', () => { if (algorithm instanceof GeneticAlgorithm) startAnimation(); });
pcInput.addEventListener('change', () => { if (algorithm instanceof GeneticAlgorithm) startAnimation(); });
pmInput.addEventListener('change', () => { if (algorithm instanceof GeneticAlgorithm) startAnimation(); });

swarmSizeInput.addEventListener('change', () => { if (algorithm instanceof ParticleSwarm) startAnimation(); });
inertiaInput.addEventListener('change', () => { if (algorithm instanceof ParticleSwarm) startAnimation(); });
cognitiveInput.addEventListener('change', () => { if (algorithm instanceof ParticleSwarm) startAnimation(); });
socialInput.addEventListener('change', () => { if (algorithm instanceof ParticleSwarm) startAnimation(); });


maxIter.addEventListener('input', () => { 
    if (algorithm instanceof TestAlgorithm1 || 
        algorithm instanceof GeneticAlgorithm || 
        algorithm instanceof ParticleSwarm || 
        algorithm instanceof BeesAlgorithm) startAnimation(); 

    //if (algorithm instanceof SimplexMethod) showSolution();
});


scene.add(new THREE.AxesHelper(5));
createFuncMesh();
startAnimation();

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function createAlgorithm() {
    const algoType = algoSelector.value;

    if (algoType === '1') {
        return new TestAlgorithm1();
    }     
    else if (algoType === '3') {
        const lr = parseFloat(lrInput.value) || 0.01;
        const trajCount = parseInt(trajCountInput.value) || 10;
        return new GradientDescent(funcClass, trajCount, lr);
    } 
    else if (algoType === '4') {
        return new GeneticAlgorithm(
            funcClass,
            parseInt(popSizeInput.value) || 50,
            parseFloat(pcInput.value) || 0.8,
            parseFloat(pmInput.value) || 0.01
        );
    }
    else if (algoType === '5') {
        return new ParticleSwarm(
            funcClass,
            parseInt(document.getElementById('swarmSize').value) || 50,
            parseFloat(document.getElementById('inertia').value) || 0.7,
            parseFloat(document.getElementById('cognitive').value) || 1.5,
            parseFloat(document.getElementById('social').value) || 1.5
        );
    }
    else if (algoType === '6') {
        return new BeesAlgorithm(funcClass);
    }
    else if (algoType === "7"){
        return new SimplexMethodFabric(funcClass);
    }
    else if (algoType === '8') {
        return new ArtificialImmuneNetwork(
            funcClass,
            parseInt(immunePopSizeInput.value) || 60,
            parseInt(cloneMultiplierInput.value) || 8,
            parseFloat(mutationRateInput.value) || 0.3,
            parseFloat(suppressionThresholdInput.value) || 0.15
        );
    }
}

animate();