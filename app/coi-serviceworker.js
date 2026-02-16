/*! coi-serviceworker v0.1.6 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("message", (ev) => {
        const workerOrigin = self.location && self.location.origin ? self.location.origin : null;
        const eventOrigin = typeof ev.origin === "string" ? ev.origin : null;
        const isTrustedOrigin =
            workerOrigin !== null &&
            eventOrigin === workerOrigin;

        if (!isTrustedOrigin) {
            return;
        }

        if (!ev.data) {
            return;
        } else if (ev.data.type === "deregister") {
            self.registration
                .unregister()
                .then(() => {
                    return self.clients.matchAll();
                })
                .then(clients => {
                    clients.forEach((client) => client.navigate(client.url));
                });
        } else if (ev.data.type === "coepCredentialless") {
            coepCredentialless = ev.data.value;
        }
    });

    function buildValidatedUrl(requestUrl) {
        try {
            const url = new URL(requestUrl);
            
            // Protocol check
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Invalid protocol');
            }
            
            // Domain validation - allow same origin and common CDNs
            const allowedDomains = [self.location.hostname]; // add your allowed domains here
            if (!allowedDomains.includes(url.hostname)) {
                throw new Error('Invalid host');
            }
            
            return url.href;
        } catch {
            throw new Error('Invalid URL');
        }
    }

    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
            return;
        }

        try {
            // Validate the request URL to prevent SSRF
            const validatedUrl = buildValidatedUrl(r.url);
            
            const request = (coepCredentialless && r.mode === "no-cors")
                ? new Request(validatedUrl, {
                    method: r.method,
                    headers: r.headers,
                    body: r.body,
                    credentials: "omit",
                })
                : new Request(validatedUrl, {
                    method: r.method,
                    headers: r.headers,
                    body: r.body,
                    credentials: r.credentials,
                });
            
            event.respondWith(
                fetch(request)
                .then((response) => {
                    if (response.status === 0) {
                        return response;
                    }

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy",
                        coepCredentialless ? "credentialless" : "require-corp"
                    );
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        } catch (error) {
            // Return a network error response for invalid URLs
            event.respondWith(Promise.resolve(new Response(null, { 
                status: 0, 
                statusText: 'Network Error' 
            })));
        }
    });

} else {
    (() => {
        // You can customize the behavior of this script through a global `coi` variable.
        const coi = {
            shouldRegister: () => true,
            shouldDeregister: () => false,
            coepCredentialless: () => false,
            doReload: () => window.location.reload(),
            quiet: false,
            ...window.coi
        };

        const n = navigator;

        if (n.serviceWorker && n.serviceWorker.controller) {
            n.serviceWorker.controller.postMessage({
                type: "coepCredentialless",
                value: coi.coepCredentialless(),
            });

            if (coi.shouldDeregister()) {
                n.serviceWorker.controller.postMessage({ type: "deregister" });
            }
        }

        // If we're already coi: do nothing. Perhaps it's due to this script doing its job, or COOP/COEP are
        // already set from the origin server. Also if the browser has no notion of crossOriginIsolated, just give up here.
        if (window.crossOriginIsolated !== false || !coi.shouldRegister()) return;

        if (!window.isSecureContext) {
            console.log("COOP/COEP Service Worker not registered, a secure context is required.");
            return;
        }

        // In some environments (e.g. Chrome incognito mode) this won't be available
        if (n.serviceWorker) {
            n.serviceWorker.register(window.document.currentScript.src).then(
                (registration) => {
                    console.log("COOP/COEP Service Worker registered", registration.scope);

                    registration.addEventListener("updatefound", () => {
                        console.log("Reloading page to make use of updated COOP/COEP Service Worker.");
                        coi.doReload();
                    });

                    // If the registration is active, but it's not controlling the page
                    if (registration.active && !n.serviceWorker.controller) {
                        console.log("Reloading page to make use of COOP/COEP Service Worker.");
                        coi.doReload();
                    }
                },
                (err) => {
                    console.error("COOP/COEP Service Worker failed to register:", err);
                }
            );
        }
    })();
}