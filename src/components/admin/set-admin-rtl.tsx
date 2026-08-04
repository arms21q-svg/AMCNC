"use client";

import { useEffect } from "react";

export function SetAdminRtl() {
  useEffect(() => {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    return () => {
      document.documentElement.lang = "ar";
      document.documentElement.dir = "rtl";
    };
  }, []);
  return null;
}
