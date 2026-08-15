/**
 * Safe fetch utility with automatic resilience against third-party browser extensions
 * that monkey-patch window.fetch and fail with errors such as:
 * "TypeError: Cannot read properties of undefined (reading 'M_ID')" in content scripts.
 */
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (err: any) {
    const isExtensionError =
      err?.message?.includes("M_ID") ||
      err?.message?.includes("reading 'M_ID'") ||
      err?.stack?.includes("chrome-extension://") ||
      err?.stack?.includes("moz-extension://");

    if (isExtensionError && typeof window !== "undefined" && typeof XMLHttpRequest !== "undefined") {
      return new Promise<Response>((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest();
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
              ? input.toString()
              : input.url;

          const method =
            init?.method ||
            (typeof input === "object" && "method" in input ? (input as Request).method : "GET") ||
            "GET";

          xhr.open(method, url, true);

          if (init?.headers) {
            if (init.headers instanceof Headers) {
              init.headers.forEach((val, key) => xhr.setRequestHeader(key, val));
            } else if (Array.isArray(init.headers)) {
              init.headers.forEach(([key, val]) => xhr.setRequestHeader(key, val));
            } else {
              Object.entries(init.headers).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                  xhr.setRequestHeader(key, String(val));
                }
              });
            }
          }

          xhr.onload = () => {
            const headers = new Headers();
            const rawHeaders = xhr.getAllResponseHeaders();
            rawHeaders
              .trim()
              .split(/[\r\n]+/)
              .forEach((line) => {
                const parts = line.split(": ");
                const header = parts.shift();
                const value = parts.join(": ");
                if (header) headers.append(header, value);
              });

            const response = new Response(xhr.response || xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers,
            });
            resolve(response);
          };

          xhr.onerror = () => reject(new TypeError("Network request failed via fallback client"));
          xhr.ontimeout = () => reject(new TypeError("Network request timed out via fallback client"));

          xhr.send((init?.body as Document | XMLHttpRequestBodyInit | null) || null);
        } catch (xhrErr) {
          reject(xhrErr);
        }
      });
    }

    throw err;
  }
}
