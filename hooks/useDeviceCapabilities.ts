"use client"

import { useState, useEffect } from "react"

export const useDeviceCapabilities = () => {
  const [isLowPerfDevice, setIsLowPerfDevice] = useState(false)

  useEffect(() => {
    const checkPerformance = () => {
      // This is a simple check. You might want to use more sophisticated methods
      // depending on your specific requirements.
      const isLowPerf =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768 ||
        (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)

      setIsLowPerfDevice(isLowPerf || false)
    }

    checkPerformance()
    window.addEventListener("resize", checkPerformance)

    return () => window.removeEventListener("resize", checkPerformance)
  }, [])

  return { isLowPerfDevice }
}

