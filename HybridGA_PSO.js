import GeneticAlgorithm from './GeneticAlgorithm.js';
import ParticleSwarm from './ParticleSwarm.js';

export default class HybridGA_PSO {
    constructor(funcClass, 
                popSize = 50,
                gaGenerations = 50,
                pc = 0.8,
                pm = 0.01) {

        this.funcClass = funcClass;
        this.popSize = popSize;
        this.gaGenerations = gaGenerations;
        this.pc = pc;
        this.pm = pm;

        this.maxIterations = 150;
        this.currentIter = 0;

        this.phase = 'GA';
        this.ga = new GeneticAlgorithm(funcClass, popSize, pc, pm);
        this.ga.maxIterations = gaGenerations;

        this.pso = null;
    }

    getPopulation() {
        if (this.phase === 'GA') {
            return this.ga.getPopulation();
        } else if (this.pso) {
            return this.pso.getPopulation();
        }
        // Fallback
        return this.ga.getPopulation();
    }

    nextIteration() {
        this.currentIter++;

        if (this.phase === 'GA') {
            const points = this.ga.nextIteration();

            // Переключаемся на PSO после завершения GA
            if (this.ga.currentIter >= this.ga.maxIterations) {
                this.phase = 'PSO';

                this.pso = new ParticleSwarm(this.funcClass, this.popSize, 0.7, 1.5, 1.5);

                // Инициализируем рой лучшими решениями из GA
                const bestPoints = [...points]
                    .sort((a, b) => a.z - b.z)
                    .slice(0, Math.floor(this.popSize * 0.7));

                this.pso.particles = bestPoints.map(p => ({
                    x: p.x,
                    y: p.y,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2,
                    pbest: { x: p.x, y: p.y, fitness: p.z },
                    fitness: p.z
                }));
            }
            return points;
        } 
        else {
            return this.pso.nextIteration();
        }
    }
}