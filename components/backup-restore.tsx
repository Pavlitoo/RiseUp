import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import { firebaseService } from '@/services/FirebaseService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function BackupRestore() {
  const { authState } = useAuth();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const warningColor = useThemeColor({}, 'warning');

  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    if (!authState.user) return;

    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setLoading(true);
    
    try {
      const exportData = await firebaseService.exportUserData(authState.user.id);
      
      const fileName = `riseup_backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = `${(FileSystem as any).documentDirectory || ''}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportData, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Зберегти резервну копію RiseUp',
        });
      } else {
        Alert.alert(
          'Резервна копія створена',
          `Файл збережено: ${fileName}`,
          [{ text: 'OK' }]
        );
      }
      
      if (process.env.EXPO_OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Backup failed:', error);
      Alert.alert('Помилка', 'Не вдалося створити резервну копію');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!authState.user) return;

    Alert.alert(
      'Відновлення даних',
      'Це замінить всі ваші поточні дані. Продовжити?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Відновити', 
          style: 'destructive',
          onPress: performRestore
        }
      ]
    );
  };

  const performRestore = async () => {
    if (process.env.EXPO_OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setLoading(true);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setLoading(false);
        return;
      }

      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const importData = JSON.parse(fileContent);
      
      // Validate backup file
      if (!importData.userId || !importData.data || !importData.version) {
        throw new Error('Невірний формат файлу резервної копії');
      }

      await firebaseService.importUserData(authState.user!.id, importData);
      
      Alert.alert(
        'Успіх',
        'Дані успішно відновлено. Перезапустіть додаток для застосування змін.',
        [{ text: 'OK' }]
      );
      
      if (process.env.EXPO_OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Помилка', 'Не вдалося відновити дані з файлу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          💾 Резервне копіювання
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Збережіть та відновіть ваші дані
        </ThemedText>
      </View>

      <Animated.View 
        entering={FadeIn.duration(800)}
        style={[styles.section, { backgroundColor: cardBackground, borderColor }]}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📤 Створити резервну копію
        </ThemedText>
        
        <ThemedText style={styles.description}>
          Збережіть всі ваші звички, досягнення та статистику у файл. 
          Цей файл можна використати для відновлення даних на іншому пристрої.
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={handleBackup}
          disabled={loading}
        >
          <ThemedText style={[styles.buttonText, { color: 'white' }]}>
            {loading ? '⏳ Створення...' : '📤 Створити резервну копію'}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        entering={FadeIn.delay(200).duration(800)}
        style={[styles.section, { backgroundColor: cardBackground, borderColor }]}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          📥 Відновити з резервної копії
        </ThemedText>
        
        <View style={[styles.warningBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: warningColor }]}>
          <ThemedText style={[styles.warningIcon, { color: warningColor }]}>⚠️</ThemedText>
          <ThemedText style={[styles.warningText, { color: warningColor }]}>
            Увага! Це замінить всі ваші поточні дані.
          </ThemedText>
        </View>
        
        <ThemedText style={styles.description}>
          Оберіть файл резервної копії для відновлення ваших даних. 
          Переконайтеся, що файл створений цим додатком.
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: warningColor }]}
          onPress={handleRestore}
          disabled={loading}
        >
          <ThemedText style={[styles.buttonText, { color: 'white' }]}>
            {loading ? '⏳ Відновлення...' : '📥 Відновити дані'}
          </ThemedText>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        entering={FadeIn.delay(400).duration(800)}
        style={[styles.infoSection, { backgroundColor: cardBackground, borderColor }]}
      >
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ℹ️ Інформація
        </ThemedText>
        
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoIcon}>🔒</ThemedText>
            <ThemedText style={styles.infoText}>
              Ваші дані зберігаються локально та в Firebase
            </ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoIcon}>☁️</ThemedText>
            <ThemedText style={styles.infoText}>
              Автоматична синхронізація при підключенні до інтернету
            </ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoIcon}>📱</ThemedText>
            <ThemedText style={styles.infoText}>
              Підтримка роботи в офлайн режимі
            </ThemedText>
          </View>
          
          <View style={styles.infoItem}>
            <ThemedText style={styles.infoIcon}>🔄</ThemedText>
            <ThemedText style={styles.infoText}>
              Регулярно створюйте резервні копії для безпеки
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.8,
  },
});