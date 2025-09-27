import { ThemedText } from '@/components/themed-text';
import { useCoins } from '@/hooks/use-coins';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface ShopModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ShopModal({ visible, onClose }: ShopModalProps) {
  const { coins, purchases, purchaseItem } = useCoins();
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  React.useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePurchase = (itemId: string) => {
    const item = purchases.find(p => p.id === itemId);
    if (!item) return;

    if (item.purchased) {
      Alert.alert(t.error, 'Цей предмет вже куплено');
      return;
    }

    if (coins < item.cost) {
      Alert.alert(t.notEnoughCoins, `Вам потрібно ще ${item.cost - coins} монет`);
      return;
    }

    Alert.alert(
      t.confirm,
      `Купити "${item.name}" за ${item.cost} монет?`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.buy,
          onPress: () => {
            if (process.env.EXPO_OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            const success = purchaseItem(itemId);
            if (success) {
              Alert.alert(t.success, t.purchaseSuccessful);
            }
          }
        }
      ]
    );
  };

  const filteredPurchases = selectedCategory === 'all' 
    ? purchases 
    : purchases.filter(item => item.type === selectedCategory);

  const categories = [
    { id: 'all', name: 'Все', icon: '🛍️' },
    { id: 'character_upgrade', name: t.characterUpgrades, icon: '👤' },
    { id: 'theme', name: t.themes, icon: '🎨' },
    { id: 'special_effect', name: t.specialEffects, icon: '✨' },
    { id: 'boost', name: 'Бусти', icon: '⚡' },
  ];

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, animatedModalStyle]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        
        <Animated.View style={[
          styles.modal,
          { backgroundColor: cardBackground, borderColor },
          animatedContentStyle,
        ]}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>🛍️ {t.shop}</ThemedText>
            <View style={styles.coinsDisplay}>
              <ThemedText style={styles.coinIcon}>🪙</ThemedText>
              <ThemedText style={[styles.coinsText, { color: primaryColor }]}>
                {coins.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category.id ? primaryColor : 'transparent',
                    borderColor: primaryColor,
                  }
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                <ThemedText style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? 'white' : primaryColor }
                ]}>
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {filteredPurchases.map((item, index) => (
              <View key={item.id} style={[
                styles.itemCard,
                { 
                  backgroundColor: cardBackground,
                  borderColor: item.purchased ? primaryColor : borderColor,
                  opacity: item.purchased ? 0.7 : 1,
                }
              ]}>
                <View style={styles.itemHeader}>
                  <ThemedText style={styles.itemIcon}>{item.icon}</ThemedText>
                  <View style={styles.itemInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.itemName}>
                      {item.name}
                      {item.purchased && <ThemedText style={{ color: primaryColor }}> ✓</ThemedText>}
                    </ThemedText>
                    <ThemedText style={styles.itemDescription}>
                      {item.description}
                    </ThemedText>
                    <ThemedText style={[styles.itemType, { color: primaryColor }]}>
                      {item.type === 'character_upgrade' && 'Покращення персонажа'}
                      {item.type === 'theme' && 'Тема'}
                      {item.type === 'special_effect' && 'Спеціальний ефект'}
                      {item.type === 'boost' && 'Буст'}
                    </ThemedText>
                  </View>
                </View>
                
                <View style={styles.itemFooter}>
                  <View style={styles.priceContainer}>
                    <ThemedText style={styles.coinIcon}>🪙</ThemedText>
                    <ThemedText style={[
                      styles.price,
                      { color: coins >= item.cost ? primaryColor : errorColor }
                    ]}>
                      {item.cost.toLocaleString()}
                    </ThemedText>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.buyButton,
                      {
                        backgroundColor: item.purchased ? primaryColor : 
                                       coins >= item.cost ? primaryColor : borderColor,
                        opacity: item.purchased ? 0.7 : 1,
                      }
                    ]}
                    onPress={() => handlePurchase(item.id)}
                    disabled={item.purchased}
                  >
                    <ThemedText style={[styles.buyButtonText, { color: 'white' }]}>
                      {item.purchased ? t.purchased : t.buy}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: primaryColor }]}
              onPress={onClose}
            >
              <ThemedText style={[styles.closeButtonText, { color: primaryColor }]}>
                {t.close}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '95%',
    maxWidth: 450,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: 12,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIcon: {
    fontSize: 20,
  },
  coinsText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    maxHeight: 60,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});