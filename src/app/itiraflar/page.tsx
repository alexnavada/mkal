"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Send, MessageSquareHeart, AlertCircle } from "lucide-react";

interface Confession {
  id: string;
  text: string;
  createdAt: any;
  status: "pending" | "approved";
}

export default function ItiraflarPage() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [newConfession, setNewConfession] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    // Sadece onaylanmış itirafları getir
    const q = query(
      collection(db, "confessions"),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Confession[];

      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });

      setConfessions(data);
    }, (error) => {
      console.error("İtiraflar yüklenirken hata:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfession.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      let userIp = "Bilinmiyor";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {
        console.error("IP alınamadı:", e);
      }

      await addDoc(collection(db, "confessions"), {
        text: newConfession.trim(),
        status: "pending",
        ip: userIp,
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp(),
      });
      setNewConfession("");
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error("İtiraf gönderilirken hata:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
          <MessageSquareHeart className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Anonim İtiraflar</h1>
          <p className="text-muted-foreground">MKAL'e ait itiraflar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Confession Form */}
        <div className="md:col-span-1 bg-card border border-border p-6 rounded-xl sticky top-24">
          <h2 className="text-xl font-bold mb-4">Bir İtiraf Yaz</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32"
              placeholder="Buraya yazabilirsin... (Anonim kalacaksın)"
              value={newConfession}
              onChange={(e) => setNewConfession(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting || !newConfession.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? "Gönderiliyor..." : (
                <>
                  Gönder <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {submitStatus === "success" && (
            <div className="mt-4 p-3 bg-green-500/10 text-green-500 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>İtirafın alındı! Onaylandıktan sonra burada yayınlanacak.</span>
            </div>
          )}
          {submitStatus === "error" && (
            <div className="mt-4 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Bir hata oluştu, lütfen daha sonra tekrar dene.</span>
            </div>
          )}
        </div>

        {/* Confessions List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {confessions.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-xl text-center text-muted-foreground">
              Henüz onaylanmış bir itiraf yok. İlk itiraf eden sen ol!
            </div>
          ) : (
            confessions.map((confession) => (
              <div key={confession.id} className="bg-card border border-border p-5 rounded-xl flex flex-col gap-3 transition-all hover:border-primary/30">
                <p className="text-foreground whitespace-pre-wrap">{confession.text}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-border/40">
                  <span>Anonim</span>
                  <span>
                    {confession.createdAt
                      ? formatDistanceToNow(confession.createdAt.toDate(), { addSuffix: true, locale: tr })
                      : "Az önce"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
