function isSafeKey(key) {
  if (typeof key !== "string") return false;
  const blocked = ["__proto__", "prototype", "constructor"];
  if (blocked.includes(key)) return false;
  return /^[a-zA-Z0-9_]+$/.test(key);
}
(function () {
  const DATABASE_URL = 'https://bitbytelabs-56eb1-default-rtdb.firebaseio.com/';
  const FIRESTORE_REPLAYS_ENDPOINT = 'https://firestore.googleapis.com/v1/projects/bitbytelabs-56eb1/databases/(default)/documents/chessReplays';
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
    if (!isFirebaseReady()) return null;
    try {
      if (!window.firebase.apps.length) {
        window.firebase.initializeApp(config);
      }
      return window.firebase.database();
    } catch (error) {
      console.error('[Bit/Firebase] Initialization failed:', error);
      return null;
    }
  }
  function getMatchRef(matchId) {
    const db = initFirebase();
    if (!db || !matchId) return null;
    return db.ref(`liveChessMatches/${matchId}`);
  }
  function toFirestoreValue(value) {
    if (value === null || typeof value === 'undefined') {
      return {
        nullValue: null
      };
    }
    if (Array.isArray(value)) {
      return {
        arrayValue: {
          values: value.map(entry => toFirestoreValue(entry))
        }
      };
    }
    switch (typeof value) {
      case 'string':
        return {
          stringValue: value
        };
      case 'number':
        return Number.isInteger(value) ? {
          integerValue: value.toString()
        } : {
          doubleValue: value
        };
      case 'boolean':
        return {
          booleanValue: value
        };
      case 'object':
        {
          const fields = {};
          Object.entries(value).forEach(([key, nestedValue]) => {
            if (typeof nestedValue !== 'undefined') {
              if (isSafeKey(key)) {
                fields[key] = toFirestoreValue(nestedValue);
              }
            }
          });
          return {
            mapValue: {
              fields
            }
          };
        }
      default:
        return {
          stringValue: String(value)
        };
    }
  }
  function toFirestoreDocument(payload) {
    const fields = {};
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (typeof value !== 'undefined') {
        if (isSafeKey(key)) {
          fields[key] = toFirestoreValue(value);
        }
      }
    });
    return {
      fields
    };
  }
  async function publishMatch(matchData) {
    const {
      id
    } = matchData || {};
    const ref = getMatchRef(id);
    if (!ref) return false;
    const payload = {
      ...matchData,
      status: 'active',
      lastSeenAt: Date.now()
    };
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'undefined') {
        delete payload[key];
      }
    });
    await ref.update(payload);
    return true;
  }
  async function removeMatch(matchId) {
    const ref = getMatchRef(matchId);
    if (!ref) return false;
    await ref.remove();
    return true;
  }
  async function saveReplay(replayData) {
    if (!replayData?.id || !Array.isArray(replayData?.frames) || !replayData.frames.length) {
      return false;
    }
    const replayPayload = {
      ...replayData,
      savedAt: Date.now()
    };
    const response = await fetch(FIRESTORE_REPLAYS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toFirestoreDocument(replayPayload))
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firestore replay save failed (${response.status}): ${errorText}`);
    }
    return true;
  }
  function subscribeLiveMatches(onChange) {
    const db = initFirebase();
    if (!db || typeof onChange !== 'function') {
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
    saveReplay,
    subscribeLiveMatches
  };
})();