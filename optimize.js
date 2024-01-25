var p = require("./parser.js");

function RNG(seed) {
    var m = 2 ** 35 - 31
    var a = 185852
    var s = seed % m
    return function () {
        return (s = s * a % m) / m
    }
}

function dlas(state, cost_func, steps, mutate_func) {
    const list_length = 5;
    let current_cost = cost_func(state);
    console.log(`starting cost ${current_cost}`)
    let best_cost = current_cost;
    let cost_max = best_cost;
    let best_cost_index = 0;
    let history = Array.from({ length: list_length }, (_, i) => cost_max);
    let N = list_length;
    let best = state;
    r = RNG(1); // DO NOT USE 0
    for (let i = 0; i <= steps; i++) {
        prev_cost = current_cost;
        candidate = mutate_func(state, r);
        cand_cost = cost_func(candidate);
        v = i % list_length;
        if (cand_cost == current_cost || cand_cost < cost_max) {
            current_cost = cand_cost;
            state = candidate;
        }
        if (current_cost > history[v]) {
            history[v] = current_cost;
        } else if (current_cost < history[v] && current_cost < prev_cost) {
            if (history[v] == cost_max) {
                N--;
            }
            history[v] = current_cost;
            if (N <= 0) {
                cost_max = Math.max(...history)
            }
            N = history.filter(x => x == cost_max).length;
        }
        if (cand_cost < best_cost) {
            best_cost = cand_cost;
            best_cost_index = i;
            best = candidate;
        }
        if ((i % 500) === 0 || i === steps) {
            console.log(`... step ${i} / ${steps} -> best @ ${best_cost_index} = ${best_cost} `);
        }
        if (best_cost == 0)
            break;
    }
    return best;
}

module.exports = {
    dlas: dlas,
}
