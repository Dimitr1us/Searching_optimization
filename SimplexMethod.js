class SimplexMethod {
    constructor(table, maxIterations=100) {
        // Копируем таблицу для избежания мутаций
        this.table = table.map(row => [...row]);
        this.rows = table.length;
        this.cols = table[0].length;
        this.basis = []; 
        this.maxIterations = maxIterations;// Индексы базисных переменных
    }

    // Поиск ведущего столбца (наименьший отрицательный коэффициент в F строке)
    findPivotColumn() {
        const lastRow = this.table[this.rows - 1];
        let minIndex = -1;
        let minValue = 0;
        
        for (let j = 0; j < this.cols - 1; j++) {
            if (lastRow[j] < minValue) {
                minValue = lastRow[j];
                minIndex = j;
            }
        }
        
        return minIndex; // -1 означает, что решение оптимально
    }

    // Поиск ведущей строки (минимальное положительное отношение свободного члена к элементу ведущего столбца)
    findPivotRow(pivotCol) {
        let minRatio = Infinity;
        let pivotRow = -1;
        
        for (let i = 0; i < this.rows - 1; i++) {
            const value = this.table[i][pivotCol];
            const rhs = this.table[i][this.cols - 1];
            
            // Берем только положительные элементы
            if (value > 0) {
                const ratio = rhs / value;
                if (ratio < minRatio) {
                    minRatio = ratio;
                    pivotRow = i;
                }
            }
        }
        
        return pivotRow;
    }

    // Преобразование симплекс-таблицы (метод Жордана-Гаусса)
    transformTable(pivotRow, pivotCol) {
        const pivotElement = this.table[pivotRow][pivotCol];
        
        // Делим ведущую строку на ведущий элемент
        for (let j = 0; j < this.cols; j++) {
            this.table[pivotRow][j] /= pivotElement;
        }
        
        // Обнуляем все остальные строки в ведущем столбце
        for (let i = 0; i < this.rows; i++) {
            if (i !== pivotRow) {
                const factor = this.table[i][pivotCol];
                if (factor !== 0) {
                    for (let j = 0; j < this.cols; j++) {
                        this.table[i][j] -= factor * this.table[pivotRow][j];
                    }
                }
            }
        }
    }

    // Проверка на оптимальность
    isOptimal() {
        const lastRow = this.table[this.rows - 1];
        // Для минимизации: если все коэффициенты >= 0, то решение оптимально
        for (let j = 0; j < this.cols - 1; j++) {
            if (lastRow[j] < 0) {
                return false;
            }
        }
        return true;
    }

    // Получение решения
    getSolution() {
        const solution = {};
        const variableNames = ['x1', 'x2', 'l1', 'l2', 'v1', 'v2', 'w1', 'w2', 'z1', 'z2'];
        
        // Базисные переменные
        for (let i = 0; i < this.rows - 1; i++) {
            // Находим, какая переменная является базисной в этой строке
            let basicVarIndex = -1;
            let oneCount = 0;
            
            for (let j = 0; j < this.cols - 1; j++) {
                if (Math.abs(this.table[i][j] - 1) < 1e-8) {
                    basicVarIndex = j;
                    oneCount++;
                } else if (Math.abs(this.table[i][j]) > 1e-8) {
                    basicVarIndex = -1;
                    break;
                }
            }
            
            if (oneCount === 1 && basicVarIndex !== -1) {
                solution[variableNames[basicVarIndex]] = this.table[i][this.cols - 1];
            }
        }
        
        // Остальные переменные = 0
        for (let name of variableNames) {
            if (!solution[name]) {
                solution[name] = 0;
            }
        }
        
        return solution;
    }

    // Основной метод решения
    solve() {
        let iteration = 0;
        //const maxIterations = 100;
        
        console.log("Начальная симплекс-таблица:");
        this.printTable();
        console.log("\n" + "=".repeat(80) + "\n");
        
        while (!this.isOptimal() && iteration < this.maxIterations) {
            iteration++;
            console.log(`Итерация ${iteration}:`);
            
            // 1. Находим ведущий столбец
            const pivotCol = this.findPivotColumn();
            if (pivotCol === -1) {
                console.log("Решение оптимально!");
                break;
            }
            console.log(`Ведущий столбец: ${pivotCol}`);
            
            // 2. Находим ведущую строку
            const pivotRow = this.findPivotRow(pivotCol);
            if (pivotRow === -1) {
                console.log("Задача не ограничена!");
                return null;
            }
            console.log(`Ведущая строка: ${pivotRow}`);
            console.log(`Ведущий элемент: ${this.table[pivotRow][pivotCol]}`);
            
            // 3. Преобразуем таблицу
            this.transformTable(pivotRow, pivotCol);
            
            console.log(`\nТаблица после итерации ${iteration}:`);
            this.printTable();
            console.log("\n" + "=".repeat(80) + "\n");
        }
        
        if (iteration >= this.maxIterations) {
            console.log("Достигнуто максимальное количество итераций");
            return null;
        }
        
        const solution = this.getSolution();
        const optimalValue = this.table[this.rows - 1][this.cols - 1];
        
        return {
            solution: solution,
            optimalValue: optimalValue,
            iterations: iteration
        };
    }

    // Вывод таблицы в консоль
    printTable() {
        const headers = ['Базис', 'Св.чл.', 'x1', 'x2', 'l1', 'l2', 'v1', 'v2', 'w1', 'w2', 'z1', 'z2'];
        
        // Вывод заголовков
        let headerRow = headers.join('\t');
        console.log(headerRow);
        console.log('-'.repeat(80));
        
        // Вывод строк таблицы
        for (let i = 0; i < this.rows; i++) {
            let rowStr = '';
            if (i < this.rows - 1) {
                const basisNames = ['z1', 'z2', 'w1', 'w2'];
                rowStr += `${basisNames[i]}\t`;
            } else {
                rowStr += 'F\t';
            }
            
            for (let j = 0; j < this.cols; j++) {
                rowStr += this.table[i][j].toFixed(4) + '\t';
            }
            console.log(rowStr);
        }
    }


    setTheFirstProblem(){
        const initialTable = [
            [4, 4, 1, 2, -1, 0, 0, 0, 1, 0, 6],   // z1 строка
            [4, 6, 1, 3, 0, -1, 0, 0, 0, 1, 3],   // z2 строка
            [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],    // w1 строка
            [2, 3, 0, 0, 0, 0, 0, 1, 0, 0, 4],    // w2 строка
            [-8, -10, -2, -5, 1, 1, 0, 0, 0, 0, 9] // F строка
        ];

        this.table = initialTable;

    }

    setMaxIter(maxIter){
        this.maxIterations=maxIter;
    }

    


    solveProblem(){
        const result = this.solve();

        if (result) {
            console.log("\n=== РЕЗУЛЬТАТ РЕШЕНИЯ ===");
            console.log(`\nОптимальное значение F = ${result.optimalValue.toFixed(4)}`);
            console.log("\nЗначения переменных:");
            for (let [varName, value] of Object.entries(result.solution)) {
                if (Math.abs(value) > 1e-8) { // Показываем только ненулевые переменные
                    console.log(`  ${varName} = ${value.toFixed(4)}`);
                }
            }
            console.log(`\nКоличество итераций: ${result.iterations}`);
        } else {
            console.log("Решение не найдено!");
        }

    }






}




// Исходная симплекс-таблица
// const initialTable = [
//     [4, 4, 1, 2, -1, 0, 0, 0, 1, 0, 6],   // z1 строка
//     [4, 6, 1, 3, 0, -1, 0, 0, 0, 1, 3],   // z2 строка
//     [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1],    // w1 строка
//     [2, 3, 0, 0, 0, 0, 0, 1, 0, 0, 4],    // w2 строка
//     [-8, -10, -2, -5, 1, 1, 0, 0, 0, 0, 9] // F строка
// ];

// Создаем экземпляр и решаем задачу
// const simplex = new SimplexMethod(initialTable);
// const result = simplex.solve();

// if (result) {
//     console.log("\n=== РЕЗУЛЬТАТ РЕШЕНИЯ ===");
//     console.log(`\nОптимальное значение F = ${result.optimalValue.toFixed(4)}`);
//     console.log("\nЗначения переменных:");
//     for (let [varName, value] of Object.entries(result.solution)) {
//         if (Math.abs(value) > 1e-8) { // Показываем только ненулевые переменные
//             console.log(`  ${varName} = ${value.toFixed(4)}`);
//         }
//     }
//     console.log(`\nКоличество итераций: ${result.iterations}`);
// } else {
//     console.log("Решение не найдено!");
// }