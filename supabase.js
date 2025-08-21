const { createClient } = supabase;

const supabaseUrl = "https://yfwlwiizpsoegtqlxkya.supabase.co";
const supabaseKey =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd2x3aWl6cHNvZWd0cWx4a3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3Nzc5NjgsImV4cCI6MjA2ODM1Mzk2OH0.1Ej0spn4jLWvionxea5OVIWKSh_uf54auLU8y5oWoGM";
const supa = createClient(supabaseUrl, supabaseKey);

// Make supa globally accessible
window.supa = supa;
