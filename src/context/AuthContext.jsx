import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../supabase';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTimeoutModal, setShowTimeoutModal] = useState(false);

    // Use refs to track state without triggering re-renders in effects
    const userIdRef = useRef(null);
    const isLoggingOut = useRef(false);

    const fetchProfile = useCallback(async (userId, userEmail) => {
        // Prevent redundant fetches if same user
        if (!userId) {
            setProfile(null);
            setLoading(false);
            userIdRef.current = null;
            return;
        }

        console.log(`[AuthContext] fetchProfile for: ${userEmail}`);
        try {
            // Use maybeSingle() or limit(1) to avoid 406 errors on 0 rows
            const { data: profileRecord, error: pError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            if (pError) console.warn('[AuthContext] Profile fetch warning:', pError.message);

            const { data: adminRecord, error: aError } = userEmail
                ? await supabase.from('admins').select('id').eq('username', userEmail).maybeSingle()
                : { data: null };

            if (aError) console.warn('[AuthContext] Admin fetch warning:', aError.message);

            const isAdminData = !!adminRecord;
            const profileRole = profileRecord?.role || 'customer';

            console.log(`[AuthContext] Resolved Role: ${isAdminData ? 'admin' : profileRole}`);

            setProfile({
                role: isAdminData ? 'admin' : profileRole,
                isAdmin: isAdminData,
                email: userEmail
            });
            userIdRef.current = userId;
        } catch (err) {
            console.error('[AuthContext] Critical fetchProfile error:', err);
            setProfile({ role: 'customer', isAdmin: false });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initSession = async () => {
            try {
                // Definitive fix for hanging auth: Race with a 2.5s timeout
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Auth Session Timeout')), 2500)
                );

                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

                if (isMounted) {
                    const currentUser = session?.user ?? null;
                    if (currentUser) {
                        setUser(currentUser);
                        await fetchProfile(currentUser.id, currentUser.email);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error('[AuthContext] Session Init Error/Timeout:', err.message);
                if (isMounted) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AuthContext] onAuthStateChange Event: ${event}`);

            if (!isMounted || isLoggingOut.current) return;

            const currentUser = session?.user ?? null;

            // Only trigger update if user ID actually changed
            if (currentUser?.id !== userIdRef.current) {
                console.log('[AuthContext] User change detected, updating state...');
                setUser(currentUser);
                if (currentUser) {
                    await fetchProfile(currentUser.id, currentUser.email);
                } else {
                    setProfile(null);
                    setLoading(false);
                    userIdRef.current = null;
                }
            } else if (event === 'SIGNED_OUT') {
                // Force clear on SIGNED_OUT even if ID "matches" (shouldn't happen but safe)
                setUser(null);
                setProfile(null);
                setLoading(false);
                userIdRef.current = null;
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    // Inactivity check
    useEffect(() => {
        if (!user || showTimeoutModal) return;

        let inactivityTimer;
        const INACTIVITY_LIMIT = 10 * 60 * 1000;

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                console.log('[AuthContext] Inactivity reached');
                setShowTimeoutModal(true);
            }, INACTIVITY_LIMIT);
        };

        const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        resetTimer();

        activityEvents.forEach(e => window.addEventListener(e, resetTimer));
        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            activityEvents.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [user, showTimeoutModal]);

    const register = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { role: 'customer' } }
        });
        if (error) throw error;
        return data;
    }, []);

    const login = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    }, []);

    const logout = useCallback(async () => {
        if (isLoggingOut.current) return;

        console.log('[AuthContext] Manual Logout initiated');
        isLoggingOut.current = true;

        try {
            await supabase.auth.signOut();
            console.log('[AuthContext] Supabase signOut success');
        } catch (error) {
            console.error('[AuthContext] signOut error:', error.message);
        } finally {
            // Immediate state clear regardless of network result
            setUser(null);
            setProfile(null);
            setShowTimeoutModal(false);
            setLoading(false);
            userIdRef.current = null;

            // Allow events after a short delay
            setTimeout(() => {
                isLoggingOut.current = false;
                console.log('[AuthContext] Logout flow complete, state reset');
            }, 500);
        }
    }, []);

    const resetTimer = useCallback(() => setShowTimeoutModal(false), []);

    const value = useMemo(() => {
        const role = profile?.role || user?.user_metadata?.role || 'customer';
        const isAdmin = profile?.isAdmin || role === 'admin';

        return {
            user,
            profile,
            loading,
            role,
            isAdmin,
            showTimeoutModal,
            setShowTimeoutModal,
            register,
            login,
            logout,
            resetTimer,
            refreshProfile: fetchProfile
        };
    }, [user, profile, loading, showTimeoutModal, register, login, logout, resetTimer, fetchProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
