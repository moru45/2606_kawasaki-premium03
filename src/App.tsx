import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import './App.css';
import { StoreCard, type StoreData } from './StoreCard';
import storeDataRaw from './data.json';

const ALL_DATA = storeDataRaw as StoreData[];

// Extract unique filter values
const WARDS = Array.from(new Set(ALL_DATA.map(d => d.区).filter(Boolean))).sort();
const INDUSTRIES = Array.from(new Set(ALL_DATA.map(d => d.業種).filter(Boolean))).sort();

const ITEMS_PER_PAGE = 50;

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [ticketFilter, setTicketFilter] = useState(''); // '' | 'common' | 'exclusive'
  
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // 選択された区に応じた「所在地」のリストを動的に生成
  const availableTowns = useMemo(() => {
    let data = ALL_DATA;
    if (selectedWard) {
      data = data.filter(d => d.区 === selectedWard);
    }
    return Array.from(new Set(data.map(d => d.所在地).filter(Boolean))).sort();
  }, [selectedWard]);

  const filteredData = useMemo(() => {
    return ALL_DATA.filter(store => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const textToSearch = `${store.屋号} ${store.店舗名} ${store.区} ${store.所在地}`.toLowerCase();
        if (!textToSearch.includes(query)) return false;
      }
      
      // 2. Ward
      if (selectedWard && store.区 !== selectedWard) return false;

      // 2.5 Town
      if (selectedTown && store.所在地 !== selectedTown) return false;
      
      // 3. Industry
      if (selectedIndustry && store.業種 !== selectedIndustry) return false;
      
      // 4. Ticket Type
      if (ticketFilter === 'common' && store.共通券 !== '〇') return false;
      if (ticketFilter === 'exclusive' && store.専用券 !== '〇') return false;
      
      return true;
    });
  }, [searchQuery, selectedWard, selectedTown, selectedIndustry, ticketFilter]);

  const visibleStores = filteredData.slice(0, visibleCount);
  const hasMore = visibleCount < filteredData.length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWard(e.target.value);
    setSelectedTown(''); // 区が変わったら所在地をリセットする
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedWard('');
    setSelectedTown('');
    setSelectedIndustry('');
    setTicketFilter('');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">川崎市プレミアムデジタル商品券</h1>
        <p className="app-subtitle">【非公式】使えるお店検索</p>
        <div className="story-box">
          <p><strong>「PDFだと検索が…」</strong>そこで、スマホでもお店を探せるアプリ作りました！</p>
        </div>
      </header>

      <div className="search-section">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="店名や住所で検索..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">エリア (区)</label>
            <select className="filter-select" value={selectedWard} onChange={handleWardChange}>
              <option value="">すべての区</option>
              {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">町名 (所在地)</label>
            <select 
              className="filter-select" 
              value={selectedTown} 
              onChange={handleFilterChange(setSelectedTown)}
              disabled={!selectedWard && availableTowns.length > 100} // 区が未選択で多すぎる場合は無効化もアリですが、今回は全表示も許容します
            >
              <option value="">{selectedWard ? 'すべての町名' : 'すべての町名 (先に区を選ぶと絞れます)'}</option>
              {availableTowns.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">業種</label>
            <select className="filter-select" value={selectedIndustry} onChange={handleFilterChange(setSelectedIndustry)}>
              <option value="">すべての業種</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">券種</label>
            <select className="filter-select" value={ticketFilter} onChange={handleFilterChange(setTicketFilter)}>
              <option value="">すべて</option>
              <option value="common">共通券が使える</option>
              <option value="exclusive">専用券が使える</option>
            </select>
          </div>
          
          <div className="filter-group reset-group">
            <button className="reset-button" onClick={handleResetFilters}>
              条件をリセット
            </button>
          </div>
        </div>
      </div>

      <div className="results-meta">
        {filteredData.length} 件のお手持ちのお店が見つかりました
      </div>

      <div className="store-list">
        {visibleStores.map((store, i) => (
          <StoreCard key={`${i}-${store.lat}`} store={store} />
        ))}
      </div>

      {hasMore && (
        <button 
          className="load-more" 
          onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
        >
          もっと見る ({filteredData.length - visibleCount}件)
        </button>
      )}

      <footer className="app-footer">
        <p><strong>【非公式アプリ】</strong> 当サイトは、川崎市プレミアムデジタル商品券の利用可能店舗を検索しやすくするための非公式ツールです。</p>
        <p>データの正確性には細心の注意を払っておりますが、利用によって生じたトラブル等の責任は負いかねます。<br />最新かつ正確な情報は、必ず<a href="https://kawasaki-premium.com/" target="_blank" rel="noopener noreferrer">公式サイト</a>をご確認ください。</p>
      </footer>
    </div>
  );
}

export default App;
