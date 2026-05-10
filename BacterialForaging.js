export default class BacterialForaging {
    constructor(funcClass, 
                numBacteria = 40,           // количество бактерий (желательно чётное)
                chemotacticSteps = 8,       // шагов хемотаксиса за одну жизнь
                swimLength = 0.8,           // максимальная длина шага
                reproductionSteps = 4,      // каждые N хемотаксисов — репродукция
                eliminationProb = 0.15) {   // вероятность ликвидации/рассеивания

        this.funcClass = funcClass;
        this.numBacteria = numBacteria;
        this.chemotacticSteps = chemotacticSteps;
        this.swimLength = swimLength;
        this.reproductionSteps = reproductionSteps;
        this.eliminationProb = eliminationProb;

        this.maxIterations = 150;
        this.currentIter = 0;

        this.bounds = [-5, 5];

        this.bacteria = [];
        this.health = [];           // "здоровье" бактерий (накопленная fitness)

        this.initializeBacteria();
    }

    initializeBacteria() {
        this.bacteria = [];
        this.health = [];
        for (let i = 0; i < this.numBacteria; i++) {
            this.bacteria.push(this.createRandomBacterium());
            this.health.push(0);
        }
    }

    createRandomBacterium() {
        return {
            x: Math.random() * (this.bounds[1] - this.bounds[0]) + this.bounds[0],
            y: Math.random() * (this.bounds[1] - this.bounds[0]) + this.bounds[0],
            direction: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
        };
    }

    evaluate(b) {
        return this.funcClass.evaluate(b.x, b.y);
    }

    getPopulation() {
        return this.bacteria.map(b => ({
            x: b.x,
            y: b.y,
            z: this.evaluate(b)
        }));
    }

    normalizeDirection(dir) {
        const len = Math.hypot(dir.x, dir.y);
        if (len === 0) return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 };
        return { x: dir.x / len, y: dir.y / len };
    }

    nextIteration() {
        this.currentIter++;

        // Хемотаксис
        for (let i = 0; i < this.numBacteria; i++) {
            let bacterium = this.bacteria[i];
            let fitness = this.evaluate(bacterium);
            this.health[i] += fitness;

            // Делаем несколько шагов хемотаксиса
            for (let step = 0; step < this.chemotacticSteps; step++) {
                const dir = this.normalizeDirection(bacterium.direction);
                
                // Пробуем плыть
                const newPos = {
                    x: bacterium.x + dir.x * this.swimLength * (Math.random() * 0.8 + 0.6),
                    y: bacterium.y + dir.y * this.swimLength * (Math.random() * 0.8 + 0.6)
                };

                const newFitness = this.evaluate(newPos);

                if (newFitness < fitness) {  // улучшение (для минимизации)
                    bacterium.x = newPos.x;
                    bacterium.y = newPos.y;
                    fitness = newFitness;
                    this.health[i] += newFitness;
                } else {
                    // Кувырок — меняем направление
                    bacterium.direction = {
                        x: Math.random() * 2 - 1,
                        y: Math.random() * 2 - 1
                    };
                    break; // после кувырка часто прекращают плыть в этом цикле
                }
            }
        }

        // Репродукция
        if (this.currentIter % this.reproductionSteps === 0) {
            this.reproduce();
        }

        // Ликвидация и рассеивание
        this.eliminationAndDispersal();

        return this.getPopulation();
    }

    reproduce() {
        // Сортируем по здоровью (для минимизации — меньшая сумма лучше)
        const sortedIndices = this.health
            .map((h, i) => ({ health: h, index: i }))
            .sort((a, b) => a.health - b.health); // от лучшего к худшему

        const half = Math.floor(this.numBacteria / 2);

        // Лучшая половина размножается, худшая погибает
        const newBacteria = [];
        const newHealth = [];

        for (let i = 0; i < half; i++) {
            const idx = sortedIndices[i].index;
            const b = this.bacteria[idx];
            
            // Две копии
            newBacteria.push({ ...b });
            newBacteria.push({ ...b });
            newHealth.push(this.health[idx]);
            newHealth.push(this.health[idx]);
        }

        this.bacteria = newBacteria;
        this.health = newHealth;
    }

    eliminationAndDispersal() {
        for (let i = 0; i < this.numBacteria; i++) {
            if (Math.random() < this.eliminationProb) {
                this.bacteria[i] = this.createRandomBacterium();
                this.health[i] = 0;
            }
        }
    }
}