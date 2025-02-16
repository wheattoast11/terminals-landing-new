"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  navItems: Array<{ label: string; href: string }>
}

export function Sidebar({ isOpen, onClose, navItems }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-64 bg-background shadow-lg z-50"
            ref={sidebarRef}
            tabIndex={-1}
            aria-label="Sidebar menu"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4">
              <Button variant="ghost" size="icon" onClick={onClose} className="mb-4" aria-label="Close menu">
                <X className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Close menu</span>
              </Button>
              <nav>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block py-2 text-foreground hover:text-primary transition-colors"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

