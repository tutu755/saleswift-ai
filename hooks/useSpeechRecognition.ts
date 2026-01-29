import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
  isSupported: boolean;
}

/**
 * 使用浏览器内置的 Web Speech API 进行语音识别
 * 完全免费，无需 API Key
 * 但只支持 Chrome、Edge 等基于 Chromium 的浏览器
 */
export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 检查浏览器是否支持 Web Speech API
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // 持续监听
      recognition.interimResults = true; // 显示临时结果
      recognition.lang = 'zh-CN'; // 中文识别
      
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        setError(getErrorMessage(event.error));
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('您的浏览器不支持语音识别');
      return;
    }
    
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error('启动语音识别失败:', err);
      setError('无法启动语音识别，请重试');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.error('停止语音识别失败:', err);
    }
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    error,
    isSupported,
  };
};

function getErrorMessage(error: string): string {
  switch (error) {
    case 'no-speech':
      return '没有检测到语音，请重试';
    case 'audio-capture':
      return '无法访问麦克风';
    case 'not-allowed':
      return '麦克风权限被拒绝';
    case 'network':
      return '网络错误，请检查连接';
    default:
      return '语音识别失败，请重试';
  }
}
