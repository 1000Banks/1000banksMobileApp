import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

const ContactScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Message Sent!',
      'Thank you for contacting us. We\'ll get back to you within 24 hours.',
      [
        {
          text: 'OK',
          onPress: () => {
            setFormData({ name: '', email: '', subject: '', message: '' });
          }
        }
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="Contact Us" />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Get In Touch</Text>
          <Text style={styles.heroSubtitle}>
            Have questions about our services or need assistance? We're here to help you on your financial journey.
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.contactMethods}>
          <TouchableOpacity 
            style={styles.contactMethod}
            onPress={() => openLink('mailto:info@1000banks.com')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactDetail}>info@1000banks.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactMethod}
            onPress={() => openLink('tel:+1-800-1000-BANK')}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Phone</Text>
              <Text style={styles.contactDetail}>1-800-1000-BANK</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.contactMethod}>
            <View style={styles.contactIcon}>
              <Ionicons name="location" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Address</Text>
              <Text style={styles.contactDetail}>
                1000 Financial Freedom Blvd{'\n'}
                Suite 100{'\n'}
                Atlanta, GA 30309
              </Text>
            </View>
          </View>

          <View style={styles.contactMethod}>
            <View style={styles.contactIcon}>
              <Ionicons name="time" size={24} color={AppColors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Business Hours</Text>
              <Text style={styles.contactDetail}>
                Monday - Friday: 9:00 AM - 6:00 PM EST{'\n'}
                Saturday: 10:00 AM - 4:00 PM EST{'\n'}
                Sunday: Closed
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send Us a Message</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={AppColors.text.secondary}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={AppColors.text.secondary}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Subject"
            placeholderTextColor={AppColors.text.secondary}
            value={formData.subject}
            onChangeText={(value) => handleInputChange('subject', value)}
          />

          <TextInput
            style={[styles.input, styles.messageInput]}
            placeholder="Your Message"
            placeholderTextColor={AppColors.text.secondary}
            value={formData.message}
            onChangeText={(value) => handleInputChange('message', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://twitter.com/1000banks')}
            >
              <Ionicons name="logo-twitter" size={24} color={AppColors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://facebook.com/1000banks')}
            >
              <Ionicons name="logo-facebook" size={24} color={AppColors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://instagram.com/1000banks')}
            >
              <Ionicons name="logo-instagram" size={24} color={AppColors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://linkedin.com/company/1000banks')}
            >
              <Ionicons name="logo-linkedin" size={24} color={AppColors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => openLink('https://youtube.com/1000banks')}
            >
              <Ionicons name="logo-youtube" size={24} color={AppColors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksTitle}>Need Help With Something Specific?</Text>
          <TouchableOpacity 
            style={styles.quickLinkButton}
            onPress={() => router.push('/faq')}
          >
            <Ionicons name="help-circle" size={20} color={AppColors.primary} />
            <Text style={styles.quickLinkText}>View FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickLinkButton}
            onPress={() => router.push('/courses')}
          >
            <Ionicons name="school" size={20} color={AppColors.primary} />
            <Text style={styles.quickLinkText}>Browse Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickLinkButton}
            onPress={() => router.push('/services')}
          >
            <Ionicons name="briefcase" size={20} color={AppColors.primary} />
            <Text style={styles.quickLinkText}>Our Services</Text>
          </TouchableOpacity>
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
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  contactMethods: {
    padding: 20,
  },
  contactMethod: {
    flexDirection: 'row',
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
  },
  formSection: {
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: AppColors.text.primary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  socialSection: {
    padding: 20,
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinks: {
    padding: 20,
    marginBottom: 32,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  quickLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickLinkText: {
    fontSize: 16,
    color: AppColors.text.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default ContactScreen;