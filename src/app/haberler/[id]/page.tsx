"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Calendar, Share2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function HaberDetayPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchNews = async () => {
      try {
        const docRef = doc(db, "news", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNews({ id: docSnap.id, ...docSnap.data() });
        } else {
          router.push("/haberler");
        }
      } catch (error) {
        console.error("Haber detayları alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!news) return null;

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link 
        href="/haberler" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Haberlere Dön
      </Link>

      <div className="flex flex-col gap-6">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          {news.title}
        </h1>

        <div className="flex items-center justify-between py-4 border-y border-border/40 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              {news.createdAt 
                ? format(news.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: tr })
                : "Bilinmeyen Tarih"
              }
            </span>
          </div>
          <button 
            className="flex items-center gap-2 hover:text-foreground transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Bağlantı kopyalandı!");
            }}
          >
            <Share2 className="w-4 h-4" />
            Paylaş
          </button>
        </div>

        {news.imageUrl && (
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-muted my-4">
            <img 
              src={news.imageUrl} 
              alt={news.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-invert prose-lg max-w-none prose-p:leading-relaxed prose-headings:font-bold">
          {/* Basit bir şekilde içeriği gösteriyoruz, normalde MD veya HTML parse edilmeli */}
          {news.content.split('\n').map((paragraph: string, i: number) => (
            paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
          ))}
        </div>
      </div>
    </article>
  );
}
