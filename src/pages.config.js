/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import ClientOverview832 from './pages/ClientOverview832';
import Clients832 from './pages/Clients832';
import FactSheet832 from './pages/FactSheet832';
import Home from './pages/Home';
import NutritionAdmin832 from './pages/NutritionAdmin832';
import NutritionStrategy832 from './pages/NutritionStrategy832';
import CoachingDashboard832 from './pages/CoachingDashboard832';


export const PAGES = {
    "ClientOverview832": ClientOverview832,
    "Clients832": Clients832,
    "FactSheet832": FactSheet832,
    "Home": Home,
    "NutritionAdmin832": NutritionAdmin832,
    "NutritionStrategy832": NutritionStrategy832,
    "CoachingDashboard832": CoachingDashboard832,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};