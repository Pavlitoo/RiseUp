import { useAuth } from '@/hooks/use-auth';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export function useMusic() {
  const { authState } = useAuth();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [oscillator, setOscillator] = useState<OscillatorNode | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);

  useEffect(() => {
    loadSound();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (authState.settings.musicEnabled && !isPlaying && isLoaded) {
      playSound();
    } else if (!authState.settings.musicEnabled && isPlaying && isLoaded) {
      pauseSound();
    }
  }, [authState.settings.musicEnabled, isLoaded]);

  const cleanup = () => {
    if (sound) {
      sound.unloadAsync();
    }
    if (oscillator) {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        // Oscillator might already be stopped
      }
    }
    if (audioContext) {
      audioContext.close();
    }
  };

  const loadSound = async () => {
    try {
      if (process.env.EXPO_OS === 'web') {
        // For web, create Web Audio API context
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          setAudioContext(ctx);
          setIsLoaded(true);
          console.log('🎵 Web Audio API initialized');
        } catch (error) {
          console.log('Web Audio API not supported');
          setIsLoaded(true);
        }
      } else {
        // For mobile, set up Expo Audio
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Create a simple tone using Audio API
        try {
          // Create a simple beep sound programmatically
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' } as any,
            { 
              shouldPlay: false, 
              isLooping: true, 
              volume: 0.1,
            }
          );
          setSound(newSound);
          setIsLoaded(true);
          console.log('🎵 Mobile audio initialized');
        } catch (error) {
          console.log('Could not create audio, using fallback');
          setIsLoaded(true);
        }
      }
    } catch (error) {
      console.error('Error setting up audio:', error);
      setIsLoaded(true);
    }
  };

  const createWebAudioTone = () => {
    if (!audioContext) return;

    try {
      // Create oscillator for a pleasant background tone
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      // Set up a pleasant ambient tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, audioContext.currentTime); // A3 note
      
      // Very low volume for background ambience
      gain.gain.setValueAtTime(0.02, audioContext.currentTime);
      
      // Connect nodes
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      // Start the tone
      osc.start();
      
      setOscillator(osc);
      setGainNode(gain);
      
      console.log('🎵 Web audio tone started');
    } catch (error) {
      console.error('Error creating web audio tone:', error);
    }
  };

  const stopWebAudioTone = () => {
    if (oscillator) {
      try {
        oscillator.stop();
        oscillator.disconnect();
        setOscillator(null);
        console.log('🔇 Web audio tone stopped');
      } catch (error) {
        // Oscillator might already be stopped
      }
    }
  };

  const playSound = async () => {
    if (process.env.EXPO_OS === 'web') {
      if (audioContext && audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      createWebAudioTone();
      setIsPlaying(true);
      return;
    }

    if (sound && authState.settings.musicEnabled && isLoaded) {
      try {
        await sound.playAsync();
        setIsPlaying(true);
        console.log('🎵 Mobile music started');
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  const pauseSound = async () => {
    if (process.env.EXPO_OS === 'web') {
      stopWebAudioTone();
      setIsPlaying(false);
      return;
    }

    if (sound && isLoaded) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
        console.log('🔇 Mobile music stopped');
      } catch (error) {
        console.error('Error pausing sound:', error);
      }
    }
  };

  return {
    isPlaying,
    isLoaded,
    playSound,
    pauseSound,
  };
}