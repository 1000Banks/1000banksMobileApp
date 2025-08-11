import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '@/components/AppHeader';
import BottomTabs from '@/components/BottomTabs';

interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted: string;
}

const jobListings: JobListing[] = [
  {
    id: '1',
    title: 'Senior Financial Coach',
    department: 'Education',
    location: 'Atlanta, GA / Remote',
    type: 'Full-time',
    experience: '5+ years',
    salary: '$80,000 - $120,000',
    description: 'We\'re seeking an experienced financial coach to guide our clients through their wealth-building journey. You\'ll conduct one-on-one coaching sessions, develop educational content, and help implement our proven financial strategies.',
    requirements: [
      'Bachelor\'s degree in Finance, Economics, or related field',
      '5+ years of financial coaching or advisory experience',
      'Excellent communication and presentation skills',
      'Experience with investment strategies and wealth building',
      'Passion for helping others achieve financial freedom'
    ],
    benefits: [
      'Competitive salary with performance bonuses',
      'Comprehensive health insurance',
      '401(k) with company matching',
      'Professional development opportunities',
      'Flexible work arrangements'
    ],
    posted: '2 days ago'
  },
  {
    id: '2',
    title: 'Trading Education Specialist',
    department: 'Education',
    location: 'Remote',
    type: 'Full-time',
    experience: '3-5 years',
    salary: '$70,000 - $90,000',
    description: 'Join our trading education team to develop curriculum and provide instruction on stocks, forex, and cryptocurrency trading. You\'ll create educational content and conduct live trading sessions.',
    requirements: [
      'Proven track record in trading (stocks, forex, crypto)',
      'Experience in financial education or training',
      'Strong analytical and technical analysis skills',
      'Ability to explain complex concepts simply',
      'Series 7 or equivalent certifications preferred'
    ],
    benefits: [
      'Base salary plus trading profit sharing',
      'Health, dental, and vision insurance',
      'Professional trading tools and resources',
      'Continuing education support',
      'Performance-based bonuses'
    ],
    posted: '1 week ago'
  },
  {
    id: '3',
    title: 'Digital Marketing Manager',
    department: 'Marketing',
    location: 'Atlanta, GA / Hybrid',
    type: 'Full-time',
    experience: '4+ years',
    salary: '$65,000 - $85,000',
    description: 'Lead our digital marketing efforts to grow the 1000Banks community. You\'ll manage social media campaigns, content marketing, email marketing, and digital advertising to attract and engage our target audience.',
    requirements: [
      'Bachelor\'s degree in Marketing, Communications, or related field',
      '4+ years of digital marketing experience',
      'Expertise in social media marketing and content creation',
      'Experience with email marketing platforms',
      'Knowledge of SEO and digital advertising'
    ],
    benefits: [
      'Competitive salary with quarterly bonuses',
      'Health and wellness benefits',
      'Creative freedom and autonomy',
      'Marketing budget for campaigns',
      'Team collaboration opportunities'
    ],
    posted: '3 days ago'
  },
  {
    id: '4',
    title: 'Customer Success Representative',
    department: 'Customer Support',
    location: 'Atlanta, GA / Remote',
    type: 'Full-time',
    experience: '2+ years',
    salary: '$45,000 - $60,000',
    description: 'Provide exceptional support to our community members. You\'ll help with course enrollment, answer questions about our programs, and ensure our clients have the best possible experience.',
    requirements: [
      'High school diploma or equivalent',
      '2+ years in customer service or support',
      'Excellent verbal and written communication',
      'Problem-solving mindset',
      'Interest in financial education'
    ],
    benefits: [
      'Competitive hourly wage',
      'Health insurance coverage',
      'Paid time off and holidays',
      'Career advancement opportunities',
      'Training and development programs'
    ],
    posted: '5 days ago'
  },
  {
    id: '5',
    title: 'Investment Analyst',
    department: 'Investment Management',
    location: 'Atlanta, GA',
    type: 'Full-time',
    experience: '3-7 years',
    salary: '$75,000 - $95,000',
    description: 'Support our investment programs by conducting market research, analyzing investment opportunities, and helping manage our portfolio strategies. You\'ll work closely with our investment team to identify profitable opportunities.',
    requirements: [
      'Bachelor\'s degree in Finance, Economics, or related field',
      'CFA certification preferred',
      '3+ years of investment analysis experience',
      'Strong financial modeling skills',
      'Knowledge of various asset classes'
    ],
    benefits: [
      'Competitive base salary',
      'Performance-based incentives',
      'Professional development support',
      'Health and retirement benefits',
      'Investment learning opportunities'
    ],
    posted: '1 week ago'
  },
  {
    id: '6',
    title: 'Mobile App Developer',
    department: 'Technology',
    location: 'Remote',
    type: 'Contract to Full-time',
    experience: '3+ years',
    salary: '$80,000 - $110,000',
    description: 'Help us enhance our mobile application to provide the best user experience for our community. You\'ll work on both iOS and Android platforms, implementing new features and optimizing performance.',
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '3+ years of mobile app development experience',
      'Proficiency in React Native or native development',
      'Experience with API integration',
      'Knowledge of app store deployment processes'
    ],
    benefits: [
      'Competitive salary',
      'Flexible working hours',
      'Latest development tools and equipment',
      'Technical growth opportunities',
      'Stock options available'
    ],
    posted: '4 days ago'
  }
];

const departments = ['All', 'Education', 'Marketing', 'Customer Support', 'Investment Management', 'Technology'];

const HiringScreen = () => {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const filteredJobs = jobListings.filter(job => 
    selectedDepartment === 'All' || job.department === selectedDepartment
  );

  const handleApply = (jobTitle: string) => {
    Alert.alert(
      'Apply for Position',
      `Thank you for your interest in the ${jobTitle} position! Please send your resume and cover letter to careers@1000banks.com`,
      [{ text: 'OK' }]
    );
  };

  const JobCard = ({ job }: { job: JobListing }) => {
    const isExpanded = expandedJob === job.id;

    return (
      <View style={styles.jobCard}>
        <TouchableOpacity
          style={styles.jobHeader}
          onPress={() => setExpandedJob(isExpanded ? null : job.id)}
          activeOpacity={0.8}
        >
          <View style={styles.jobHeaderContent}>
            <View style={styles.jobTitleRow}>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <View style={styles.departmentBadge}>
                <Text style={styles.departmentText}>{job.department}</Text>
              </View>
            </View>
            <View style={styles.jobMetaRow}>
              <View style={styles.jobMeta}>
                <Ionicons name="location" size={16} color={AppColors.text.secondary} />
                <Text style={styles.jobMetaText}>{job.location}</Text>
              </View>
              <View style={styles.jobMeta}>
                <Ionicons name="time" size={16} color={AppColors.text.secondary} />
                <Text style={styles.jobMetaText}>{job.type}</Text>
              </View>
            </View>
            <View style={styles.jobMetaRow}>
              <View style={styles.jobMeta}>
                <Ionicons name="briefcase" size={16} color={AppColors.text.secondary} />
                <Text style={styles.jobMetaText}>{job.experience}</Text>
              </View>
              <View style={styles.jobMeta}>
                <Ionicons name="cash" size={16} color={AppColors.primary} />
                <Text style={[styles.jobMetaText, { color: AppColors.primary }]}>{job.salary}</Text>
              </View>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={AppColors.text.secondary}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.jobDetails}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{job.description}</Text>

            <Text style={styles.sectionTitle}>Requirements</Text>
            {job.requirements.map((req, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{req}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Benefits</Text>
            {job.benefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={AppColors.primary} />
                <Text style={styles.listText}>{benefit}</Text>
              </View>
            ))}

            <View style={styles.jobActions}>
              <Text style={styles.postedText}>Posted {job.posted}</Text>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => handleApply(job.title)}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppHeader title="We're Hiring" />
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Join Our Mission</Text>
          <Text style={styles.heroSubtitle}>
            Help us empower people to achieve financial freedom. Be part of a team that's transforming lives through financial education and opportunity.
          </Text>
        </View>

        {/* Company Culture */}
        <View style={styles.cultureSection}>
          <Text style={styles.cultureTitle}>Why Work With Us?</Text>
          <View style={styles.cultureGrid}>
            <View style={styles.cultureItem}>
              <View style={styles.cultureIcon}>
                <Ionicons name="people" size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.cultureItemTitle}>Great Team</Text>
              <Text style={styles.cultureItemText}>Work with passionate, driven individuals who share your vision</Text>
            </View>
            <View style={styles.cultureItem}>
              <View style={styles.cultureIcon}>
                <Ionicons name="trending-up" size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.cultureItemTitle}>Growth Focused</Text>
              <Text style={styles.cultureItemText}>Continuous learning and career development opportunities</Text>
            </View>
            <View style={styles.cultureItem}>
              <View style={styles.cultureIcon}>
                <Ionicons name="heart" size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.cultureItemTitle}>Make Impact</Text>
              <Text style={styles.cultureItemText}>Help transform lives through financial education</Text>
            </View>
            <View style={styles.cultureItem}>
              <View style={styles.cultureIcon}>
                <Ionicons name="home" size={32} color={AppColors.primary} />
              </View>
              <Text style={styles.cultureItemTitle}>Flexibility</Text>
              <Text style={styles.cultureItemText}>Remote work options and flexible schedules</Text>
            </View>
          </View>
        </View>

        {/* Department Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.departmentsContainer}
          contentContainerStyle={styles.departmentsContent}
        >
          {departments.map((dept) => (
            <TouchableOpacity
              key={dept}
              style={[
                styles.departmentButton,
                selectedDepartment === dept && styles.departmentButtonActive
              ]}
              onPress={() => setSelectedDepartment(dept)}
            >
              <Text style={[
                styles.departmentButtonText,
                selectedDepartment === dept && styles.departmentButtonTextActive
              ]}>
                {dept}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Job Listings */}
        <View style={styles.jobsContainer}>
          <Text style={styles.jobsTitle}>
            Open Positions ({filteredJobs.length})
          </Text>
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </View>

        {/* Application Info */}
        <View style={styles.applicationInfo}>
          <Text style={styles.applicationTitle}>Ready to Apply?</Text>
          <Text style={styles.applicationText}>
            Send your resume and cover letter to careers@1000banks.com or apply directly to any position above.
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => router.push('/contact')}
          >
            <Text style={styles.contactButtonText}>Contact HR</Text>
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
  },
  heroSubtitle: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  cultureSection: {
    padding: 20,
  },
  cultureTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  cultureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cultureItem: {
    width: '48%',
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  cultureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AppColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cultureItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  cultureItemText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  departmentsContainer: {
    marginBottom: 20,
  },
  departmentsContent: {
    paddingHorizontal: 20,
  },
  departmentButton: {
    backgroundColor: AppColors.background.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  departmentButtonActive: {
    backgroundColor: AppColors.primary + '20',
    borderColor: AppColors.primary,
  },
  departmentButtonText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  departmentButtonTextActive: {
    color: AppColors.primary,
    fontWeight: '600',
  },
  jobsContainer: {
    paddingHorizontal: 20,
  },
  jobsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  jobCard: {
    backgroundColor: AppColors.background.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  jobHeaderContent: {
    flex: 1,
  },
  jobTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    flex: 1,
  },
  departmentBadge: {
    backgroundColor: AppColors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  departmentText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  jobMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  jobMetaText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginLeft: 6,
  },
  jobDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    lineHeight: 20,
    flex: 1,
    marginLeft: 4,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.primary + '20',
  },
  postedText: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  applyButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.background.dark,
  },
  applicationInfo: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  applicationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginBottom: 12,
  },
  applicationText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  contactButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
});

export default HiringScreen;