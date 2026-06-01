import { useState, useCallback } from 'react';
import { getApiError } from '../utils/apiError';

export const useFormFeedback = () => {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const clear = useCallback(() => {
    setSuccess('');
    setError('');
  }, []);

  const showSuccess = useCallback((message) => {
    setError('');
    setSuccess(message);
  }, []);

  const showError = useCallback((err, fallback) => {
    setSuccess('');
    setError(getApiError(err, fallback));
  }, []);

  return { success, error, clear, showSuccess, showError, setSuccess, setError };
};
