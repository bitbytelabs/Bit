(function() {
    const DATABASE_URL = 'https://bitbytelabs-56eb1-default-rtdb.firebaseio.com/';

    const config = {
        databaseURL: DATABASE_URL
    };

    function hasValidConfig(configObj) {
        return configObj?.databaseURL;
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

        Object.keys(payload).forEach(key => {
            if(typeof payload[key] === 'undefined') {
                delete payload[key];
            }
        });

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
        databaseURL: DATABASE_URL,
        publishMatch,
        removeMatch,
        subscribeLiveMatches
    };
})();
