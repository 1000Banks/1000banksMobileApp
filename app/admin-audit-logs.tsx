import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import firebaseService from '@/services/firebase';

interface AuditLog {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetUserEmail?: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
}

const AdminAuditLogsScreen = () => {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const actionTypes = [
    'all',
    'GRANT_ADMIN',
    'REMOVE_ADMIN',
    'BLOCK_USER',
    'UNBLOCK_USER',
    'DELETE_USER',
    'UPDATE_APP_SETTINGS',
    'CREATE_BACKUP',
    'CLEAR_CACHE',
    'EXPORT_ANALYTICS',
  ];

  useEffect(() => {
    checkAdminAccess();
    fetchAuditLogs();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const isAdmin = await firebaseService.isAdmin();
      if (!isAdmin) {
        router.replace('/');
      }
    } catch (error) {
      router.replace('/');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const auditLogs = await firebaseService.getAuditLogs(200);
      setLogs(auditLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAuditLogs();
    setRefreshing(false);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'GRANT_ADMIN':
        return 'shield-checkmark';
      case 'REMOVE_ADMIN':
        return 'shield-outline';
      case 'BLOCK_USER':
        return 'lock-closed';
      case 'UNBLOCK_USER':
        return 'lock-open';
      case 'DELETE_USER':
        return 'trash';
      case 'UPDATE_APP_SETTINGS':
        return 'settings';
      case 'CREATE_BACKUP':
        return 'cloud-download';
      case 'CLEAR_CACHE':
        return 'refresh';
      case 'EXPORT_ANALYTICS':
        return 'download';
      default:
        return 'document-text';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'GRANT_ADMIN':
        return '#10B981';
      case 'REMOVE_ADMIN':
        return '#F59E0B';
      case 'BLOCK_USER':
        return '#EF4444';
      case 'UNBLOCK_USER':
        return '#10B981';
      case 'DELETE_USER':
        return '#DC2626';
      case 'UPDATE_APP_SETTINGS':
        return '#6366F1';
      case 'CREATE_BACKUP':
        return '#06B6D4';
      case 'CLEAR_CACHE':
        return '#8B5CF6';
      case 'EXPORT_ANALYTICS':
        return '#F97316';
      default:
        return AppColors.text.secondary;
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (log.targetUserEmail?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const renderLogItem = (log: AuditLog) => (
    <View key={log.id} style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={[styles.actionIcon, { backgroundColor: getActionColor(log.action) + '20' }]}>
          <Ionicons 
            name={getActionIcon(log.action) as any} 
            size={18} 
            color={getActionColor(log.action)} 
          />
        </View>
        <View style={styles.logContent}>
          <Text style={styles.actionText}>{formatAction(log.action)}</Text>
          <Text style={styles.adminText}>by {log.adminEmail}</Text>
          {log.targetUserEmail && (
            <Text style={styles.targetText}>Target: {log.targetUserEmail}</Text>
          )}
          {log.details && (
            <Text style={styles.detailsText}>
              {Object.entries(log.details).map(([key, value]) => 
                `${key}: ${JSON.stringify(value)}`
              ).join(', ')}
            </Text>
          )}
        </View>
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampText}>
            {new Date(log.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.timeText}>
            {new Date(log.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Audit Logs</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={AppColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audit Logs</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={20} color={AppColors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={AppColors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search logs..."
              placeholderTextColor={AppColors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
        >
          {actionTypes.map((action) => (
            <TouchableOpacity
              key={action}
              style={[
                styles.filterButton,
                filterAction === action && styles.filterButtonActive
              ]}
              onPress={() => setFilterAction(action)}
            >
              <Text style={[
                styles.filterButtonText,
                filterAction === action && styles.filterButtonTextActive
              ]}>
                {action === 'all' ? 'All' : formatAction(action)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Logs List */}
        <ScrollView 
          style={styles.logsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={AppColors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logsHeader}>
            <Text style={styles.logsCount}>
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''} found
            </Text>
          </View>
          
          {filteredLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={60} color={AppColors.text.secondary} />
              <Text style={styles.emptyTitle}>No logs found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || filterAction !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Audit logs will appear here when actions are performed'
                }
              </Text>
            </View>
          ) : (
            filteredLogs.map(renderLogItem)
          )}
        </ScrollView>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text.primary,
  },
  refreshButton: {
    padding: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
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
  filtersContainer: {
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: AppColors.background.card,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: AppColors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: AppColors.background.dark,
  },
  logsList: {
    flex: 1,
  },
  logsHeader: {
    marginBottom: 16,
  },
  logsCount: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  logItem: {
    backgroundColor: AppColors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  adminText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    marginBottom: 2,
  },
  targetText: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginBottom: 2,
  },
  detailsText: {
    fontSize: 11,
    color: AppColors.text.secondary,
    fontStyle: 'italic',
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestampText: {
    fontSize: 12,
    color: AppColors.text.secondary,
  },
  timeText: {
    fontSize: 10,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});

export default AdminAuditLogsScreen;