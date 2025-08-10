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
            NewsRepository.fetchAll()
        } catch (_: Exception) {
            NewsRepository.fallback()
        }
    }

    override fun onDestroy() {}

    override fun getCount(): Int = items.size

    override fun getViewAt(position: Int): RemoteViews {
        val item = items[position]
        val rv = RemoteViews(context.packageName, R.layout.widget_news_item)
        rv.setTextViewText(R.id.title, item.title)
        rv.setTextViewText(R.id.meta, "${item.source} • ${NewsRepository.timeAgo(item.pubDate)}")

        // Load image bitmap (best-effort)
        val bmp: Bitmap? = try { item.imageUrl?.let { NewsRepository.fetchBitmap(it, 160, 120) } } catch (_: Exception) { null }
        if (bmp != null) rv.setImageViewBitmap(R.id.image, bmp) else rv.setImageViewResource(R.id.image, android.R.drawable.ic_menu_report_image)

        // Click to open link in default browser
        val fillInIntent = Intent(Intent.ACTION_VIEW).apply {
            addCategory(Intent.CATEGORY_BROWSABLE)
            data = Uri.parse(item.link)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        rv.setOnClickFillInIntent(R.id.title, fillInIntent)
        rv.setOnClickFillInIntent(R.id.image, fillInIntent)
        rv.setOnClickFillInIntent(R.id.meta, fillInIntent)

        return rv
    }

    override fun getLoadingView(): RemoteViews? = null

    override fun getViewTypeCount(): Int = 1

    override fun getItemId(position: Int): Long = position.toLong()

    override fun hasStableIds(): Boolean = true
}
