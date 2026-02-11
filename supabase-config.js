import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const SUPABASE_URL = "https://zvfybnfrjqtoxmnmozxn.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZnlibmZyanF0b3htbm1venhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI0ODEsImV4cCI6MjA4NjMwODQ4MX0.qiA-WX2aBlnTM_VRF2pVe-5DFcTvqf8CAy03sHv6Mwc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
