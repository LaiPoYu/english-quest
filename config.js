// Cloud sync settings (Supabase). Leave empty to run in local-only mode.
// Both values are safe to publish: the anon key is a public key, and the
// database's Row Level Security only lets each user read/write their own progress.
window.EQ_CONFIG = {
  supabaseUrl: 'https://qlmyazaxztnnzohpxfvi.supabase.co',
  supabaseAnonKey: 'sb_publishable_4fyhBDEC8JpcisKLBpyDNQ_uCb2Eaiu', // publishable (public) key
};
