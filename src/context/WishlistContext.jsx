import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../hooks/useAuth';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            return;
        }

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('wishlist')
                .select('product_id');

            if (error) throw error;
            setWishlist(data.map(item => item.product_id));
        } catch (error) {
            console.error('Error fetching wishlist:', error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = async (productId) => {
        if (!user) return alert('Please login to add favorites');

        const isFavorited = wishlist.includes(productId);

        try {
            if (isFavorited) {
                // Optimistic UI update
                setWishlist(prev => prev.filter(id => id !== productId));

                const { error } = await supabase
                    .from('wishlist')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('product_id', productId);

                if (error) throw error;
            } else {
                // Optimistic UI update
                setWishlist(prev => [...prev, productId]);

                const { error } = await supabase
                    .from('wishlist')
                    .insert([{ user_id: user.id, product_id: productId }]);

                if (error) throw error;
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error.message);
            // Revert on error
            fetchWishlist();
        }
    };

    const isInWishlist = (productId) => wishlist.includes(productId);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
