(function() {
    const STORAGE_KEY = 'bit-firebase-config';
    const DEFAULT_CONFIG = {
        apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
        authDomain: 'REPLACE_WITH_FIREBASE_AUTH_DOMAIN',
        databaseURL: 'REPLACE_WITH_FIREBASE_DATABASE_URL',
        projectId: 'REPLACE_WITH_FIREBASE_PROJECT_ID',
        storageBucket: 'REPLACE_WITH_FIREBASE_STORAGE_BUCKET',
        messagingSenderId: 'REPLACE_WITH_FIREBASE_MESSAGING_SENDER_ID',
        appId: 'REPLACE_WITH_FIREBASE_APP_ID'
    };

    function readStoredConfig() {
        try {
            const rawConfig = window.localStorage.getItem(STORAGE_KEY);

            if(!rawConfig) return null;

            return JSON.parse(rawConfig);
        } catch(error) {
            console.error('[Bit/Firebase] Failed to parse local config:', error);
            return null;
        }
    }

    function resolveConfig() {
        return window.BIT_FIREBASE_CONFIG || readStoredConfig() || DEFAULT_CONFIG;
    }

    function hasValidConfig(config) {
        if(!config || typeof config !== 'object') return false;

        const databaseURL = config.databaseURL;

        return typeof databaseURL === 'string'
            && databaseURL.length > 0
            && !databaseURL.includes('REPLACE_WITH_FIREBASE');
    }

    function normalizeConfig(configObj) {
        if(typeof configObj === 'string') {
            return { databaseURL: configObj };
        }

        if(configObj && typeof configObj === 'object') {
            return { ...configObj };
        }

        return null;
    }

    function isFirebaseReady() {
        return typeof window.firebase !== 'undefined' && hasValidConfig(resolveConfig());
    }

    function initFirebase() {
        if(!isFirebaseReady()) return null;

        try {
            const config = resolveConfig();

            if(!window.firebase.apps.length) {
                window.firebase.initializeApp(config);
            }

            return window.firebase.database();
        } catch(error) {
            console.error('[Bit/Firebase] Initialization failed:', error);
            return null;
        }
    }

    function sanitizeMatchId(matchId) {
        if(typeof matchId !== 'string' && typeof matchId !== 'number') return null;

        return String(matchId).replace(/[.#$/\[\]]/g, '_');
    }

    function getMatchRef(matchId) {
        const db = initFirebase();
        const safeMatchId = sanitizeMatchId(matchId);

        if(!db || !safeMatchId) return null;

        return db.ref(`liveChessMatches/${safeMatchId}`);
    }

    async function publishMatch(matchData) {
        const { id } = matchData || {};
        const ref = getMatchRef(id);

        if(!ref) return false;

        const payload = {
            ...matchData,
            id: sanitizeMatchId(id),
            status: 'active',
            lastSeenAt: Date.now()
        };

        if(!payload.detectedAt) {
            payload.detectedAt = payload.lastSeenAt;
        }

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

    function saveConfig(configObj) {
        const normalizedConfig = normalizeConfig(configObj);

        if(!hasValidConfig(normalizedConfig)) {
            return false;
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedConfig));
        return true;
    }

    function clearSavedConfig() {
        window.localStorage.removeItem(STORAGE_KEY);
    }

    window.bitLiveChessFirebase = {
        isConfigured: hasValidConfig(resolveConfig()),
        publishMatch,
        removeMatch,
        subscribeLiveMatches,
        saveConfig,
        clearSavedConfig,
        configTemplate: DEFAULT_CONFIG
    };
})();
