import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextDefinition';

export const useAuth = () => {
    return useContext(AuthContext);
};
