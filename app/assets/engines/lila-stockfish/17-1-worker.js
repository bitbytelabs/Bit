<<<<<<< HEAD
import Sf17179Web from '/Bit/app/assets/engines/lila-stockfish/sf171-79.js';
=======
import Sf17179Web from './sf171-79.js';
>>>>>>> 74e1161a55318483985827e66e8e15e8a9d7464f

let engine = null;

(async () => {
    engine = await Sf17179Web();
})();

onmessage = e => {
    const { method, args } = e.data;

    if (!engine) {
        postMessage(false);
        return;
    }

    if(engine && method === 'acas_check_loaded') {
        postMessage(true);

        engine.listen = msg => postMessage(msg);
        
        return;
    }

    if(engine[method] && typeof engine[method] === 'function') {
        engine[method](...args);
    }
};