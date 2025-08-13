package com.israelnews.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews

class NewsWidgetProvider : AppWidgetProvider() {
    companion object {
        const val ACTION_REFRESH = "com.israelnews.widget.ACTION_REFRESH"
    }

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val intent = Intent(context, NewsWidgetService::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                data = Uri.parse(this.toUri(Intent.URI_INTENT_SCHEME))
            }

            val views = RemoteViews(context.packageName, R.layout.widget_news).apply {
                setRemoteAdapter(R.id.widget_list, intent)
                setEmptyView(R.id.widget_list, R.id.empty_view)

                // Refresh action
                val refreshIntent = Intent(context, NewsWidgetProvider::class.java).apply {
                    action = ACTION_REFRESH
                }
                val refreshPendingIntent = PendingIntent.getBroadcast(
                    context, 1002, refreshIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                setOnClickPendingIntent(R.id.refresh_button, refreshPendingIntent)

                // Header click: open app Activity with more articles
                val appIntent = Intent(context, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val appPI = PendingIntent.getActivity(
                    context, 1001, appIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                setOnClickPendingIntent(R.id.header, appPI)

                // Template for both browser links and app opening
                val templateIntent = Intent().apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val templatePI = PendingIntent.getActivity(
                    context, 1003, templateIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
                )
                setPendingIntentTemplate(R.id.widget_list, templatePI)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
            appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_list)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_REFRESH) {
            val mgr = AppWidgetManager.getInstance(context)
            val cn = ComponentName(context, NewsWidgetProvider::class.java)
            val ids = mgr.getAppWidgetIds(cn)
            for (id in ids) {
                mgr.notifyAppWidgetViewDataChanged(id, R.id.widget_list)
            }
        }
    }
}
