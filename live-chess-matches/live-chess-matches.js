(function() {
    const matchesElem = document.getElementById('matches');
    const emptyStateElem = document.getElementById('empty-state');
    const configWarningElem = document.getElementById('config-warning');
    const setupPanelElem = document.getElementById('setup-panel');
    const configInputElem = document.getElementById('config-input');
    const saveConfigButtonElem = document.getElementById('save-config');
    const clearConfigButtonElem = document.getElementById('clear-config');
    const setupStatusElem = document.getElementById('setup-status');

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

    function setStatus(message, isError = false) {
        setupStatusElem.textContent = message;
        setupStatusElem.classList.toggle('status-error', isError);
    }

    function setupFirebaseConfigUI() {
        if(!setupPanelElem) {
            return;
        }

        setupPanelElem.classList.remove('hidden');

        if(window.bitLiveChessFirebase?.isConfigured) {
            setStatus('Firebase config found. You can still replace it below.');
        }

        saveConfigButtonElem?.addEventListener('click', () => {
            const rawValue = configInputElem?.value || '';
            const isSaved = window.bitLiveChessFirebase?.saveConfig(rawValue);

            if(isSaved) {
                setStatus('Saved! Reload this page and keep /app/ open to start receiving live matches.');
                configWarningElem?.classList.add('hidden');
            } else {
                setStatus('Could not save config. Please paste valid Firebase JSON or a database URL.', true);
            }
        });

        clearConfigButtonElem?.addEventListener('click', () => {
            window.bitLiveChessFirebase?.clearConfig();
            setStatus('Saved config removed. Reload this page after adding a new one.');
            configWarningElem?.classList.remove('hidden');
        });
    }

    if(!window.bitLiveChessFirebase?.isConfigured) {
        configWarningElem.classList.remove('hidden');
    }

    setupFirebaseConfigUI();
    window.bitLiveChessFirebase?.subscribeLiveMatches(renderMatches);
})();
