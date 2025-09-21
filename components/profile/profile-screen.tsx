import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InputField } from '@/components/ui/input-field';
import { validateName } from '@/constants/validation';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export function ProfileScreen() {
  const { authState, logout, updateProfile, updateSettings } = useAuth();
  const t = useTranslations();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(authState.user?.name || '');
  const [nameError, setNameError] = useState<string | undefined>();
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');

  const validateNameField = (name: string) => {
    const validation = validateName(name);
    setNameError(validation.isValid ? undefined : validation.error);
    return validation.isValid;
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      'Are you sure you want to logout?',
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.logout, style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await updateProfile({ avatar: result.assets[0].uri });
    }
  };

  const handleSaveProfile = async () => {
    if (!validateNameField(editName)) {
      return;
    }
    
    const success = await updateProfile({ name: editName.trim() });
    if (success) {
      setIsEditing(false);
    }
  };

  const handleMusicToggle = (value: boolean) => {
    updateSettings({ musicEnabled: value });
  };

  const handleLanguageChange = (language: 'uk' | 'en') => {
    updateSettings({ language });
  };

  if (!authState.user) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            👤 {t.profile}
          </ThemedText>
        </View>

        {/* Avatar and Name Section */}
        <ThemedView style={[styles.profileCard, { backgroundColor: cardBackground, borderColor }]}>
          <TouchableOpacity onPress={handleChangeAvatar} style={styles.avatarContainer}>
            {authState.user.avatar ? (
              <Image source={{ uri: authState.user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: primaryColor }]}>
                <ThemedText style={[styles.avatarText, { color: 'white' }]}>
                  {authState.user.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
            <ThemedText style={[styles.changeAvatarText, { color: primaryColor }]}>
              {t.changeAvatar}
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.nameSection}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <InputField
                  label="Ім'я"
                  value={editName}
                  onChangeText={setEditName}
                  onBlur={() => validateNameField(editName)}
                  placeholder="Введіть ваше ім'я"
                  error={nameError}
                  hint="Тільки літери та пробіли, мінімум 2 символи"
                  autoCapitalize="words"
                  required
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: primaryColor }]}
                    onPress={handleSaveProfile}
                  >
                    <ThemedText style={[styles.editButtonText, { color: 'white' }]}>
                      {t.save}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: borderColor }]}
                    onPress={() => {
                      setEditName(authState.user?.name || '');
                      setIsEditing(false);
                    }}
                  >
                    <ThemedText style={styles.editButtonText}>
                      {t.cancel}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameDisplay}>
                <ThemedText type="subtitle" style={styles.userName}>
                  {authState.user.name}
                </ThemedText>
                <ThemedText style={styles.userEmail}>
                  {authState.user.email}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.editProfileButton, { borderColor: primaryColor }]}
                  onPress={() => setIsEditing(true)}
                >
                  <ThemedText style={[styles.editProfileText, { color: primaryColor }]}>
                    {t.editProfile}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Settings Section */}
        <ThemedView style={[styles.settingsCard, { backgroundColor: cardBackground, borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ⚙️ {t.settings}
          </ThemedText>

          {/* Music Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>🎵 {t.music}</ThemedText>
            </View>
            <Switch
              value={authState.settings.musicEnabled}
              onValueChange={handleMusicToggle}
              trackColor={{ false: borderColor, true: primaryColor }}
              thumbColor="white"
            />
          </View>

          {/* Language Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>🌐 {t.language}</ThemedText>
            </View>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: authState.settings.language === 'uk' ? primaryColor : 'transparent',
                    borderColor: primaryColor,
                  }
                ]}
                onPress={() => handleLanguageChange('uk')}
              >
                <ThemedText
                  style={[
                    styles.languageButtonText,
                    { color: authState.settings.language === 'uk' ? 'white' : primaryColor }
                  ]}
                >
                  {t.ukrainian}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: authState.settings.language === 'en' ? primaryColor : 'transparent',
                    borderColor: primaryColor,
                  }
                ]}
                onPress={() => handleLanguageChange('en')}
              >
                <ThemedText
                  style={[
                    styles.languageButtonText,
                    { color: authState.settings.language === 'en' ? 'white' : primaryColor }
                  ]}
                >
                  {t.english}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedView>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: errorColor }]}
          onPress={handleLogout}
        >
          <ThemedText style={[styles.logoutButtonText, { color: 'white' }]}>
            🚪 {t.logout}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
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
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nameSection: {
    width: '100%',
    alignItems: 'center',
  },
  nameDisplay: {
    alignItems: 'center',
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 16,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editContainer: {
    width: '100%',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsCard: {
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
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});