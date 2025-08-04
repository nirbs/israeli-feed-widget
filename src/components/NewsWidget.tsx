import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NewsCard } from "./NewsCard";
import { RSSService, NewsItem } from "@/services/rssService";
import { useOfflineNews } from "@/hooks/useOfflineNews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Filter, 
  Newspaper,
  AlertCircle,
  Trophy,
  FileText,
  Settings,
  Grid3X3,
  List,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = 'grid' | 'list' | 'compact';
type FilterCategory = 'all' | 'breaking' | 'political' | 'sports' | 'general' | 'entertainment';

export const NewsWidget = () => {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { cachedNews, isOffline, cacheNews } = useOfflineNews();

  const { data: newsItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['israeliNews'],
    queryFn: async () => {
      const news = await RSSService.fetchAllFeeds();
      if (news.length > 0) {
        cacheNews(news);
      }
      return news;
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  // Use cached news when offline or no data
  const displayNews = newsItems.length > 0 ? newsItems : cachedNews;

  const filteredNews = displayNews.filter(item => 
    filter === 'all' || item.category === filter
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: "עודכן!",
        description: "החדשות עודכנו בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את החדשות",
        variant: "destructive",
      });
    }
  };

  const categoryStats = {
    all: displayNews.length,
    breaking: displayNews.filter(item => item.category === 'breaking').length,
    political: displayNews.filter(item => item.category === 'political').length,
    sports: displayNews.filter(item => item.category === 'sports').length,
    general: displayNews.filter(item => item.category === 'general').length,
    entertainment: displayNews.filter(item => item.category === 'entertainment').length,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">שגיאה בטעינת החדשות</h2>
            <p className="text-muted-foreground mb-4">לא ניתן לטעון את החדשות כרגע</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              נסה שוב
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-primary shadow-news">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Newspaper className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">חדשות ישראל</h1>
                <p className="text-white/80 text-sm">
                  {isLoading ? "טוען..." : `${displayNews.length} כתבות`}
                  {isOffline && " (לא מקוון)"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className={cn(
                  "h-4 w-4 mr-2",
                  isLoading && "animate-spin"
                )} />
                עדכן
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={filter === 'all' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setFilter('all')}
            >
              <FileText className="h-3 w-3 mr-1" />
              הכל ({categoryStats.all})
            </Badge>
            <Badge
              variant={filter === 'breaking' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setFilter('breaking')}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              דחוף ({categoryStats.breaking})
            </Badge>
            <Badge
              variant={filter === 'political' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setFilter('political')}
            >
              <FileText className="h-3 w-3 mr-1" />
              פוליטיקה ({categoryStats.political})
            </Badge>
            <Badge
              variant={filter === 'sports' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setFilter('sports')}
            >
              <Trophy className="h-3 w-3 mr-1" />
              ספורט ({categoryStats.sports})
            </Badge>
            <Badge
              variant={filter === 'entertainment' ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setFilter('entertainment')}
            >
              <Palette className="h-3 w-3 mr-1" />
              תרבות ({categoryStats.entertainment})
            </Badge>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {filteredNews.length} כתבות
          </p>
        </div>

        {/* News Content */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          {isLoading ? (
            <div className={cn(
              "grid gap-4",
              viewMode === 'grid' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              viewMode === 'list' && "grid-cols-1",
              viewMode === 'compact' && "grid-cols-1 md:grid-cols-2"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">אין כתבות להצגה</h3>
              <p className="text-muted-foreground">בחר קטגוריה אחרת או רענן את הדף</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4 pb-4",
              viewMode === 'grid' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              viewMode === 'list' && "grid-cols-1",
              viewMode === 'compact' && "grid-cols-1 md:grid-cols-2"
            )}>
              {filteredNews.map((item, index) => (
                <NewsCard 
                  key={`${item.link}-${index}`}
                  item={item} 
                  variant={viewMode === 'compact' ? 'compact' : 'default'} 
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};