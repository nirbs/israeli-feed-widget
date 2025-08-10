package com.israelnews.widget

import android.content.Intent
import android.widget.RemoteViewsService

class NewsWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        return NewsRemoteViewsFactory(applicationContext)
    }
}
