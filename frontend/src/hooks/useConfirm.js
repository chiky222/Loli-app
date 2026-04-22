import { useState, useCallback } from 'react';

export function useConfirm() {
  const [state, setState] = useState({ open: false, title: '', message: '', icon: '⚠️', resolve: null });

  const confirm = useCallback((title, message, icon = '⚠️') => {
    return new Promise(resolve => {
      setState({ open: true, title, message, icon, resolve });
    });
  }, []);

  const respond = useCallback((result) => {
    setState(s => {
      s.resolve(result);
      return { ...s, open: false };
    });
  }, []);

  return { confirm, confirmState: state, respond };
}
