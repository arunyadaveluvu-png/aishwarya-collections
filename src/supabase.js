import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://xyoidkfzbwsolaonpddk.supabase.co"
const supabaseAnonKey = "sb_publishable_eEy_5GM0aN7PKnu2QNae3w_ioMyX5Vw"

/**
 * Definitive fix for NavigatorLockAcquireTimeoutError.
 * Supabase Auth internally uses navigator.locks.request.
 * By providing a function that immediately executes the callback, 
 * we bypass the locking mechanism entirely.
 */
const dummyLock = async (name, options, callback) => {
    // If second argument is a function, it's the callback
    if (typeof options === 'function') {
        return await options();
    }
    // Otherwise, the third argument is the callback
    return await callback();
};

export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'sb-xyoidkfzbwsolaonpddk-auth-token',
            flowType: 'pkce',
            // Provide dummy lock as a function to satisfy Supabase internals
            lock: dummyLock
        }
    }
)