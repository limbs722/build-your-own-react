function throwTheBall(numbers: number[], k: number) {
    let count = 1;
    let idx = 0;
    let throwNum;

    while (count <= k) {
        // idx % numbers.length
        // idx
        throwNum = numbers[idx];

        if (count === k) {
            break;
        }
        // 한 사람 건너 뛰고 다음 사람에게 토스 하므로 +2
        // idx는 공을 던지는 사람의 위치 => numbers[idx]

        // 짝수
        // number.length
        idx = (idx + 2) % numbers.length;
        count++;
    }

    return throwNum;
}

//

function factorialRecursive(n: number): number {
    return n === 1 ? 1 : n * factorialRecursive(n - 1);
}

function factorial(n: number) {
    let i = 1; // 모든 j < i를 만족하는 j에 대해 factorial(j) < n보다 작다

    while (true) {
        // i ==5
        const factorial = factorialRecursive(i); // 1*2*3*4*5

        if (factorial > n) {
            // 모든 j < i를 만족하는 j에 대해 factorial(j) < n보다 작다
            break;
        }
        i++;
    }

    return i - 1;
}

// function* factorial33() {

// }

// function solution(n: number) {
//   let i = 1; // 모든 j < i를 만족하는 j에 대해 factorial(j) < n보다 작다
//   let fact = 1;

//   while (true) {
//       fact *= i // fact*5

//       if (fact > n) {
//           // 모든 j < i를 만족하는 j에 대해 factorial(j) < n보다 작다
//           break;
//       }
//       i++;
//   }

//   return i - 1;
// }
