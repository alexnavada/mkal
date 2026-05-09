"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Newspaper, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface News {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  createdAt: any;
}

export default function HaberlerPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "news"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as News[];
      setNewsList(data);
      setLoading(false);
    }, (error) => {
      console.error("Haberler yüklenirken hata:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
          <Newspaper className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Okuldan Haberler</h1>
          <p className="text-muted-foreground">MKAL'den en güzel haberler. (Haber atmak için DM atabilirsiniz)</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : newsList.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-xl text-center text-muted-foreground">
          Henüz haber eklenmemiş.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <Link href={`/haberler/${news.id}`} key={news.id} className="group">
              <article className="bg-card border border-border rounded-2xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg h-full flex flex-col">
                <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative">
                  {news.imageUrl ? (
                    <img
                      src={news.imageUrl}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                      <Newspaper className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {news.createdAt
                        ? format(news.createdAt.toDate(), "d MMMM yyyy", { locale: tr })
                        : "Bilinmeyen Tarih"
                      }
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h2>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {news.excerpt || news.content?.substring(0, 120) + "..."}
                  </p>
                  <span className="text-primary font-medium text-sm flex items-center gap-1 mt-auto">
                    Devamını Oku &rarr;
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
