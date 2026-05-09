"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ShieldAlert, Check, X, Image as ImageIcon, FileText, Loader2, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"itiraflar" | "haberler" | "fotograflar">("itiraflar");

  // Itiraflar State
  const [pendingConfessions, setPendingConfessions] = useState<any[]>([]);
  const [approvedConfessions, setApprovedConfessions] = useState<any[]>([]);

  // Haberler State
  const [allNews, setAllNews] = useState<any[]>([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsImage, setNewsImage] = useState<File | null>(null);
  const [newsUploading, setNewsUploading] = useState(false);

  // Fotograflar State
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basit bir şifre koruması (Gerçek projede environment variable kullanılması önerilir)
    if (password === "Taygayisiktim31") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Hatalı şifre!");
    }
  };

  // Bekleyen itirafları getir
  useEffect(() => {
    if (!isAuthenticated) return;

    const qConfessions = query(collection(db, "confessions"), where("status", "==", "pending"));
    const unsubConfessions = onSnapshot(qConfessions, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setPendingConfessions(data);
    });

    const qApprovedConfessions = query(collection(db, "confessions"), where("status", "==", "approved"));
    const unsubApprovedConfessions = onSnapshot(qApprovedConfessions, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setApprovedConfessions(data);
    });

    const qNews = query(collection(db, "news"));
    const unsubNews = onSnapshot(qNews, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setAllNews(data);
    });

    const qPhotos = query(collection(db, "photos"));
    const unsubPhotos = onSnapshot(qPhotos, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setAllPhotos(data);
    });

    return () => {
      unsubConfessions();
      unsubApprovedConfessions();
      unsubNews();
      unsubPhotos();
    };
  }, [isAuthenticated]);

  // Itiraf İşlemleri
  const handleApproveConfession = async (id: string) => {
    try {
      await updateDoc(doc(db, "confessions", id), { status: "approved" });
    } catch (error) {
      console.error("Hata:", error);
      alert("Onaylanırken hata oluştu.");
    }
  };

  const handleRejectConfession = async (id: string) => {
    if (confirm("Bu itirafı silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "confessions", id));
      } catch (error) {
        console.error("Hata:", error);
        alert("Silinirken hata oluştu.");
      }
    }
  };

  // Haber İşlemleri
  const handleDeleteNews = async (id: string) => {
    if (confirm("Bu haberi silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "news", id));
      } catch (error) {
        console.error("Hata:", error);
        alert("Haber silinirken hata oluştu.");
      }
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return alert("Başlık ve içerik zorunludur.");

    setNewsUploading(true);
    let imageUrl = "";

    try {
      if (newsImage) {
        const formData = new FormData();
        formData.append("image", newsImage);

        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!apiKey) throw new Error("ImgBB API Anahtarı eksik!");

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success) {
          imageUrl = data.data.url;
        } else {
          throw new Error("Resim ImgBB'ye yüklenemedi.");
        }
      }

      await addDoc(collection(db, "news"), {
        title: newsTitle,
        excerpt: newsExcerpt,
        content: newsContent,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      alert("Haber başarıyla eklendi!");
      setNewsTitle("");
      setNewsExcerpt("");
      setNewsContent("");
      setNewsImage(null);
    } catch (error) {
      console.error("Hata:", error);
      alert("Haber eklenirken hata oluştu.");
    } finally {
      setNewsUploading(false);
    }
  };

  // Fotoğraf İşlemleri
  const handleDeletePhoto = async (id: string) => {
    if (confirm("Bu fotoğrafı silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "photos", id));
      } catch (error) {
        console.error("Hata:", error);
        alert("Fotoğraf silinirken hata oluştu.");
      }
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) return alert("Lütfen bir fotoğraf seçin.");

    setPhotoUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", photoFile);

      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
      if (!apiKey) throw new Error("ImgBB API Anahtarı eksik!");

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error("Fotoğraf ImgBB'ye yüklenemedi.");
      }

      const url = data.data.url;

      await addDoc(collection(db, "photos"), {
        title: photoTitle,
        url,
        createdAt: serverTimestamp(),
      });

      alert("Fotoğraf başarıyla yüklendi!");
      setPhotoTitle("");
      setPhotoFile(null);
    } catch (error) {
      console.error("Hata:", error);
      alert("Fotoğraf yüklenirken hata oluştu.");
    } finally {
      setPhotoUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <div className="bg-card border border-border p-8 rounded-2xl max-w-md w-full shadow-lg">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Yönetici Girişi</h1>
            <p className="text-muted-foreground text-center text-sm mt-2">
              Sadece MKAL'in babalari bu panele erişebilir. <br />
              ibandan 200 düşersen sende erişebilirsin.😂
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Şifrenizi girin..."
              className="w-full bg-background border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-medium transition-colors"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold">Admin Paneli</h1>
          <p className="text-muted-foreground mt-1">İçerik yönetimi ve moderasyon</p>
        </div>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
        >
          Çıkış Yap
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="md:w-64 flex flex-col gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("itiraflar")}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeTab === "itiraflar" ? "bg-primary text-primary-foreground font-medium" : "bg-card border border-border hover:bg-muted"}`}
          >
            <ShieldAlert className="w-5 h-5" />
            İtiraf Onayları
            {pendingConfessions.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs py-0.5 px-2 rounded-full">
                {pendingConfessions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("haberler")}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeTab === "haberler" ? "bg-primary text-primary-foreground font-medium" : "bg-card border border-border hover:bg-muted"}`}
          >
            <FileText className="w-5 h-5" />
            Haber Ekle
          </button>
          <button
            onClick={() => setActiveTab("fotograflar")}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeTab === "fotograflar" ? "bg-primary text-primary-foreground font-medium" : "bg-card border border-border hover:bg-muted"}`}
          >
            <ImageIcon className="w-5 h-5" />
            Fotoğraf Yükle
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-card border border-border rounded-2xl p-6 min-h-[500px]">

          {/* İTİRAFLAR TAB */}
          {activeTab === "itiraflar" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Onay Bekleyen İtiraflar</h2>
              {pendingConfessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                  Şu an onay bekleyen itiraf yok.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingConfessions.map((confession) => (
                    <div key={confession.id} className="border border-border rounded-xl p-5 flex flex-col gap-3">
                      <p className="whitespace-pre-wrap">{confession.text}</p>

                      {/* Cihaz Bilgileri */}
                      <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground font-mono">
                        <p><span className="font-semibold">IP:</span> {confession.ip || "Bilinmiyor"}</p>
                        <p className="mt-1 truncate" title={confession.userAgent}><span className="font-semibold">Cihaz:</span> {confession.userAgent || "Bilinmiyor"}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          {confession.createdAt ? formatDistanceToNow(confession.createdAt.toDate(), { addSuffix: true, locale: tr }) : "Bilinmiyor"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectConfession(confession.id)}
                            className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" /> Sil
                          </button>
                          <button
                            onClick={() => handleApproveConfession(confession.id)}
                            className="flex items-center gap-1 text-sm bg-green-500/20 text-green-500 hover:bg-green-500/30 px-3 py-1.5 rounded-md transition-colors font-medium"
                          >
                            <Check className="w-4 h-4" /> Onayla
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-xl font-bold mt-12 mb-6 border-t border-border/50 pt-8">Yayındaki İtiraflar</h2>
              {approvedConfessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  Şu an yayında itiraf yok.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {approvedConfessions.map((confession) => (
                    <div key={confession.id} className="border border-border rounded-xl p-5 flex flex-col gap-3 opacity-80 hover:opacity-100 transition-opacity">
                      <p className="whitespace-pre-wrap">{confession.text}</p>

                      {/* Cihaz Bilgileri */}
                      <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground font-mono">
                        <p><span className="font-semibold">IP:</span> {confession.ip || "Bilinmiyor"}</p>
                        <p className="mt-1 truncate" title={confession.userAgent}><span className="font-semibold">Cihaz:</span> {confession.userAgent || "Bilinmiyor"}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          {confession.createdAt ? formatDistanceToNow(confession.createdAt.toDate(), { addSuffix: true, locale: tr }) : "Bilinmiyor"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectConfession(confession.id)}
                            className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
                          >
                            <X className="w-4 h-4" /> Yayından Kaldır
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HABERLER TAB */}
          {activeTab === "haberler" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Yeni Haber / Duyuru Ekle</h2>
              <form onSubmit={handleAddNews} className="flex flex-col gap-5 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium mb-1">Başlık</label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Haber başlığını girin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kısa Özet (Opsiyonel)</label>
                  <textarea
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-none h-20"
                    placeholder="Ana sayfada görünecek kısa özet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">İçerik</label>
                  <textarea
                    required
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none resize-y h-48"
                    placeholder="Haber detaylarını buraya yazın..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kapak Fotoğrafı (Opsiyonel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewsImage(e.target?.files?.[0] || null)}
                    className="w-full bg-background border border-border rounded-lg p-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsUploading}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {newsUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...</> : "Haberi Yayınla"}
                </button>
              </form>

              <h2 className="text-xl font-bold mt-12 mb-6 border-t border-border/50 pt-8">Mevcut Haberler</h2>
              {allNews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  Henüz haber eklenmemiş.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {allNews.map((n) => (
                    <div key={n.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-3">
                        {n.imageUrl && <img src={n.imageUrl} alt={n.title} className="w-12 h-12 object-cover rounded-md bg-muted" />}
                        <div>
                          <p className="font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground">{n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: tr }) : ""}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteNews(n.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FOTOĞRAFLAR TAB */}
          {activeTab === "fotograflar" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Arşive Fotoğraf Yükle</h2>
              <form onSubmit={handleAddPhoto} className="flex flex-col gap-5 max-w-xl">
                <div>
                  <label className="block text-sm font-medium mb-1">Fotoğraf Başlığı (Opsiyonel)</label>
                  <input
                    type="text"
                    value={photoTitle}
                    onChange={(e) => setPhotoTitle(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Örn: 2024 Mezuniyet Töreni"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fotoğraf Seç</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-background/50 hover:bg-background transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setPhotoFile(e.target?.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {photoFile ? (
                      <div className="text-center">
                        <ImageIcon className="w-10 h-10 text-primary mx-auto mb-2" />
                        <p className="font-medium text-sm">{photoFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(photoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">Tıklayın veya sürükleyin</p>
                        <p className="text-xs">Sadece resim dosyaları</p>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={photoUploading || !photoFile}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {photoUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yükleniyor...</> : "Fotoğrafı Yükle"}
                </button>
              </form>

              <h2 className="text-xl font-bold mt-12 mb-6 border-t border-border/50 pt-8">Mevcut Fotoğraflar</h2>
              {allPhotos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">
                  Henüz fotoğraf eklenmemiş.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {allPhotos.map((p) => (
                    <div key={p.id} className="group relative aspect-square bg-muted rounded-xl overflow-hidden border border-border">
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleDeletePhoto(p.id)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
