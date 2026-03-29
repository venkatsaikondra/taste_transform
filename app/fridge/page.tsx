"use client";

import React, { useEffect, useState } from 'react';
import Fridge from '@/components/Fridge/fridge';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

const Page = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = React.useCallback(async () => {
    try {
      const response = await axios.get('/api/users/me');
      if (response.data.user) {
        setIsAuthenticated(true);
      } else {
        toast.error('Please login to access the fridge');
        router.push('/login');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Please login to access the fridge';
      console.log(message);
      toast.error('Please login to access the fridge');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);


  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#c5fb45',
        fontSize: '18px',
        fontWeight: 500
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Fridge />;
};

export default Page;