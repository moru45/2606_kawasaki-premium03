import React from 'react';
import { MapPin, Search, Store, Ticket } from 'lucide-react';
import './StoreCard.css';

export interface StoreData {
  屋号: string;
  店舗名: string;
  区: string;
  所在地: string;
  業種: string;
  共通券: string;
  専用券: string;
  lat?: number;
  lng?: number;
}

interface StoreCardProps {
  store: StoreData;
  isSelected?: boolean;
  onClick?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, isSelected, onClick }) => {
  const isCommon = store.共通券 === '〇';
  const isExclusive = store.専用券 === '〇';

  const title = store.屋号;
  const subtitle = store.店舗名 || undefined;

  const mapQuery = encodeURIComponent(`${title} ${subtitle || ''} 神奈川県川崎市${store.区}${store.所在地}`);
  const webQuery = encodeURIComponent(`${title} ${subtitle || ''} 川崎市 ${store.区} ${store.所在地}`);

  return (
    <div 
      className={`store-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="store-header">
        <h3 className="store-title">{title}</h3>
        {subtitle && <p className="store-subtitle">{subtitle}</p>}
      </div>

      <div className="store-body">
        <div className="store-info-row">
          <MapPin size={16} className="icon" />
          <span>{store.区} {store.所在地}</span>
        </div>
        {store.業種 && (
          <div className="store-info-row">
            <Store size={16} className="icon" />
            <span>{store.業種}</span>
          </div>
        )}
        <div className="store-tags">
          <Ticket size={14} className="icon" style={{marginRight: '4px'}}/>
          {isCommon && <span className="tag common-tag">共通券</span>}
          {isExclusive && <span className="tag exclusive-tag">専用券</span>}
        </div>
      </div>

      <div className="store-actions">
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-map"
        >
          <MapPin size={16} /> マップ
        </a>
        <a 
          href={`https://www.google.com/search?q=${webQuery}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-web"
        >
          <Search size={16} /> ネット検索
        </a>
      </div>
    </div>
  );
};
