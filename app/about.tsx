import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AboutScreen = () => {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image
          source={require('@/assets/images/logo.webp')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Empowering Financial Freedom</Text>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          At 1000Banks, we believe in democratizing financial knowledge and opportunities. 
          Our mission is to empower individuals and entrepreneurs with the tools, education, 
          and community support needed to achieve financial independence and build lasting wealth.
        </Text>
      </View>

      {/* Vision Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Vision</Text>
        <Text style={styles.sectionText}>
          We envision a world where everyone has access to financial education and the opportunity 
          to create multiple streams of income. Through our comprehensive programs and supportive 
          community, we're building a network of financially empowered individuals who can create 
          their own banks and control their financial destinies.
        </Text>
      </View>

      {/* Values Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Values</Text>
        <View style={styles.valuesList}>
          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="people" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Community First</Text>
              <Text style={styles.valueText}>
                Building a supportive network where members help each other succeed
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="school" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Education</Text>
              <Text style={styles.valueText}>
                Providing practical financial knowledge that creates real results
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="shield-checkmark" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Integrity</Text>
              <Text style={styles.valueText}>
                Operating with transparency and honesty in all our dealings
              </Text>
            </View>
          </View>

          <View style={styles.valueItem}>
            <View style={styles.valueIcon}>
              <Ionicons name="trending-up" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={styles.valueTitle}>Growth</Text>
              <Text style={styles.valueText}>
                Continuously evolving to provide better opportunities for our members
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Team Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Leadership</Text>
        <View style={styles.founderCard}>
          <View style={styles.founderAvatar}>
            <Ionicons name="person" size={40} color={AppColors.primary} />
          </View>
          <Text style={styles.founderName}>Devonne Stokes</Text>
          <Text style={styles.founderTitle}>Founder & CEO</Text>
          <Text style={styles.founderQuote}>
            "If opportunity doesn't come knocking, BUILD A DOOR."
          </Text>
          <Text style={styles.founderBio}>
            A visionary entrepreneur and financial freedom expert dedicated to helping 
            others break free from financial limitations and create their own opportunities.
          </Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Start Your Journey?</Text>
        <Text style={styles.ctaText}>
          Join thousands of entrepreneurs who are building their financial futures with 1000Banks
        </Text>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push('/auth')}
        >
          <Text style={styles.ctaButtonText}>Get Started Today</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.primary,
    textAlign: 'center',
  },
  section: {
    padding: 24,
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
    lineHeight: 24,
  },
  valuesList: {
    marginTop: 16,
  },
  valueItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  valueIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  valueContent: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  founderCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  founderAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  founderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  founderTitle: {
    fontSize: 16,
    color: AppColors.primary,
    marginBottom: 16,
  },
  founderQuote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  founderBio: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  ctaButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
});

export default AboutScreen;