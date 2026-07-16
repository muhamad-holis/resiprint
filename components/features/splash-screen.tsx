"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer } from "lucide-react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("resiprint:splashShown");
    if (alreadyShown) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("resiprint:splashShown", "1");
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-primary-600 to-primary-800"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 shadow-soft-lg backdrop-blur-sm"
          >
            <Printer className="h-10 w-10 text-white" strokeWidth={2.2} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-white">
              Resi<span className="text-primary-200">Print</span>
            </h1>
            <p className="mt-1 text-sm text-primary-100">Cetak Resi Marketplace Lebih Mudah</p>
          </motion.div>
          <motion.div
            className="mt-4 h-1 w-32 overflow-hidden rounded-full bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-white"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
