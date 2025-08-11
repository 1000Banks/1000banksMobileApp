import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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

      {/* About Content with Image */}
      <View style={styles.section}>
        <Text style={styles.sectionText}>
          Are you an entrepreneur who feels discouraged by financial obstacles? 1000Banks offers a program to help you grow your financial literacy, develop a plan to drop out of the corporate world, and master your everyday life through effective planning and budgeting. We believe in second chances and offer "Another Chance" to those who have faced setbacks but are ready to take control of their finances and future. Join us and invest in your success today.
        </Text>
        <Image
          source={require('@/assets/images/about-us-1.webp')}
          style={styles.contentImage}
          resizeMode="cover"
        />
      </View>

      {/* Philosophy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Philosophy</Text>
        <Text style={styles.sectionText}>
          At our brand, we firmly believe that when you have a positive vision, God will provide the resources to bring it to fruition. Our founder's philosophy is to focus on your goals and avoid distractions, and that's what we embody in our brand's culture. We strive to spread positivity through our clothing and encourage our customers to wear their affirmations with pride.
        </Text>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.sectionText}>
          Our brand is founded on the belief that divine providence supports vision and not distraction. Our mission is to spread positivity and empower our customers to wear their affirmations with pride. We aim to inspire and encourage individuals to be their own biggest cheerleaders with our merchandise, which is designed to promote good vibes and confidence. We are committed to creating a range of affirmation tees that reflect our values and help our customers elevate their mindset and wardrobe.
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
        <Text style={styles.sectionTitle}>Our Expert Team</Text>
        <Text style={styles.teamIntro}>
          Meet the passionate minds behind 1000Banks — a team committed to transforming opportunities into success.
        </Text>
        <Text style={styles.teamSubtitle}>
          Behind every successful outcome is a dedicated team. At 1000Banks, our professionals bring together experience, innovation, and a passion for helping individuals and businesses achieve their financial goals. We don't just offer services — we provide strategic partnerships built on trust and results.
        </Text>
        
        {/* Team Grid */}
        <View style={styles.teamGrid}>
          {/* CEO */}
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={require('@/assets/images/devonne-stoke.png')}
                style={styles.memberAvatarImage}
                resizeMode="cover" />
            </View>
            <Text style={styles.memberName}>Devonne Stokes</Text>
            <Text style={styles.memberTitle}>CEO | FOUNDER</Text>
            <Text style={styles.memberWebsite}>www.devonnestokes.com</Text>
          </View>

          {/* CFO */}
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={require('@/assets/images/ER-RHONDA.png')}
                style={styles.memberAvatarImage}
                resizeMode="cover" />
            </View>
            <Text style={styles.memberName}>Rhonda Mcwilliams</Text>
            <Text style={styles.memberTitle}>CFO</Text>
          </View>

          {/* COO */}
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={require('@/assets/images/Monique.png')}
                style={styles.memberAvatarImage}
                resizeMode="cover" />
            </View>
            <Text style={styles.memberName}>Monique Bailey</Text>
            <Text style={styles.memberTitle}>COO | PRESIDENT</Text>
            <Text style={styles.memberWebsite}>www.moniquebailey.com</Text>
          </View>

          {/* CCO */}
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={require('@/assets/images/SAM.png')}
                style={styles.memberAvatarImage}
                resizeMode="cover" />
            </View>
            <Text style={styles.memberName}>Samuel Bailey</Text>
            <Text style={styles.memberTitle}>CCO | SENIOR VICE PRESIDENT</Text>
          </View>

          {/* CINO */}
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={require('@/assets/images/WAYNE.png')}
                style={styles.memberAvatarImage}
                resizeMode="cover" />
            </View>
            <Text style={styles.memberName}>Wayne Waldrow</Text>
            <Text style={styles.memberTitle}>CINO | EXECUTIVE VP OF OPERATIONS</Text>
          </View>

          {/* CHRO */}
          <View style={styles.teamMember}>
            <View style={styles.memberAvatar}>
              <Image
                source={require('@/assets/images/Monique.png')}
                style={styles.memberAvatarImage}
                resizeMode="cover" />
            </View>
            <Text style={styles.memberName}>Mary Escoto</Text>
            <Text style={styles.memberTitle}>CHIEF HUMAN RESOURCE OFFICER</Text>
          </View>
        </View>
        
        <Text style={styles.teamCallout}>
          Inspired by our mission? There's a place here for you.
        </Text>
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
    overflow: 'hidden',
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  founderAvatarImage: {
  width: '110%',  // slightly larger than container
  height: '110%',
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
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginTop: 24,
  },
  teamIntro: {
    fontSize: 18,
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  teamSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  teamMember: {
    width: (width - 72) / 2,
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  memberAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: AppColors.primary + '20',
    marginBottom: 12,
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberTitle: {
    fontSize: 12,
    color: AppColors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  memberWebsite: {
    fontSize: 11,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  teamCallout: {
    fontSize: 18,
    color: AppColors.primary,
    textAlign: 'center',
    marginTop: 32,
    fontWeight: '600',
    fontStyle: 'italic',
  },
});

export default AboutScreen;