
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

// Hardcoded exchange rates with USD as the base. In a real application, these would be fetched from an API.
const sampleExchangeRates: { [key: string]: number } = {
  'USD': 1,
  'EUR': 0.92,
  'JPY': 157.0,
  'GBP': 0.79,
  'AUD': 1.50,
  'CAD': 1.37,
  'CHF': 0.90,
  'CNY': 7.25,
  'INR': 83.5,
  'AED': 3.67,
  'SAR': 3.75,
  'SEK': 10.45,
  'NZD': 1.62,
  'MXN': 17.11,
  'SGD': 1.35,
  'HKD': 7.81,
  'NOK': 10.55,
  'KRW': 1377.51,
  'TRY': 32.27,
  'RUB': 89.05,
  'BRL': 5.15,
  'ZAR': 18.78,
  'DKK': 6.88
};

const currencyToLocaleMap: { [key: string]: string } = {
  'USD': 'en-US',
  'INR': 'en-IN',
  'EUR': 'de-DE', // Euro is used in many countries, de-DE is a safe bet for formatting
  'GBP': 'en-GB',
  'JPY': 'ja-JP',
  'AUD': 'en-AU',
  'CAD': 'en-CA',
  'CHF': 'de-CH',
  'CNY': 'zh-CN',
  'SEK': 'sv-SE',
  'NZD': 'en-NZ',
  'MXN': 'es-MX',
  'SGD': 'en-SG',
  'HKD': 'en-HK',
  'NOK': 'nb-NO',
  'KRW': 'ko-KR',
  'TRY': 'tr-TR',
  'RUB': 'ru-RU',
  'BRL': 'pt-BR',
  'ZAR': 'en-ZA',
  'DKK': 'da-DK',
  'AED': 'ar-AE',
  'SAR': 'ar-SA',
};

const supportedCurrencies = [
  { code: 'USD', name: 'United States Dollar' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound Sterling' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'RUB', name: 'Russian Ruble' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'AED', name: 'United Arab Emirates Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
];


interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatPrice: (priceInUsd: number) => string;
  supportedCurrencies: { code: string; name: string }[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState('USD');
  const [rates, setRates] = useState(sampleExchangeRates);

  // On initial load, try to get currency from local storage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && supportedCurrencies.some(c => c.code === savedCurrency)) {
      setCurrencyState(savedCurrency);
    }
  }, []);
  
  // A real app would fetch rates here, e.g., in a useEffect
  // useEffect(() => {
  //   fetch('https://api.exchangerate-api.com/v4/latest/USD')
  //     .then(res => res.json())
  //     .then(data => setRates(data.rates));
  // }, []);


  const setCurrency = (curr: string) => {
    if (supportedCurrencies.some(c => c.code === curr)) {
      localStorage.setItem('currency', curr);
      setCurrencyState(curr);
    }
  };

  const formatPrice = useCallback((priceInUsd: number): string => {
    const rate = rates[currency] || 1;
    const convertedPrice = priceInUsd * rate;
    const locale = currencyToLocaleMap[currency] || 'en-US'; // Fallback to en-US
    
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(convertedPrice);
    } catch (e) {
        // Fallback for unsupported currencies in Intl.NumberFormat
        console.warn(`Currency ${currency} may not be supported for formatting. Falling back to basic display.`);
        return `${currency} ${convertedPrice.toFixed(2)}`;
    }
  }, [currency, rates]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, supportedCurrencies }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
