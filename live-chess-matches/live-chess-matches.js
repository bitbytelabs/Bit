(function() {
    const matchesElem = document.getElementById('matches');
    const emptyStateElem = document.getElementById('empty-state');
    const configWarningElem = document.getElementById('config-warning');

    function relativeTime(timestamp) {
        if(!timestamp) return 'Unknown';

        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if(seconds < 60) return `${seconds}s ago`;
        if(seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;

        return `${Math.floor(seconds / 3600)}h ago`;
    }

    function renderMatches(data) {
        const entries = Object.values(data || {}).sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0));

        matchesElem.innerHTML = '';
        emptyStateElem.style.display = entries.length ? 'none' : 'block';

        entries.forEach(match => {
            const card = document.createElement('article');
            card.className = 'match-card';
            card.innerHTML = `
                <div class="match-header">
                    <strong>${match.domain || 'Unknown domain'}</strong>
                    <span class="badge">${match.variant || 'chess'}</span>
                </div>
                <div class="small">Match ID: ${match.id || 'n/a'}</div>
                <div class="small">Detected: ${relativeTime(match.detectedAt)}</div>
                <div class="small">Last seen: ${relativeTime(match.lastSeenAt)}</div>
            `;

            matchesElem.appendChild(card);
        });
    }

    if(!window.bitLiveChessFirebase?.isConfigured) {
        configWarningElem.classList.remove('hidden');
    }

    window.bitLiveChessFirebase?.subscribeLiveMatches(renderMatches);
})();
