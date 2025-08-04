import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NewsItem, RSSService } from "@/services/rssService";
import { cn } from "@/lib/utils";
import { ExternalLink, Clock, AlertCircle, Zap, Trophy, FileText, Palette } from "lucide-react";

interface NewsCardProps {
  item: NewsItem;
  variant?: 'default' | 'compact' | 'featured';
}

const categoryIcons = {
  breaking: AlertCircle,
  urgent: Zap,
  political: FileText,
  sports: Trophy,
  general: FileText,
  entertainment: Palette
};

const categoryColors = {
  breaking: 'bg-news-breaking text-news-breaking-foreground',
  urgent: 'bg-news-urgent text-news-urgent-foreground',
  political: 'bg-news-political text-news-political-foreground',
  sports: 'bg-news-sports text-news-sports-foreground',
  general: 'bg-secondary text-secondary-foreground',
  entertainment: 'bg-purple-500 text-white'
};

export const NewsCard = ({ item, variant = 'default' }: NewsCardProps) => {
  const CategoryIcon = categoryIcons[item.category] || FileText;
  const timeAgo = RSSService.formatTimeAgo(item.pubDate);

  const handleClick = () => {
    window.open(item.link, '_blank', 'noopener,noreferrer');
  };

  if (variant === 'compact') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-card transition-all duration-200 hover:scale-[1.02]"
        onClick={handleClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-1.5 rounded-full flex-shrink-0",
              categoryColors[item.category]
            )}>
              <CategoryIcon className="h-3 w-3" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-right">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
                <span>{item.source}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card 
        className="cursor-pointer hover:shadow-news transition-all duration-300 hover:scale-[1.02] bg-gradient-news border-0"
        onClick={handleClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <Badge className={cn(categoryColors[item.category], "flex items-center gap-1")}>
              <CategoryIcon className="h-3 w-3" />
              {item.category === 'breaking' && 'דחוף'}
              {item.category === 'political' && 'פוליטיקה'}
              {item.category === 'sports' && 'ספורט'}
              {item.category === 'general' && 'כללי'}
              {item.category === 'entertainment' && 'תרבות'}
            </Badge>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {item.image && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <h2 className="font-bold text-lg mb-3 text-right leading-tight">
            {item.title}
          </h2>
          {item.description && (
            <p className="text-muted-foreground text-sm mb-4 text-right line-clamp-3">
              {item.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              {timeAgo}
            </span>
            <span className="font-medium text-primary">{item.source}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-card transition-all duration-200 hover:scale-[1.01]"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Badge className={cn(categoryColors[item.category], "flex items-center gap-1")}>
            <CategoryIcon className="h-3 w-3" />
            {item.category === 'breaking' && 'דחוף'}
            {item.category === 'political' && 'פוליטיקה'} 
            {item.category === 'sports' && 'ספורט'}
            {item.category === 'general' && 'כללי'}
            {item.category === 'entertainment' && 'תרבות'}
          </Badge>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {item.image && (
          <div className="mb-3 rounded-md overflow-hidden">
            <img 
              src={item.image} 
              alt={item.title}
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        <h3 className="font-semibold text-base mb-2 text-right leading-snug">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-muted-foreground text-sm mb-3 text-right line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {timeAgo}
          </span>
          <span className="font-medium text-primary">{item.source}</span>
        </div>
      </CardContent>
    </Card>
  );
};