import { useState, useCallback } from 'react';
import useAppStore from '../store/useAppStore';

export function useAgent() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAgentActive, agentMode, addChatMessage, addNotification } = useAppStore();

  const executeAction = useCallback(async (action, params = {}) => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const result = { success: true, action, txHash: '0x' + Math.random().toString(16).slice(2, 42) };
      addNotification({
        type: 'success',
        title: 'Action Completed',
        message: `${action} executed successfully`,
      });
      return result;
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [addNotification]);

  const sendMessage = useCallback(async (content) => {
    addChatMessage({ role: 'user', content });
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const replies = [
        "Based on your current portfolio, I recommend rebalancing your positions to maximize yield. Your SaucerSwap LP position is underperforming compared to the current market rates.",
        "I've analyzed your gas spending patterns. You can save approximately 0.01 HBAR/week by switching to daily rebalancing instead of hourly.",
        "Your pending rewards of $84.20 should be harvested soon. Compounding now would increase your monthly earnings by approximately $4.",
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      addChatMessage({ role: 'assistant', content: reply });
    } finally {
      setIsProcessing(false);
    }
  }, [addChatMessage]);

  return { isAgentActive, agentMode, isProcessing, executeAction, sendMessage };
}
