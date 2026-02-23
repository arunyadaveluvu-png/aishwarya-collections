declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
        set(key: string, value: string): void;
        delete(key: string): void;
        toObject(): { [index: string]: string };
    }
    export const env: Env;

    export interface ServeOptions {
        port?: number;
        hostname?: string;
        signal?: AbortSignal;
        onError?: (error: unknown) => Response | Promise<Response>;
        onListen?: (params: { hostname: string; port: number }) => void;
    }

    export function serve(
        handler: (request: Request, connInfo: any) => Response | Promise<Response>,
        options?: ServeOptions
    ): void;
}
