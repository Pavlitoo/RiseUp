import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslations } from '@/hooks/use-translations';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export function AboutScreen() {
  const t = useTranslations();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqData = [
    {
      id: '1',
      question: 'Як працює система бонусів?',
      answer: 'Бонуси - це винагороди за виконання звичок та досягнення цілей. Ви отримуєте монети, досвід та спеціальні ефекти для персонажа. Монети можна використовувати для покращення персонажа та розблокування нових функцій.'
    },
    {
      id: '2',
      question: 'Що таке серія (streak)?',
      answer: 'Серія - це кількість днів поспіль, протягом яких ви виконували певну звичку. Чим довша серія, тим більше бонусів ви отримуєте!'
    },
    {
      id: '3',
      question: 'Як підвищити рівень персонажа?',
      answer: 'Персонаж підвищує рівень автоматично, коли ви набираєте достатньо досвіду. Досвід отримується за виконання звичок, досягнення та бонуси.'
    },
    {
      id: '4',
      question: 'Що робити, якщо пропустив день?',
      answer: 'Нічого страшного! Просто продовжуйте виконувати звички. Серія почнеться заново, але весь попередній прогрес залишається.'
    },
    {
      id: '5',
      question: 'Як змінити мову додатку?',
      answer: 'Перейдіть у розділ "Профіль" → "Налаштування" → "Мова" та оберіть потрібну мову.'
    },
    {
      id: '6',
      question: 'Чи зберігаються мої дані?',
      answer: 'Так, всі ваші дані зберігаються локально на пристрої. Ми не передаємо ваші персональні дані третім особам.'
    }
  ];

  const features = [
    { icon: '🎯', title: 'Відстеження звичок', description: 'Легко відстежуйте свої щоденні звички' },
    { icon: '🎮', title: 'Геймифікація', description: 'Розвивайте віртуального персонажа' },
    { icon: '📊', title: 'Статистика', description: 'Детальна аналітика вашого прогресу' },
    { icon: '🏆', title: 'Досягнення', description: 'Розблоковуйте нагороди за успіхи' },
    { icon: '🎁', title: 'Бонуси', description: 'Отримуйте винагороди за активність' },
    { icon: '🌙', title: 'Темна тема', description: 'Комфортне використання вдень і вночі' }
  ];

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🌟 RiseUp
          </ThemedText>
          <ThemedText style={styles.version}>Версія 2.0.0</ThemedText>
          <ThemedText style={styles.subtitle}>
            Професійний додаток для формування корисних звичок
          </ThemedText>
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.delay(200).duration(800)}
          style={[styles.section, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ✨ Особливості
          </ThemedText>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.title}
                entering={FadeIn.delay(400 + index * 100).duration(600)}
                style={styles.featureCard}
              >
                <ThemedText style={styles.featureIcon}>{feature.icon}</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.featureTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={styles.featureDescription}>
                  {feature.description}
                </ThemedText>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.delay(400).duration(800)}
          style={[styles.section, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ❓ Часті запитання
          </ThemedText>
          {faqData.map((faq, index) => (
            <Animated.View
              key={faq.id}
              entering={FadeIn.delay(600 + index * 100).duration(600)}
            >
              <TouchableOpacity
                style={[styles.faqItem, { borderColor }]}
                onPress={() => toggleFaq(faq.id)}
              >
                <View style={styles.faqHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.faqQuestion}>
                    {faq.question}
                  </ThemedText>
                  <ThemedText style={[styles.faqToggle, { color: primaryColor }]}>
                    {expandedFaq === faq.id ? '−' : '+'}
                  </ThemedText>
                </View>
                {expandedFaq === faq.id && (
                  <Animated.View entering={FadeIn.duration(300)}>
                    <ThemedText style={styles.faqAnswer}>
                      {faq.answer}
                    </ThemedText>
                  </Animated.View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.delay(600).duration(800)}
          style={[styles.section, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💰 Система бонусів
          </ThemedText>
          <View style={styles.bonusInfo}>
            <View style={styles.bonusItem}>
              <ThemedText style={styles.bonusIcon}>🪙</ThemedText>
              <View style={styles.bonusDetails}>
                <ThemedText type="defaultSemiBold">Монети</ThemedText>
                <ThemedText style={styles.bonusDescription}>
                  Заробляйте монети за виконання звичок та досягнення. 
                  Використовуйте їх для покращення персонажа!
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.bonusItem}>
              <ThemedText style={styles.bonusIcon}>⭐</ThemedText>
              <View style={styles.bonusDetails}>
                <ThemedText type="defaultSemiBold">Досвід</ThemedText>
                <ThemedText style={styles.bonusDescription}>
                  Набирайте досвід для підвищення рівня персонажа та 
                  розблокування нових можливостей.
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.bonusItem}>
              <ThemedText style={styles.bonusIcon}>✨</ThemedText>
              <View style={styles.bonusDetails}>
                <ThemedText type="defaultSemiBold">Спеціальні ефекти</ThemedText>
                <ThemedText style={styles.bonusDescription}>
                  Розблоковуйте унікальні візуальні ефекти для персонажа 
                  за особливі досягнення.
                </ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View 
          entering={SlideInDown.delay(800).duration(800)}
          style={[styles.section, { backgroundColor: cardBackground, borderColor }]}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📞 Контакти
          </ThemedText>
          <View style={styles.contactInfo}>
            <ThemedText style={styles.contactText}>
              📧 Email: support@riseup.app
            </ThemedText>
            <ThemedText style={styles.contactText}>
              🌐 Веб-сайт: www.riseup.app
            </ThemedText>
            <ThemedText style={styles.contactText}>
              📱 Версія: 2.0.0
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeIn.delay(1000).duration(600)}
          style={styles.footer}
        >
          <ThemedText style={styles.footerText}>
            Зроблено з ❤️ для кращого майбутнього
          </ThemedText>
          <ThemedText style={styles.copyright}>
            © 2024 RiseUp. Всі права захищені.
          </ThemedText>
        </Animated.View>
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
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 22,
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
    marginBottom: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
  },
  faqToggle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  faqAnswer: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  bonusInfo: {
    gap: 16,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bonusIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  bonusDetails: {
    flex: 1,
  },
  bonusDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 18,
    marginTop: 4,
  },
  contactInfo: {
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
});