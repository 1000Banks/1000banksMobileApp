import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

const { width } = Dimensions.get('window');

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const services: ServiceItem[] = [
  {
    id: '1',
    title: '1000 Streams',
    subtitle: 'Secure. Transparent. Profitable.',
    description:
      'Welcome to the 1000Streams Investment Program, a fully managed, zero-interest opportunity designed to generate reliable returns with complete transparency. Whether you\'re just starting out or an experienced investor, this program empowers you to grow your capital with confidence and clarity.',
    icon: 'trending-up',
  },
  {
    id: '2',
    title: 'Coaching',
    subtitle: 'Become Your Own Bank',
    description:
      'We specialize in coaching entrepreneurs on how to become your own bank in less than 1000Minutes! Our coaching program is designed to empower participants with clarity, structure, and momentum in your personal and entrepreneurial journeys. Our curriculum progresses strategically from vision development to business execution and scaling, with consistent checkpoints and support.',
    icon: 'school',
  },
  {
    id: '3',
    title: 'Insurance',
    subtitle: 'Comprehensive Financial Solutions',
    description:
      'GFI offers a comprehensive range of financial solutions tailored to meet the diverse needs of individuals, families, and businesses. We believe in an approach to financial well-being that encompasses wealth creation, protection, and transfer. Our solutions are designed to empower you to achieve your financial goals, secure your legacy, and make a meaningful impact on your family, community, and beyond.',
    icon: 'shield-checkmark',
  },
  {
    id: '4',
    title: '#1000Banks Community',
    subtitle: 'Master Financial Markets',
    description:
      '#1000Banks Offers a dynamic gateway into the world of financial markets. Gain expertise through our Trading Academy, where you\'ll explore comprehensive courses covering stocks, foreign exchange (FRX), futures, and investing. Whether you\'re a beginner or looking to sharpen your skills, our curriculum is designed to empower you with the knowledge and strategies needed for successful trading across diverse assets.',
    icon: 'people',
  },
  {
    id: '5',
    title: '#1000Banks Career Opportunities',
    subtitle: 'Find Your Dream Job',
    description:
      'Hiring opportunities, job trainings and more. Find your dream job with our help. We offer hiring opportunities, job trainings and more to help you advance your career.',
    icon: 'briefcase',
  },
];

const ServicesScreen = () => {
  const router = useRouter();
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const animatedValues = services.reduce((acc, service) => {
    acc[service.id] = new Animated.Value(0);
    return acc;
  }, {} as Record<string, Animated.Value>);

  const toggleService = (serviceId: string) => {
    const isExpanding = expandedService !== serviceId;
    
    if (expandedService && expandedService !== serviceId) {
      Animated.timing(animatedValues[expandedService], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    if (isExpanding) {
      setExpandedService(serviceId);
      Animated.timing(animatedValues[serviceId], {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedValues[serviceId], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setExpandedService(null));
    }
  };

  const ServiceCard = ({ service }: { service: ServiceItem }) => {
    const animatedHeight = animatedValues[service.id].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 200],
    });

    const rotateIcon = animatedValues[service.id].interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Pressable
        onPress={() => toggleService(service.id)}
        style={({ pressed }) => [
          styles.serviceCard,
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <Ionicons name={service.icon} size={24} color={AppColors.primary} />
          </View>
          <View style={styles.serviceTitleContainer}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
            <Ionicons
              name="chevron-down"
              size={24}
              color={AppColors.text.secondary}
            />
          </Animated.View>
        </View>
        <Animated.View style={[styles.serviceContent, { height: animatedHeight }]}>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Services" />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <Text style={styles.mainTitle}>Empower Your Financial Future</Text>
        <Text style={styles.quote}>
          "Most people are afraid of their future because they don't plan in the present."
        </Text>
        <Text style={styles.author}>-Devonne Strokes</Text>
      </View>

      <View style={styles.cardsSection}>
        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <Ionicons name="briefcase" size={40} color={AppColors.primary} />
            <Text style={styles.cardTitle}>Career Opportunity</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <Ionicons name="calculator" size={40} color={AppColors.primary} />
            <Text style={styles.cardTitle}>Financial Planning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
            <Ionicons name="people" size={40} color={AppColors.primary} />
            <Text style={styles.cardTitle}>Community</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.academySection}>
        <Text style={styles.sectionTitle}>Join Our Academy</Text>
        <Text style={styles.sectionText}>
          Our brand is founded on the belief that divine providence supports vision and not distraction. Our mission is to spread positivity and empower our customers to wear their affirmations with pride.
        </Text>
        <Text style={styles.sectionText}>
          We aim to inspire and encourage individuals to be their own biggest cheerleaders with our merchandise, which is designed to promote good vibes and confidence. We are committed to creating a range of affirmation tees that reflect our values and help our customers elevate their mindset and wardrobe.
        </Text>
        <Image
          source={require('@/assets/images/services-image-1.webp')}
          style={styles.academyImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => router.push('/contact')}
          activeOpacity={0.8}
        >
          <Text style={styles.joinButtonText}>JOIN US</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.breakthroughSection}>
        <Image
          source={require('@/assets/images/logo.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.breakthroughTitle}>FINANCIAL BREAKTHROUGHS</Text>
        <Text style={styles.breakthroughText}>
          Our program empowers entrepreneurs to invest, plan, and budget effectively
          while developing corporate dropout plans.
        </Text>
      </View>

      <View style={styles.servicesSection}>
        <Text style={styles.servicesTitle}>Our Services</Text>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </View>

      <View style={styles.tradingSection}>
        <View style={styles.tradingContent}>
          <Text style={styles.tradingTitle}>
            LEARN HOW TO TRADE AND INVEST{'\n'}IN YOUR BIGGER VISION
          </Text>
          <Text style={styles.tradingSubtitle}>
            Building sustainable wealth on your Thursday weekly calls.
          </Text>
          <View style={styles.tradingTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Trades</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Stocks</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Crypto</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.planningSection}>
        <Text style={styles.planningTitle}>
          Planning is bringing the future into the present
        </Text>
        <Text style={styles.planningText}>
          Planning helps bring clarity and understanding to vision. Take action now.
        </Text>
      </View>
      </ScrollView>
      <BottomTabs />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.dark,
  },
  scrollContent: {
    flex: 1,
  },
  headerSection: {
    padding: 32,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  quote: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
  cardsSection: {
    padding: 24,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: (width - 72) / 3,
    borderWidth: 1,
    borderColor: AppColors.primary + '20',
  },
  cardTitle: {
    color: AppColors.text.primary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  academySection: {
    padding: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  sectionText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  academyImage: {
    width: width - 48,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  joinButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
  },
  joinButtonText: {
    color: AppColors.background.dark,
    fontSize: 18,
    fontWeight: 'bold',
  },
  breakthroughSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    marginTop: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  breakthroughTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 16,
  },
  breakthroughText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  servicesSection: {
    padding: 24,
  },
  servicesTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 24,
  },
  serviceCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AppColors.primary + '20',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceTitleContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  serviceContent: {
    overflow: 'hidden',
  },
  serviceDescription: {
    fontSize: 14,
    color: AppColors.text.secondary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    lineHeight: 20,
  },
  tradingSection: {
    padding: 24,
  },
  tradingContent: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
  },
  tradingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  tradingSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tradingTags: {
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    backgroundColor: AppColors.primary + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  tagText: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  planningSection: {
    padding: 32,
    marginBottom: 32,
  },
  planningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  planningText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
});

export default ServicesScreen;