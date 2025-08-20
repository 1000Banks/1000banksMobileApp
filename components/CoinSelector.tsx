import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/constants/Colors';

interface Coin {
  symbol: string;
  name: string;
}

interface CoinSelectorProps {
  selectedCoin: string;
  onCoinSelect: (symbol: string) => void;
}

const CoinSelector: React.FC<CoinSelectorProps> = ({ selectedCoin, onCoinSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);

  // Comprehensive list of available trading pairs on Binance
  const defaultCoins: Coin[] = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'BNBUSDT', name: 'BNB' },
    { symbol: 'XRPUSDT', name: 'XRP' },
    { symbol: 'SOLUSDT', name: 'Solana' },
    { symbol: 'ADAUSDT', name: 'Cardano' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin' },
    { symbol: 'MATICUSDT', name: 'Polygon' },
    { symbol: 'DOTUSDT', name: 'Polkadot' },
    { symbol: 'AVAXUSDT', name: 'Avalanche' },
    { symbol: 'SHIBUSDT', name: 'Shiba Inu' },
    { symbol: 'TRXUSDT', name: 'TRON' },
    { symbol: 'LINKUSDT', name: 'Chainlink' },
    { symbol: 'UNIUSDT', name: 'Uniswap' },
    { symbol: 'LTCUSDT', name: 'Litecoin' },
    { symbol: 'ATOMUSDT', name: 'Cosmos' },
    { symbol: 'ETCUSDT', name: 'Ethereum Classic' },
    { symbol: 'XLMUSDT', name: 'Stellar' },
    { symbol: 'NEARUSDT', name: 'NEAR Protocol' },
    { symbol: 'ALGOUSDT', name: 'Algorand' },
    { symbol: 'FILUSDT', name: 'Filecoin' },
    { symbol: 'VETUSDT', name: 'VeChain' },
    { symbol: 'ICPUSDT', name: 'Internet Computer' },
    { symbol: 'APTUSDT', name: 'Aptos' },
    { symbol: 'AAVEUSDT', name: 'Aave' },
    { symbol: 'MKRUSDT', name: 'Maker' },
    { symbol: 'SANDUSDT', name: 'The Sandbox' },
    { symbol: 'AXSUSDT', name: 'Axie Infinity' },
    { symbol: 'MANAUSDT', name: 'Decentraland' },
    { symbol: 'GALAUSDT', name: 'Gala' },
    { symbol: 'APEUSDT', name: 'ApeCoin' },
    { symbol: 'CHZUSDT', name: 'Chiliz' },
    { symbol: 'ENJUSDT', name: 'Enjin Coin' },
    { symbol: 'CRVUSDT', name: 'Curve DAO' },
    { symbol: 'SNXUSDT', name: 'Synthetix' },
    { symbol: 'LRCUSDT', name: 'Loopring' },
    { symbol: 'FTMUSDT', name: 'Fantom' },
    { symbol: 'CAKEUSDT', name: 'PancakeSwap' },
    { symbol: '1INCHUSDT', name: '1inch' },
    { symbol: 'OPUSDT', name: 'Optimism' },
    { symbol: 'ARBUSDT', name: 'Arbitrum' },
    { symbol: 'RUNEUSDT', name: 'THORChain' },
    { symbol: 'EGLDUSDT', name: 'MultiversX' },
    { symbol: 'IMXUSDT', name: 'Immutable X' },
    { symbol: 'FLOWUSDT', name: 'Flow' },
    { symbol: 'THETAUSDT', name: 'Theta Network' },
    { symbol: 'XTZUSDT', name: 'Tezos' },
    { symbol: 'GRTUSDT', name: 'The Graph' },
    { symbol: 'SUSHIUSDT', name: 'SushiSwap' },
    { symbol: 'COMPUSDT', name: 'Compound' },
    { symbol: 'ZRXUSDT', name: '0x' },
    { symbol: 'BATUSDT', name: 'Basic Attention Token' },
    { symbol: 'DASHUSDT', name: 'Dash' },
    { symbol: 'ZECUSDT', name: 'Zcash' },
    { symbol: 'YFIUSDT', name: 'yearn.finance' },
    { symbol: 'INJUSDT', name: 'Injective' },
    { symbol: 'LDOUSDT', name: 'Lido DAO' },
    { symbol: 'ROSEUSDT', name: 'Oasis Network' },
    { symbol: 'KAVAUSDT', name: 'Kava' },
    { symbol: 'OCEANUSDT', name: 'Ocean Protocol' },
    { symbol: 'KNCUSDT', name: 'Kyber Network' },
    { symbol: 'GMTUSDT', name: 'STEPN' },
    { symbol: 'QNTUSDT', name: 'Quant' },
    { symbol: 'EOSUSDT', name: 'EOS' },
    { symbol: 'NEOUSDT', name: 'NEO' },
    { symbol: 'XMRUSDT', name: 'Monero' },
    { symbol: 'BCHUSDT', name: 'Bitcoin Cash' },
    { symbol: 'ZILUSDT', name: 'Zilliqa' },
    { symbol: 'IOTAUSDT', name: 'IOTA' },
    { symbol: 'WAVESUSDT', name: 'Waves' },
    { symbol: 'STXUSDT', name: 'Stacks' },
    { symbol: 'CELOUSDT', name: 'Celo' },
    { symbol: 'ANKRUSDT', name: 'Ankr' },
    { symbol: 'FETUSDT', name: 'Fetch.ai' },
    { symbol: 'SKLUSDT', name: 'SKALE' },
    { symbol: 'CTSIUSDT', name: 'Cartesi' },
    { symbol: 'CHRUSDT', name: 'Chromia' },
    { symbol: 'MTLUSDT', name: 'Metal' },
    { symbol: 'RENUSDT', name: 'Ren' },
    { symbol: 'STORJUSDT', name: 'Storj' },
    { symbol: 'LPTUSDT', name: 'Livepeer' },
    { symbol: 'ILVUSDT', name: 'Illuvium' },
    { symbol: 'ENSUSDT', name: 'Ethereum Name Service' },
    { symbol: 'BLZUSDT', name: 'Bluzelle' },
    { symbol: 'CELRUSDT', name: 'Celer Network' },
    { symbol: 'PERPUSDT', name: 'Perpetual Protocol' },
    { symbol: 'TRUUSDT', name: 'TrueFi' },
    { symbol: 'BANDUSDT', name: 'Band Protocol' },
    { symbol: 'NMRUSDT', name: 'Numeraire' },
    { symbol: 'SXPUSDT', name: 'SXP' },
    { symbol: 'API3USDT', name: 'API3' },
    { symbol: 'COTIUSDT', name: 'COTI' },
    { symbol: 'C98USDT', name: 'Coin98' },
    { symbol: 'MASKUSDT', name: 'Mask Network' },
    { symbol: 'ATAUSDT', name: 'Automata Network' },
    { symbol: 'DYDXUSDT', name: 'dYdX' },
    { symbol: 'SPELLUSDT', name: 'Spell Token' },
    { symbol: 'JASMYUSDT', name: 'JasmyCoin' },
    { symbol: 'AMPUSDT', name: 'Amp' },
    { symbol: 'PEOPLEUSDT', name: 'ConstitutionDAO' },
    { symbol: 'TLMUSDT', name: 'Alien Worlds' },
    { symbol: 'ALICEUSDT', name: 'My Neighbor Alice' },
  ];

  useEffect(() => {
    setCoins(defaultCoins);
    setFilteredCoins(defaultCoins);
  }, []);

  useEffect(() => {
    console.log('Filtering coins, searchQuery:', searchQuery);
    console.log('Total coins available:', coins.length);
    
    if (searchQuery.trim() === '') {
      console.log('Empty query, showing all coins');
      setFilteredCoins(coins);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = coins.filter(coin => {
        const symbolMatch = coin.symbol.toLowerCase().startsWith(query) || 
                           coin.symbol.toLowerCase().replace('usdt', '').startsWith(query);
        const nameMatch = coin.name.toLowerCase().startsWith(query);
        return symbolMatch || nameMatch;
      });
      
      console.log('Filtered results:', filtered.length);
      
      // Sort results to show exact matches first
      filtered.sort((a, b) => {
        const aSymbolStart = a.symbol.toLowerCase().startsWith(query);
        const bSymbolStart = b.symbol.toLowerCase().startsWith(query);
        const aNameStart = a.name.toLowerCase().startsWith(query);
        const bNameStart = b.name.toLowerCase().startsWith(query);
        
        if (aSymbolStart && !bSymbolStart) return -1;
        if (!aSymbolStart && bSymbolStart) return 1;
        if (aNameStart && !bNameStart) return -1;
        if (!aNameStart && bNameStart) return 1;
        
        return a.name.localeCompare(b.name);
      });
      
      setFilteredCoins(filtered);
    }
  }, [searchQuery, coins]);

  const handleCoinSelect = (symbol: string) => {
    onCoinSelect(symbol);
    setModalVisible(false);
    setSearchQuery('');
  };
  
  const handleModalOpen = () => {
    setSearchQuery('');
    setFilteredCoins(coins);
    setModalVisible(true);
  };

  const getSelectedCoinName = () => {
    const coin = coins.find(c => c.symbol === selectedCoin);
    return coin ? `${coin.name} (${coin.symbol})` : selectedCoin;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={handleModalOpen}
      >
        <Text style={styles.selectorButtonText}>{getSelectedCoinName()}</Text>
        <Ionicons name="chevron-down" size={20} color={AppColors.text.primary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Trading Pair</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={AppColors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={AppColors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search coin name or symbol..."
                placeholderTextColor={AppColors.text.secondary}
                value={searchQuery}
                onChangeText={(text) => {
                  console.log('Search query:', text);
                  setSearchQuery(text);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color={AppColors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>

            {filteredCoins.length > 0 ? (
              <ScrollView 
                style={styles.coinList}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {searchQuery && (
                  <Text style={styles.resultsCount}>
                    {filteredCoins.length} {filteredCoins.length === 1 ? 'result' : 'results'} found
                  </Text>
                )}
                {filteredCoins.map((coin) => {
                  // Highlight matching text
                  const query = searchQuery.toLowerCase();
                  const nameIndex = coin.name.toLowerCase().indexOf(query);
                  const symbolIndex = coin.symbol.toLowerCase().indexOf(query);
                  
                  return (
                    <TouchableOpacity
                      key={coin.symbol}
                      style={[
                        styles.coinItem,
                        selectedCoin === coin.symbol && styles.selectedCoinItem
                      ]}
                      onPress={() => handleCoinSelect(coin.symbol)}
                    >
                      <View style={styles.coinInfo}>
                        <Text style={styles.coinName}>{coin.name}</Text>
                        <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                      </View>
                      {selectedCoin === coin.symbol && (
                        <Ionicons name="checkmark-circle" size={24} color={AppColors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search" size={48} color={AppColors.text.secondary} />
                <Text style={styles.noResultsText}>No coins found matching "{searchQuery}"</Text>
                <Text style={styles.noResultsHint}>Try searching by symbol (BTC, ETH) or name (Bitcoin, Ethereum)</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: AppColors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.primary + '30',
  },
  selectorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.background.dark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text.primary,
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.background.card,
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
    color: AppColors.text.primary,
  },
  clearButton: {
    padding: 8,
  },
  coinList: {
    flex: 1,
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.background.card,
  },
  selectedCoinItem: {
    backgroundColor: AppColors.primary + '10',
  },
  coinInfo: {
    flex: 1,
  },
  coinName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  coinSymbol: {
    fontSize: 14,
    color: AppColors.text.secondary,
  },
  resultsCount: {
    fontSize: 14,
    color: AppColors.text.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 16,
    color: AppColors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  noResultsHint: {
    fontSize: 14,
    color: AppColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});

export default CoinSelector;