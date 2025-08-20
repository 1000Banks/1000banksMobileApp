import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

interface SupportOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
}

const HelpSupport = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'How do I enroll in a course?',
      answer: 'To enroll in a course, navigate to the course detail page and click the "Enroll Now" button. You\'ll need to complete the payment process if it\'s a paid course.',
      expanded: false,
    },
    {
      id: '2',
      question: 'Can I download courses for offline viewing?',
      answer: 'Yes, you can download enrolled courses for offline viewing. Look for the download icon on the course player to save content to your device.',
      expanded: false,
    },
    {
      id: '3',
      question: 'How do I get a refund?',
      answer: 'We offer a 30-day money-back guarantee on all courses. If you\'re not satisfied, contact our support team within 30 days of purchase for a full refund.',
      expanded: false,
    },
    {
      id: '4',
      question: 'How do I reset my password?',
      answer: 'You can reset your password from the sign-in screen by clicking "Forgot Password". We\'ll send you an email with instructions to create a new password.',
      expanded: false,
    },
    {
      id: '5',
      question: 'Can I share my account with others?',
      answer: 'No, account sharing is not allowed. Each account is for individual use only. Sharing accounts may result in suspension of access.',
      expanded: false,
    },
    {
      id: '6',
      question: 'How do I update my payment information?',
      answer: 'You can update your payment information in the Account section under "Payment Methods". Add new cards or remove old ones securely.',
      expanded: false,
    },
  ]);

  const supportOptions: SupportOption[] = [
    {
      id: 'email',
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: 'mail',
      action: () => {
        Linking.openURL('mailto:support@1000banks.com?subject=Support Request');
      },
    },
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubbles',
      action: () => {
        Alert.alert('Live Chat', 'Live chat feature coming soon!');
      },
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Call us Monday-Friday 9AM-5PM EST',
      icon: 'call',
      action: () => {
        Linking.openURL('tel:+1234567890');
      },
    },
    {
      id: 'community',
      title: 'Community Forum',
      description: 'Get help from other users',
      icon: 'people',
      action: () => {
        Alert.alert('Community Forum', 'Community forum coming soon!');
      },
    },
  ];

  const toggleFAQ = (id: string) => {
    setFaqs(prevFaqs =>
      prevFaqs.map(faq =>
        faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
      )
    );
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How can we help you?</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={AppColors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor={AppColors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.supportSection}>
          <Text style={styles.subsectionTitle}>Contact Support</Text>
          <View style={styles.supportGrid}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.supportCard}
                onPress={option.action}
              >
                <View style={styles.supportCardInner}>
                  <View style={styles.supportIcon}>
                    <Ionicons name={option.icon} size={28} color={AppColors.primary} />
                  </View>
                  <Text style={styles.supportTitle}>{option.title}</Text>
                  <Text style={styles.supportDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.subsectionTitle}>Frequently Asked Questions</Text>
          {filteredFAQs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={faq.expanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={AppColors.text.secondary}
                />
              </View>
              {faq.expanded && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.helpfulSection}>
          <View style={styles.helpfulCard}>
            <Text style={styles.helpfulTitle}>Still need help?</Text>
            <Text style={styles.helpfulText}>
              Our support team is here to assist you. Don't hesitate to reach out!
            </Text>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Linking.openURL('mailto:support@1000banks.com')}
            >
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  supportSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  supportCard: {
    width: '50%',
    padding: 8,
  },
  supportCardInner: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  supportDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  faqSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  faqItem: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginTop: 12,
    lineHeight: 22,
  },
  helpfulSection: {
    padding: 24,
    marginBottom: 40,
  },
  helpfulCard: {
    backgroundColor: AppColors.primary + '10',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AppColors.primary + '30',
  },
  helpfulTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  helpfulText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.background.dark,
  },
});

export default HelpSupport;