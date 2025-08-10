package com.israelnews.widget

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import org.xmlpull.v1.XmlPullParser
import org.xmlpull.v1.XmlPullParserFactory
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.Locale

object NewsRepository {
    private val feeds = listOf(
        Pair("חדשות 12", "https://storage.googleapis.com/mako-sitemaps/rssWebSub.xml"),
        Pair("חדשות 13", "https://13tv.co.il/feed/"),
        Pair("וואלה חדשות", "https://rss.walla.co.il/feed/1?type=main")
    )

    fun fetchAll(): List<NewsItem> {
        val all = mutableListOf<NewsItem>()
        for ((name, url) in feeds) {
            try {
                val xml = httpGet(url)
                val items = parseRss(xml, name)
                all += items
            } catch (_: Exception) { /* ignore feed errors */ }
        }
        if (all.isEmpty()) return fallback()
        return all.sortedByDescending { it.pubDate }.take(20)
    }

    fun fallback(): List<NewsItem> = listOf(
        NewsItem(
            title = "טכנולוגיה חדשה בישראל מובילה בעולם",
            description = "חברות טכנולוגיה ישראליות ממשיכות לחדש ולהוביל בשווקים עולמיים עם פתרונות מתקדמים",
            link = "https://example.com/tech-news",
            pubDate = System.currentTimeMillis(),
            source = "חדשות דמו",
            imageUrl = null
        )
    )

    fun timeAgo(timeMillis: Long): String {
        val now = System.currentTimeMillis()
        val diff = now - timeMillis
        if (diff < 0) return "עכשיו"
        val minutes = diff / 60000
        val hours = minutes / 60
        val days = hours / 24
        return when {
            minutes < 1 -> "עכשיו"
            minutes < 60 -> "לפני ${minutes} דקות"
            hours < 24 -> "לפני ${hours} שעות"
            days < 7 -> "לפני ${days} ימים"
            else -> SimpleDateFormat("dd/MM/yy", Locale("he", "IL")).format(timeMillis)
        }
    }

    fun fetchBitmap(urlStr: String, reqWidth: Int, reqHeight: Int): Bitmap? {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.connectTimeout = 5000
        conn.readTimeout = 5000
        conn.instanceFollowRedirects = true
        conn.requestMethod = "GET"
        conn.connect()
        conn.inputStream.use { input ->
            val bmp = BitmapFactory.decodeStream(input)
            return Bitmap.createScaledBitmap(bmp, reqWidth, reqHeight, true)
        }
    }

    private fun httpGet(urlStr: String): String {
        val conn = URL(urlStr).openConnection() as HttpURLConnection
        conn.connectTimeout = 7000
        conn.readTimeout = 7000
        conn.instanceFollowRedirects = true
        conn.requestMethod = "GET"
        conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Android) NewsWidget")
        conn.connect()
        val code = conn.responseCode
        val stream: InputStream = if (code in 200..299) conn.inputStream else conn.errorStream
        return stream.bufferedReader().use { it.readText() }
    }

    private fun parseRss(xml: String, sourceName: String): List<NewsItem> {
        val factory = XmlPullParserFactory.newInstance()
        val parser = factory.newPullParser()
        parser.setInput(xml.reader())
        var event = parser.eventType
        val result = mutableListOf<NewsItem>()
        var inItem = false

        var title: String? = null
        var link: String? = null
        var pubDate: Long? = null
        var description: String? = null
        var imageUrl: String? = null

        while (event != XmlPullParser.END_DOCUMENT) {
            when (event) {
                XmlPullParser.START_TAG -> {
                    when (parser.name.lowercase(Locale.ROOT)) {
                        "item", "entry" -> {
                            inItem = true
                            title = null; link = null; pubDate = null; description = null; imageUrl = null
                        }
                        "title" -> if (inItem) title = parser.nextText()
                        "link" -> if (inItem) {
                            // Some feeds use <link href="..."/>
                            val href = parser.getAttributeValue(null, "href")
                            link = href ?: parser.nextText()
                        }
                        "pubdate", "updated", "published" -> if (inItem) pubDate = parseDate(parser.nextText())
                        "description", "summary" -> if (inItem) description = parser.nextText()
                        "enclosure" -> if (inItem) {
                            val type = parser.getAttributeValue(null, "type")
                            if (type != null && type.startsWith("image")) {
                                imageUrl = parser.getAttributeValue(null, "url")
                            }
                        }
                        "media:content" -> if (inItem) {
                            val type = parser.getAttributeValue(null, "type")
                            if (type == null || type.startsWith("image")) {
                                imageUrl = parser.getAttributeValue(null, "url") ?: imageUrl
                            }
                        }
                    }
                }
                XmlPullParser.END_TAG -> {
                    when (parser.name.lowercase(Locale.ROOT)) {
                        "item", "entry" -> {
                            inItem = false
                            val t = title?.trim()
                            val l = link?.trim()
                            val d = (description ?: "").trim()
                            val p = pubDate ?: System.currentTimeMillis()
                            if (!t.isNullOrEmpty() && !l.isNullOrEmpty()) {
                                // Try extract image from description if missing
                                if (imageUrl == null && d.contains("<img")) {
                                    val regex = Regex("<img[^>]+src=\"([^\">]+)\"")
                                    val m = regex.find(d)
                                    imageUrl = m?.groupValues?.getOrNull(1)
                                }
                                result += NewsItem(
                                    title = t,
                                    description = d.replace(Regex("<[^>]*>"), "").trim(),
                                    link = l,
                                    pubDate = p,
                                    source = sourceName,
                                    imageUrl = imageUrl
                                )
                            }
                        }
                    }
                }
            }
            event = parser.next()
        }
        return result
    }

    private fun parseDate(s: String): Long {
        val candidates = listOf(
            "EEE, dd MMM yyyy HH:mm:ss Z",
            "EEE, dd MMM yyyy HH:mm Z",
            "yyyy-MM-dd'T'HH:mm:ssXXX",
            "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"
        )
        for (p in candidates) {
            try {
                val df = SimpleDateFormat(p, Locale.ENGLISH)
                return df.parse(s)?.time ?: continue
            } catch (_: ParseException) {}
        }
        return System.currentTimeMillis()
    }
}
