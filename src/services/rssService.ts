export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: 'breaking' | 'political' | 'sports' | 'general' | 'entertainment';
  image?: string;
}

export interface RSSFeed {
  name: string;
  url: string;
  category: 'breaking' | 'political' | 'sports' | 'general' | 'entertainment';
}

// Israeli news RSS feeds
export const israeliRSSFeeds: RSSFeed[] = [
  {
    name: 'חדשות 12',
    url: 'https://storage.googleapis.com/mako-sitemaps/rssWebSub.xml',
    category: 'general'
  },
  {
    name: 'חדשות 13',
    url: 'https://13tv.co.il/feed/',
    category: 'general'
  },
  {
    name: 'וואלה חדשות',
    url: 'https://rss.walla.co.il/feed/1?type=main',
    category: 'general'
  },
  {
    name: 'YNET חדשות',
    url: 'https://www.ynet.co.il/Integration/StoryRss2.xml',
    category: 'general'
  },
  {
    name: 'מעריב אונליין',
    url: 'https://www.maariv.co.il/rss/rssfeeds',
    category: 'general'
  },
  {
    name: 'ישראל היום',
    url: 'https://www.israelhayom.co.il/rss',
    category: 'general'
  },
  {
    name: 'הארץ',
    url: 'https://www.haaretz.co.il/srv/htz---all-articles',
    category: 'general'
  },
  {
    name: 'ספורט 5',
    url: 'https://sport5.co.il/rss/feed',
    category: 'sports'
  },
  {
    name: 'ONE ספורט',
    url: 'https://www.one.co.il/cat/coop/xml/rss/newsfeed.aspx',
    category: 'sports'
  },
  {
    name: 'וואלה תרבות',
    url: 'https://rss.walla.co.il/feed/3?type=main',
    category: 'entertainment'
  },
  {
    name: 'YNET תרבות',
    url: 'https://www.ynet.co.il/Integration/StoryRss3011.xml',
    category: 'entertainment'
  }
];

// CORS proxy for RSS feeds
const CORS_PROXY = 'https://api.allorigins.win/get?url=';

export class RSSService {
  static async fetchRSSFeed(feedUrl: string): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received');
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.contents, 'text/xml');
      
      const items = Array.from(xmlDoc.querySelectorAll('item'));
      
      return items.map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        // Extract image from description or enclosure
        let image: string | undefined;
        const imageMatch = description.match(/<img[^>]+src="([^">]+)"/);
        if (imageMatch) {
          image = imageMatch[1];
        } else {
          // Try to get image from enclosure tag
          const enclosure = item.querySelector('enclosure[type^="image"]');
          if (enclosure) {
            image = enclosure.getAttribute('url') || undefined;
          }
        }
        
        // Clean description from HTML tags
        const cleanDescription = description.replace(/<[^>]*>/g, '').trim();
        
        return {
          title: title.trim(),
          description: cleanDescription,
          link,
          pubDate,
          source: feedUrl,
          category: this.categorizeNews(title, cleanDescription),
          image
        };
      });
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  }

  static categorizeNews(title: string, description: string): NewsItem['category'] {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('דחוף') || text.includes('חדשות אחרונות') || text.includes('שובר')) {
      return 'breaking';
    }
    
    if (text.includes('ספורט') || text.includes('כדורגל') || text.includes('ליגה') || 
        text.includes('מכבי') || text.includes('הפועל') || text.includes('בית"ר')) {
      return 'sports';
    }
    
    if (text.includes('פוליטיקה') || text.includes('ממשלה') || text.includes('כנסת') || 
        text.includes('בחירות') || text.includes('מפלגה')) {
      return 'political';
    }
    
    if (text.includes('תרבות') || text.includes('בידור') || text.includes('קולנוע') || 
        text.includes('מוזיקה') || text.includes('תיאטרון') || text.includes('טלוויזיה')) {
      return 'entertainment';
    }
    
    return 'general';
  }

  static async fetchAllFeeds(): Promise<NewsItem[]> {
    const allItems: NewsItem[] = [];
    
    for (const feed of israeliRSSFeeds) {
      try {
        const items = await this.fetchRSSFeed(feed.url);
        const itemsWithSource = items.map(item => ({
          ...item,
          source: feed.name,
          category: feed.category !== 'general' ? feed.category : item.category
        }));
        allItems.push(...itemsWithSource);
      } catch (error) {
        console.error(`Error fetching feed ${feed.name}:`, error);
      }
    }
    
    // Sort by date (newest first)
    return allItems.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  static formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `לפני ${diffInMinutes} דקות`;
    } else if (diffInHours < 24) {
      return `לפני ${diffInHours} שעות`;
    } else if (diffInDays < 7) {
      return `לפני ${diffInDays} ימים`;
    } else {
      return date.toLocaleDateString('he-IL');
    }
  }
}