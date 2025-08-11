import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface TabItem {
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const tabs: TabItem[] = [
  { route: '/', icon: 'home', label: 'Home' },
  { route: '/courses', icon: 'school', label: 'Courses' },
  { route: '/shop', icon: 'bag', label: 'Shop' },
  { route: '/trading', icon: 'trending-up', label: 'Trading' },
  { route: '/account', icon: 'person', label: 'Account' },
];

const BottomTabs: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActiveTab = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = isActiveTab(tab.route);
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? AppColors.primary : AppColors.text.secondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? AppColors.primary : AppColors.text.secondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: AppColors.background.card,
    borderTopWidth: 1,
    borderTopColor: AppColors.primary + '20',
    paddingBottom: 20,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default BottomTabs;