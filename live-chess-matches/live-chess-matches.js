(function() {
    const matchesElem = document.getElementById('matches');
    const emptyStateElem = document.getElementById('empty-state');
    const configWarningElem = document.getElementById('config-warning');
    const setupPanelElem = document.getElementById('setup-panel');
    const configInputElem = document.getElementById('config-input');
    const saveConfigButtonElem = document.getElementById('save-config');
    const clearConfigButtonElem = document.getElementById('clear-config');
    const setupStatusElem = document.getElementById('setup-status');

    const pieceImageMap = {
        K: 'wK.svg', Q: 'wQ.svg', R: 'wR.svg', B: 'wB.svg', N: 'wN.svg', P: 'wP.svg',
        k: 'bK.svg', q: 'bQ.svg', r: 'bR.svg', b: 'bB.svg', n: 'bN.svg', p: 'bP.svg'
    };

    function relativeTime(timestamp) {
        if(!timestamp) return 'Unknown';

        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if(seconds < 60) return `${seconds}s ago`;
        if(seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;

        return `${Math.floor(seconds / 3600)}h ago`;
    }

    function parseFenBoard(fen) {
        const board = [];
        const boardFen = fen?.split(' ')?.[0];

        if(!boardFen) {
            return null;
        }

        const rows = boardFen.split('/');

        rows.forEach(row => {
            const parsedRow = [];

            [...row].forEach(char => {
                if(/[1-9]/.test(char)) {
                    parsedRow.push(...new Array(Number(char)).fill(null));
                } else {
                    parsedRow.push(char);
                }
            });

            board.push(parsedRow);
        });

        return board;
    }

    function createBoardElement(fen, orientation = 'w') {
        const parsedBoard = parseFenBoard(fen);

        if(!parsedBoard?.length) {
            return null;
        }

        const boardElem = document.createElement('div');
        boardElem.className = 'mini-board';

        const rowIndexes = [...parsedBoard.keys()];
        const colIndexes = parsedBoard[0].map((_, idx) => idx);
        const isBlackView = orientation === 'b';

        const rows = isBlackView ? [...rowIndexes].reverse() : rowIndexes;
        const cols = isBlackView ? [...colIndexes].reverse() : colIndexes;

        rows.forEach(y => {
            cols.forEach(x => {
                const piece = parsedBoard[y]?.[x] || null;
                const square = document.createElement('div');
                square.className = `mini-square ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;

                if(piece) {
                    const pieceFileName = pieceImageMap[piece];

                    if(pieceFileName) {
                        const pieceImg = document.createElement('img');
                        pieceImg.className = 'mini-piece';
                        pieceImg.src = `../assets/images/pieces/staunty/${pieceFileName}`;
                        pieceImg.alt = `${piece === piece.toUpperCase() ? 'White' : 'Black'} ${piece.toUpperCase()}`;

                        square.appendChild(pieceImg);
                    }
                }

                boardElem.appendChild(square);
            });
        });

        return boardElem;
    }

    function renderMatches(data) {
        const entries = Object.values(data || {}).sort((a, b) => (b.lastSeenAt || 0) - (a.lastSeenAt || 0));

        matchesElem.innerHTML = '';
        emptyStateElem.style.display = entries.length ? 'none' : 'block';

        entries.forEach(match => {
            const card = document.createElement('article');
            card.className = 'match-card';

            const boardElem = createBoardElement(match.fen, match.orientation);
            const boardMarkup = boardElem ? '<div class="board-container" data-board-slot></div>' : '<div class="small">Board preview is not available yet.</div>';

            card.innerHTML = `
                <div class="match-header">
                    <strong>${match.domain || 'Unknown domain'}</strong>
                    <span class="badge">${match.variant || 'chess'}</span>
                </div>
                <div class="small">Match ID: ${match.id || 'n/a'}</div>
                <div class="small">Detected: ${relativeTime(match.detectedAt)}</div>
                <div class="small">Last seen: ${relativeTime(match.lastSeenAt)}</div>
                ${boardMarkup}
            `;

            if(boardElem) {
                card.querySelector('[data-board-slot]')?.appendChild(boardElem);
            }

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
