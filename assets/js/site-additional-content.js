function insertGas(elem) {
    elem.dataset.processed = true;

    const compact = elem?.dataset?.r;
    const title = compact ? 'Support Bit' : 'Keep Bit Growing';
    const text = compact
        ? 'If Bit helps your games, consider leaving feedback or starring the repository.'
        : 'Bit is maintained by a solo developer. Feedback and stars help keep updates coming.';

    elem.innerHTML = `
        <div class="bit-support-card ${compact ? 'compact' : ''}">
            <div class="bit-support-card-title">${title}</div>
            <div class="bit-support-card-text">${text}</div>
            <div class="bit-support-card-actions">
                <a href="https://github.com/bitbytelabs/Bit" target="_blank" rel="noopener">GitHub</a>
                <a href="https://greasyfork.org/en/scripts/459137/feedback" target="_blank" rel="noopener">Feedback</a>
            </div>
        </div>
    `;
}

function initLottieAndGas() {
    const lottieElement = document.querySelector("#lottie-animation");

    if (lottieElement && !lottieElement.dataset.lottieLoaded) {
        lottie.loadAnimation({
            container: lottieElement,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '../assets/json/lottie.json'
        });
        lottieElement.dataset.lottieLoaded = "true";
    }

    [...document.querySelectorAll('.gas')]
        .filter(x => !x.dataset.processed)
        .forEach(insertGas);
}

initLottieAndGas();

const observer = new MutationObserver(() => {
    initLottieAndGas();
});

observer.observe(document.body, { childList: true, subtree: true });
