package com.israelnews.widget

import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.israelnews.widget.R

class NewsRemoteViewsFactory(private val context: Context) : RemoteViewsService.RemoteViewsFactory {
    private var items: List<NewsItem> = emptyList()

    override fun onCreate() {}

    override fun onDataSetChanged() {
        items = try {
            NewsRepository.fetchAll(15)
        } catch (_: Exception) {
            NewsRepository.fallback()
        }
    }

    override fun onDestroy() {}

    override fun getCount(): Int = items.size + 1 // +1 for footer

    override fun getViewAt(position: Int): RemoteViews {
        // Footer item
        if (position == items.size) {
            val rv = RemoteViews(context.packageName, R.layout.widget_footer_item)
            val appIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            rv.setOnClickFillInIntent(R.id.footer_root, appIntent)
            return rv
        }

        // Regular news item
        val item = items[position]
        val rv = RemoteViews(context.packageName, R.layout.widget_news_item)
        rv.setTextViewText(R.id.title, item.title)
        rv.setTextViewText(R.id.meta, "${item.source} • ${NewsRepository.timeAgo(item.pubDate)}")

        // Load image bitmap (best-effort)
        val bmp: Bitmap? = try { item.imageUrl?.let { NewsRepository.fetchBitmap(it, 160, 120) } } catch (_: Exception) { null }
        if (bmp != null) rv.setImageViewBitmap(R.id.image, bmp) else rv.setImageViewResource(R.id.image, android.R.drawable.ic_menu_report_image)

        // Click to open link in default browser
        val url = if (item.link.startsWith("http://") || item.link.startsWith("https://")) item.link else "https://${item.link}"
        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addCategory(Intent.CATEGORY_BROWSABLE)
        }
        rv.setOnClickFillInIntent(R.id.title, browserIntent)
        rv.setOnClickFillInIntent(R.id.image, browserIntent)
        rv.setOnClickFillInIntent(R.id.meta, browserIntent)
        rv.setOnClickFillInIntent(R.id.item_root, browserIntent)

        return rv
    }

    override fun getLoadingView(): RemoteViews? = null

    override fun getViewTypeCount(): Int = 2 // One for articles, one for footer

    override fun getItemId(position: Int): Long = position.toLong()

    override fun hasStableIds(): Boolean = true

    override fun getViewTypeAt(position: Int): Int {
        return if (position == items.size) 1 else 0 // 1 for footer, 0 for articles
    }
}
