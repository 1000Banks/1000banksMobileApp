import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is 1000Banks?',
    answer: '1000Banks is a comprehensive financial education and investment platform designed to help individuals achieve financial independence. We offer courses, coaching, investment programs, and community support to empower entrepreneurs and investors at all levels.'
  },
  {
    id: '2',
    category: 'General',
    question: 'How do I get started with 1000Banks?',
    answer: 'Getting started is easy! Create an account, browse our courses and services, and choose the program that best fits your financial goals. We recommend starting with our Financial Freedom Fundamentals course if you\'re new to investing and financial planning.'
  },
  {
    id: '3',
    category: 'Courses',
    question: 'Are the courses suitable for beginners?',
    answer: 'Yes! We offer courses for all skill levels, from complete beginners to advanced investors. Each course is clearly marked with its difficulty level (Beginner, Intermediate, Advanced) so you can choose the right starting point.'
  },
  {
    id: '4',
    category: 'Courses',
    question: 'Do I get lifetime access to courses?',
    answer: 'Yes, most of our courses include lifetime access to all materials, including any future updates. You can learn at your own pace and revisit content whenever you need a refresher.'
  },
  {
    id: '5',
    category: 'Courses',
    question: 'Can I get a refund if I\'m not satisfied?',
    answer: 'We offer a 30-day money-back guarantee on all our courses. If you\'re not completely satisfied with your purchase, contact our support team within 30 days for a full refund.'
  },
  {
    id: '6',
    category: 'Investment Programs',
    question: 'What is the 1000Streams Investment Program?',
    answer: 'The 1000Streams program is our flagship fully-managed investment opportunity. It\'s designed to generate reliable returns with complete transparency and zero interest charges. The program is suitable for both new and experienced investors.'
  },
  {
    id: '7',
    category: 'Investment Programs',
    question: 'What are the minimum investment requirements?',
    answer: 'Minimum investment requirements vary by program. The 1000Streams program has a minimum investment of $1,000. Contact our investment team for detailed information about specific programs and requirements.'
  },
  {
    id: '8',
    category: 'Investment Programs',
    question: 'How are returns distributed?',
    answer: 'Returns are distributed according to each program\'s specific terms. Most programs offer monthly or quarterly distributions. All return schedules and payment methods are clearly outlined in your investment agreement.'
  },
  {
    id: '9',
    category: 'Trading',
    question: 'Do you provide trading signals?',
    answer: 'Yes! Our Trading Mastery Program includes daily trade signals and our copy-and-paste trade system. You\'ll receive real-time alerts and can follow our proven strategies across stocks, forex, and cryptocurrency markets.'
  },
  {
    id: '10',
    category: 'Trading',
    question: 'What markets do you cover in your trading education?',
    answer: 'We cover stocks, forex (foreign exchange), cryptocurrency, options, and futures trading. Our comprehensive curriculum includes technical analysis, fundamental analysis, risk management, and psychology for all these markets.'
  },
  {
    id: '11',
    category: 'Coaching',
    question: 'What does the coaching program include?',
    answer: 'Our coaching programs include one-on-one mentorship, group coaching sessions, personalized financial planning, business development guidance, and ongoing support. The specific inclusions vary by coaching package.'
  },
  {
    id: '12',
    category: 'Coaching',
    question: 'How long are the coaching programs?',
    answer: 'Coaching program durations vary from 6 weeks to 16 weeks, depending on the specific program. Our "Become Your Own Bank" program is our most comprehensive at 16 weeks, while our Entrepreneurship Accelerator is 6 weeks.'
  },
  {
    id: '13',
    category: 'Community',
    question: 'Is there a community aspect to 1000Banks?',
    answer: 'Absolutely! We have an active #1000Banks community where members share insights, ask questions, participate in live trading calls, and support each other\'s financial journeys. Community access is included with most programs.'
  },
  {
    id: '14',
    category: 'Community',
    question: 'How do I access the community features?',
    answer: 'Community access is automatically granted when you enroll in eligible courses or programs. You\'ll receive login credentials and instructions via email after your purchase is confirmed.'
  },
  {
    id: '15',
    category: 'Technical',
    question: 'What devices can I use to access the content?',
    answer: 'Our platform is accessible on all devices including smartphones, tablets, laptops, and desktop computers. Our mobile app provides full access to courses, community features, and trading tools.'
  },
  {
    id: '16',
    category: 'Technical',
    question: 'Do I need any special software or tools?',
    answer: 'Most of our content can be accessed through any web browser. For advanced trading features, we may recommend specific trading platforms or tools, but these are optional and clearly outlined in the course materials.'
  },
  {
    id: '17',
    category: 'Support',
    question: 'How can I get help if I have questions?',
    answer: 'We offer multiple support channels: email support (info@1000banks.com), phone support (1-800-1000-BANK), live chat during business hours, and community forums. Most courses also include live Q&A sessions with instructors.'
  },
  {
    id: '18',
    category: 'Support',
    question: 'What are your business hours?',
    answer: 'Our support team is available Monday-Friday 9:00 AM - 6:00 PM EST, and Saturday 10:00 AM - 4:00 PM EST. We\'re closed on Sundays. Email support is available 24/7 with responses within 24 hours.'
  },
];

const categories = ['All', 'General', 'Courses', 'Investment Programs', 'Trading', 'Coaching', 'Community', 'Technical', 'Support'];

const FAQScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const animatedValues = faqData.reduce((acc, item) => {
    acc[item.id] = new Animated.Value(0);
    return acc;
  }, {} as Record<string, Animated.Value>);

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpanded = (itemId: string) => {
    const newExpandedItems = new Set(expandedItems);
    const isExpanding = !expandedItems.has(itemId);
    
    if (isExpanding) {
      newExpandedItems.add(itemId);
      Animated.timing(animatedValues[itemId], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      newExpandedItems.delete(itemId);
      Animated.timing(animatedValues[itemId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    
    setExpandedItems(newExpandedItems);
  };

  const FAQItemComponent = ({ item }: { item: FAQItem }) => {
    const isExpanded = expandedItems.has(item.id);
    const animatedHeight = animatedValues[item.id].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    });

    const rotateIcon = animatedValues[item.id].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.8}
        >
          <View style={styles.questionContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            <Text style={styles.question}>{item.question}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Ionicons
              name="chevron-down"
              size={24}
              color={AppColors.text.secondary}
            />
          </Animated.View>
        </TouchableOpacity>
        <Animated.View style={[styles.answerContainer, { height: animatedHeight }]}>
          <Text style={styles.answer}>{item.answer}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FAQ</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>
            Find answers to common questions about our services, courses, and programs
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={AppColors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              placeholderTextColor={AppColors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={AppColors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FAQ Items */}
        <View style={styles.faqContainer}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => (
              <FAQItemComponent key={item.id} item={item} />
            ))
          ) : (
            <View style={styles.noResults}>
              <Ionicons name="search" size={48} color={AppColors.text.secondary} />
              <Text style={styles.noResultsText}>No FAQs found</Text>
              <Text style={styles.noResultsSubtext}>
                Try adjusting your search or category filter
              </Text>
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactText}>
            Can't find what you're looking for? Our support team is here to help.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push('/contact')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 16,
    color: AppColors.text.primary,
    marginLeft: 12,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: AppColors.background.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: AppColors.primary + '20',
    borderColor: AppColors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  faqContainer: {
    paddingHorizontal: 20,
  },
  faqItem: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  questionContainer: {
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: AppColors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    lineHeight: 22,
  },
  answerContainer: {
    overflow: 'hidden',
  },
  answer: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  contactSection: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  contactButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
});

export default FAQScreen;