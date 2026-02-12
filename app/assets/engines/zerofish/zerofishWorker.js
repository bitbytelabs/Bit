<<<<<<< HEAD
import zerofish from '/Bit/app/assets/engines/zerofish/zerofishEngine.js';
=======
import zerofish from './zerofishEngine.js';
>>>>>>> 74e1161a55318483985827e66e8e15e8a9d7464f

let engine = null;

(async () => {
    engine = await zerofish();
})();

onmessage = e => {
    const { method, args } = e.data;

    if(!engine) {
        postMessage(false);
        return;
    }

    if(engine && method === 'acas_check_loaded') {
        postMessage(true);

        engine.listenZero = msg => postMessage(msg);
        
        return;
    }

    if(engine[method] && typeof engine[method] === 'function') {
        engine[method](...args);
    }
};