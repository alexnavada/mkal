import Link from "next/link";
import { ArrowRight, MessageSquareHeart, Newspaper, Camera } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/30 pt-24 pb-32 border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            MKAL Topluluk Yayında!
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl">
            Anılarını Paylaş, Okuldan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Haberin Olsun</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            MKAL'e dair en güncel haberler, fotoğraf arşivleri ve isimsiz itiraflar tek bir platformda.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/itiraflar"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <MessageSquareHeart className="w-5 h-5" />
              İtiraf Gönder
            </Link>
            <Link
              href="/fotograflar"
              className="bg-card border border-border hover:border-primary/50 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Fotoğraf Arşivi
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-start transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Newspaper className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Güncel Haberler</h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Okuldaki son etkinlikler, duyurular ve öğrenci başarıları hakkında anında bilgi sahibi ol.
            </p>
            <Link href="/haberler" className="text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all mt-auto">
              Haberleri Oku <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-start transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fotoğraf Arşivi</h3>
            <p className="text-muted-foreground mb-4 flex-1">
              Geçmişten günümüze okul etkinlikleri, mezuniyetler ve özel anların fotoğraf galerisi.
            </p>
            <Link href="/fotograflar" className="text-blue-500 font-medium flex items-center gap-1 hover:gap-2 transition-all mt-auto">
              Arşive Göz At <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-start transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 mb-4">
              <MessageSquareHeart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Anonim İtiraflar</h3>
            <p className="text-muted-foreground mb-4 flex-1">
              İçinde tutma! Kimliğini gizli tutarak düşüncelerini, duygularını ve itiraflarını paylaş.
            </p>
            <Link href="/itiraflar" className="text-pink-500 font-medium flex items-center gap-1 hover:gap-2 transition-all mt-auto">
              İtirafları Gör <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
