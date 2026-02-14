if('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
            registration.unregister();
        });
    });
}

const githubUpdateCheckConfig = {
    'apiEndpoint': 'https://api.github.com/repos/bitbytelabs/Bit/commits/main',
    'checkInterval': 3 * 60 * 1000
};

const isGithubPagesHost = window.location.hostname.endsWith('github.io');
const isDevelopmentHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

async function getLatestCommitSha() {
    const response = await fetch(githubUpdateCheckConfig.apiEndpoint, {
        'headers': {
            'Accept': 'application/vnd.github+json'
        }
    });

    if(!response.ok)
        return null;

    const commit = await response.json();

    return commit?.sha || null;
}

async function watchForGithubUpdates() {
    if(!isGithubPagesHost && !isDevelopmentHost)
        return;

    let currentCommitSha = await getLatestCommitSha();

    if(!currentCommitSha)
        return;

    setInterval(async () => {
        const latestCommitSha = await getLatestCommitSha();

        if(latestCommitSha && latestCommitSha !== currentCommitSha) {
            window.location.reload();
        }
    }, githubUpdateCheckConfig.checkInterval);
}

watchForGithubUpdates();
