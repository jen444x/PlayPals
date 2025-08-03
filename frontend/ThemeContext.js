// ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference when app starts
  useEffect(() => {
    const loadDarkModePreference = async () => {
      try {
        const value = await AsyncStorage.getItem("darkMode");
        if (value !== null) {
          setIsDarkMode(value === "true"); // AsyncStorage saves strings
        }
      } catch (error) {
        console.log("Failed to load dark mode:", error);
      }
    };

    loadDarkModePreference();
  }, []);

  // Save dark mode preference whenever it changes
  useEffect(() => {
    const saveDarkModePreference = async () => {
      try {
        await AsyncStorage.setItem("darkMode", isDarkMode.toString());
      } catch (error) {
        console.log("Failed to save dark mode:", error);
      }
    };

    saveDarkModePreference();
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

