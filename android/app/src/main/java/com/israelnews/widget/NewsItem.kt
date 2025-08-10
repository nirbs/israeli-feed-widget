package com.israelnews.widget

data class NewsItem(
    val title: String,
    val description: String,
    val link: String,
    val pubDate: Long,
    val source: String,
    val imageUrl: String?
)
