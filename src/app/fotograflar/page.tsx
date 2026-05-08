"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Camera, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  title: string;
  createdAt: any;
}

export default function FotograflarPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Photo[];
      setPhotos(data);
      setLoading(false);
    }, (error) => {
      console.error("Fotoğraflar yüklenirken hata:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Fotoğraf Arşivi</h1>
          <p className="text-muted-foreground">Okuldan en güzel kareler.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-xl text-center text-muted-foreground">
          Henüz fotoğraf yüklenmemiş.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              className="group relative aspect-square bg-muted rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              {/* Note: In a real app we should use Next.js Image component, but regular img is fine if domains aren't configured */}
              <img 
                src={photo.url} 
                alt={photo.title || "Fotoğraf"} 
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium truncate">{photo.title || "İsimsiz Fotoğraf"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(null);
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <img 
            src={selectedPhoto.url} 
            alt={selectedPhoto.title || "Fotoğraf Detayı"} 
            className="max-w-full max-h-[90vh] object-contain rounded-md"
            onClick={(e) => e.stopPropagation()} // Resme tıklayınca kapanmasın
          />
          {selectedPhoto.title && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white text-sm">
              {selectedPhoto.title}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
