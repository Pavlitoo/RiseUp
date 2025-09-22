import { useAuth } from '@/hooks/use-auth';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export function useMusic() {
  const { authState } = useAuth();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSound();
    return () => {
      cleanup();
    };
  }, []);

  // Реагуємо на зміни налаштувань музики МИТТЄВО
  useEffect(() => {
    console.log('🎵 Music setting changed:', authState.settings.musicEnabled);
    
    if (authState.settings.musicEnabled && !isPlaying && isLoaded && sound) {
      playSound();
    } else if (!authState.settings.musicEnabled && isPlaying && isLoaded && sound) {
      pauseSound();
    }
  }, [authState.settings.musicEnabled, isLoaded, sound, isPlaying]);

  const cleanup = () => {
    if (sound) {
      sound.unloadAsync();
    }
  };

  const loadSound = async () => {
    try {
      // Set up audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load the background music file
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sound/background-music.mp3'),
        { 
          shouldPlay: false, 
          isLooping: true, 
          volume: 0.3,
        }
      );
      
      setSound(newSound);
      setIsLoaded(true);
      console.log('🎵 Audio loaded successfully');
    } catch (error) {
      console.error('Error loading audio:', error);
      // Create a fallback silent sound for web compatibility
      try {
        const { sound: fallbackSound } = await Audio.Sound.createAsync(
          { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT' },
          { shouldPlay: false, isLooping: true, volume: 0.1 }
        );
        setSound(fallbackSound);
        setIsLoaded(true);
        console.log('🎵 Fallback audio loaded');
      } catch (fallbackError) {
        console.error('Error loading fallback audio:', fallbackError);
        setIsLoaded(true);
      }
    }
  };

  const playSound = async () => {
    if (sound && authState.settings.musicEnabled && isLoaded && !isPlaying) {
      try {
        await sound.playAsync();
        setIsPlaying(true);
        console.log('🎵 Music started');
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  const pauseSound = async () => {
    if (sound && isLoaded && isPlaying) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
        console.log('🔇 Music stopped');
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