import { useContext } from 'react';
import Web3AuthContext from '../contexts/Web3AuthContext';

const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);

  if (!context) {
    throw new Error('useWeb3Auth hook must be used within Web3AuthContext');
  }

  return context;
};

export default useWeb3Auth;