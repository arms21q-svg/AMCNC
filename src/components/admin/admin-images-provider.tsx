"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchJson } from "@/lib/fetch-json";

export type LibraryImage = {
  id: string;
  url: string;
  altAr: string | null;
  altEn: string | null;
  createdAt: string;
  project?: { slug: string; titleAr: string } | null;
};

type AdminImagesContextValue = {
  images: LibraryImage[];
  loading: boolean;
  loaded: boolean;
  ensureLoaded: () => Promise<void>;
  reload: () => Promise<void>;
  invalidate: () => void;
};

const AdminImagesContext = createContext<AdminImagesContextValue | null>(null);

export function AdminImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchImages = useCallback(async (force = false) => {
    if (!force && loaded) return;

    setLoading(true);
    try {
      const data = await fetchJson<{ images?: LibraryImage[] }>(
        "/api/admin/images?limit=100"
      );
      setImages(data.images || []);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [loaded]);

  const invalidate = useCallback(() => {
    setLoaded(false);
  }, []);

  const value = useMemo(
    () => ({
      images,
      loading,
      loaded,
      ensureLoaded: () => fetchImages(false),
      reload: () => fetchImages(true),
      invalidate,
    }),
    [images, loading, loaded, fetchImages, invalidate]
  );

  return (
    <AdminImagesContext.Provider value={value}>
      {children}
    </AdminImagesContext.Provider>
  );
}

export function useAdminImages() {
  const context = useContext(AdminImagesContext);
  if (!context) {
    throw new Error("useAdminImages must be used within AdminImagesProvider");
  }
  return context;
}

export function useAdminImagesOptional() {
  return useContext(AdminImagesContext);
}
