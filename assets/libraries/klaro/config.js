var klaroConfig = {
    acceptAll: true,
    storageMethod: 'cookie',
    cookieName: 'klaro',
    cookieExpiresAfterDays: 360,
    services: [
        {
            name: 'site_preferences',
            title: 'Site Preferences',
            description: 'Stores consent and interface preferences needed for a consistent experience.',
            purposes: ['functional'],
            required: false
        }
    ]
};
