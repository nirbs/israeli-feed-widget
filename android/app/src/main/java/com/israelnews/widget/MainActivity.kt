package com.israelnews.widget

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.ImageView
import android.widget.ListView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val list = findViewById<ListView>(R.id.list)
        val progress = findViewById<ProgressBar>(R.id.progress)

        Thread {
            val items = try {
                NewsRepository.fetchAll(50)
            } catch (_: Exception) {
                NewsRepository.fallback()
            }
            runOnUiThread {
                progress.visibility = View.GONE
                list.adapter = NewsAdapter(items)
                list.setOnItemClickListener { _, _, position, _ ->
                    val item = items[position]
                    val i = Intent(Intent.ACTION_VIEW, Uri.parse(item.link)).apply {
                        addCategory(Intent.CATEGORY_BROWSABLE)
                    }
                    startActivity(i)
                }
            }
        }.start()
    }

    inner class NewsAdapter(private val items: List<NewsItem>) : BaseAdapter() {
        override fun getCount(): Int = items.size
        override fun getItem(position: Int): Any = items[position]
        override fun getItemId(position: Int): Long = position.toLong()

        override fun getView(position: Int, convertView: View?, parent: ViewGroup?): View {
            val view = convertView ?: LayoutInflater.from(this@MainActivity).inflate(R.layout.item_article, parent, false)
            val item = items[position]
            val title = view.findViewById<TextView>(R.id.title)
            val meta = view.findViewById<TextView>(R.id.meta)
            val image = view.findViewById<ImageView>(R.id.image)

            title.text = item.title
            meta.text = "${item.source} • ${NewsRepository.timeAgo(item.pubDate)}"
            image.setImageResource(android.R.drawable.ic_menu_report_image)

            // Load image best-effort on background
            Thread {
                try {
                    val bmp = item.imageUrl?.let { NewsRepository.fetchBitmap(it, 160, 120) }
                    if (bmp != null) {
                        runOnUiThread {
                            if (position == (image.tag as? Int ?: -1) || convertView == null) {
                                image.setImageBitmap(bmp)
                            }
                        }
                    }
                } catch (_: Exception) {}
            }.start()
            image.tag = position

            return view
        }
    }
}
