(function() {
    const STORAGE_KEY = 'bit-live-chess-firebase-config';

    const DEFAULT_CONFIG = {
        apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
        authDomain: 'REPLACE_WITH_FIREBASE_AUTH_DOMAIN',
        databaseURL: 'REPLACE_WITH_FIREBASE_DATABASE_URL',
        projectId: 'REPLACE_WITH_FIREBASE_PROJECT_ID',
        storageBucket: 'REPLACE_WITH_FIREBASE_STORAGE_BUCKET',
        messagingSenderId: 'REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID',
        appId: 'REPLACE_WITH_FIREBASE_APP_ID'
    };

    function parseConfigInput(rawValue) {
        if(!rawValue || typeof rawValue !== 'string') {
            return null;
        }

        const trimmedValue = rawValue.trim();

        if(!trimmedValue) {
            return null;
        }

        if(trimmedValue.startsWith('{')) {
            try {
                return JSON.parse(trimmedValue);
            } catch(error) {
                console.error('[Bit/Firebase] Failed to parse config JSON:', error);
                return null;
            }
        }

        if(trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')) {
            return {
                ...DEFAULT_CONFIG,
                databaseURL: trimmedValue
            };
        }

        return null;
    }

    function getStoredConfig() {
        return parseConfigInput(window.localStorage.getItem(STORAGE_KEY));
    }

    let config = window.BIT_FIREBASE_CONFIG || getStoredConfig() || DEFAULT_CONFIG;

    function hasValidConfig(configObj) {
        return configObj?.databaseURL && !configObj.databaseURL.includes('REPLACE_WITH_FIREBASE');
    }

    function isFirebaseReady() {
        return typeof window.firebase !== 'undefined' && hasValidConfig(config);
    }

    function initFirebase() {
        if(!isFirebaseReady()) return null;

        try {
            if(!window.firebase.apps.length) {
                window.firebase.initializeApp(config);
            }

            return window.firebase.database();
        } catch(error) {
            console.error('[Bit/Firebase] Initialization failed:', error);
            return null;
        }
    }

    function getMatchRef(matchId) {
        const db = initFirebase();

        if(!db || !matchId) return null;

        return db.ref(`liveChessMatches/${matchId}`);
    }

    async function publishMatch(matchData) {
        const { id } = matchData || {};
        const ref = getMatchRef(id);

        if(!ref) return false;

        const payload = {
            ...matchData,
            status: 'active',
            lastSeenAt: Date.now()
        };

        await ref.update(payload);

        return true;
    }

    async function removeMatch(matchId) {
        const ref = getMatchRef(matchId);

        if(!ref) return false;

        await ref.remove();

        return true;
    }

    function subscribeLiveMatches(onChange) {
        const db = initFirebase();

        if(!db || typeof onChange !== 'function') {
            return () => {};
        }

        const ref = db.ref('liveChessMatches');
        const listener = snapshot => {
            onChange(snapshot.val() || {});
        };

        ref.on('value', listener);

        return () => ref.off('value', listener);
    }

    window.bitLiveChessFirebase = {
        isConfigured: hasValidConfig(config),
        configStorageKey: STORAGE_KEY,
        parseConfigInput,
        saveConfig(rawValue) {
            const parsedConfig = parseConfigInput(rawValue);

            if(!parsedConfig || !hasValidConfig(parsedConfig)) {
                return false;
            }

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedConfig));
            config = parsedConfig;

            return true;
        },
        clearConfig() {
            window.localStorage.removeItem(STORAGE_KEY);
            config = DEFAULT_CONFIG;
        },
        publishMatch,
        removeMatch,
        subscribeLiveMatches
    };
})();
