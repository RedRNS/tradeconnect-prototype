import { create } from 'zustand'

const useUMKMStore = create((set, get) => ({
  umkmName: 'Kopi Nusantara Sejahtera',
  onboardingDone: false,
  selectedBuyerId: null,
  onboardingData: {
    legal: {
      nib: '',
      verificationStatus: 'idle',
      verificationError: '',
      businessName: '',
      kbli: '',
      businessScale: '',
    },
    product: {
      productName: '',
      productDescription: '',
      hsCode: '',
      hsStatus: 'idle',
      monthlyCapacity: '',
      moq: '',
      priceRangeUsd: '',
      photoName: '',
      photoPreview: '',
    },
    exportCapability: {
      hasExportExperience: false,
      logisticsReadiness: 'Laut',
      certifications: [],
      paymentMethod: 'T/T',
    },
    score: 0,
  },
  setUMKMName: (name) => set({ umkmName: name }),
  setSelectedBuyer: (buyerId) => set({ selectedBuyerId: buyerId }),
  updateOnboardingField: (section, field, value) =>
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        [section]: {
          ...state.onboardingData[section],
          [field]: value,
        },
      },
    })),
  updateOnboardingScore: (score) =>
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        score,
      },
    })),
  toggleCertification: (certification) =>
    set((state) => {
      const current = state.onboardingData.exportCapability.certifications
      const exists = current.includes(certification)
      return {
        onboardingData: {
          ...state.onboardingData,
          exportCapability: {
            ...state.onboardingData.exportCapability,
            certifications: exists
              ? current.filter((item) => item !== certification)
              : [...current, certification],
          },
        },
      }
    }),
  completeOnboarding: () => {
    const currentName = get().umkmName
    set({ onboardingDone: currentName.trim().length > 0 })
  },
}))

export default useUMKMStore