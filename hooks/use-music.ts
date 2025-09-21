import { useAuth } from '@/hooks/use-auth';
import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export function useMusic() {
  const { authState } = useAuth();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (authState.settings.musicEnabled && !isPlaying) {
      playSound();
    } else if (!authState.settings.musicEnabled && isPlaying) {
      pauseSound();
    }
  }, [authState.settings.musicEnabled]);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        // You can replace this with your own background music file
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: false, isLooping: true, volume: 0.3 }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const playSound = async () => {
    if (sound && authState.settings.musicEnabled) {
      try {
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  const pauseSound = async () => {
    if (sound) {
      try {
        await sound.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing sound:', error);
      }
    }
  };

  return {
    isPlaying,
    playSound,
    pauseSound,
  };
}