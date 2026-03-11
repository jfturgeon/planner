// ==========================================
// Config Supabase
// ==========================================

const SUPABASE_URL = 'https://heifenuzqaybzvmketmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlaWZlbnV6cWF5Ynp2bWtldG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODA1ODcsImV4cCI6MjA4ODc1NjU4N30.CWJOkmf8_SXP7KZ1SG-e6xxD4TEXcaH5fIQsBURRdUw';

// ==========================================
// Auth Status
// ==========================================

let currentUser = null;

// Store the Supabase client on window to avoid global variable conflicts
window.supabaseClient = null;

// Initialize Supabase when SDK is loaded
async function initSupabaseClient() {
  try {
    // window.supabase is the Supabase module exported by CDN
    if (!window.supabase) {
      console.error('❌ Supabase SDK not found - ensure SDK script is loaded before supabase.js');
      return false;
    }
    
    // Create client using the SDK module
    if (!window.supabaseClient) {
      console.log('📡 Creating Supabase client...');
      window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ Supabase client created');
    }
    return true;
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
    return false;
  }
}

// Helper to get supabase client
function getSupabaseClient() {
  return window.supabaseClient;
}

async function initAuth() {
  try {
    // Make sure Supabase client is initialized
    if (!window.supabaseClient) {
      const success = await initSupabaseClient();
      if (!success) {
        console.warn('Supabase SDK not loaded yet, retrying...');
        await new Promise(r => setTimeout(r, 500));
        return initAuth(); // Retry
      }
    }

    // Check if Supabase client is initialized
    if (!window.supabaseClient) {
      console.error('Supabase client not initialized');
      showLoginView();
      return;
    }

    // Check if user is already logged in
    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (session) {
      currentUser = session.user;
      showPlannerView();
    } else {
      showLoginView();
    }

    // Listen for auth changes
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      if (session) {
        currentUser = session.user;
        showPlannerView();
      } else {
        currentUser = null;
        showLoginView();
      }
    });
  } catch (error) {
    console.error('Auth init error:', error);
    showLoginView();
  }
}

async function signUp(email, password) {
  try {
    console.log(`👤 Attempting sign up with email: ${email}`);
    
    if (!window.supabaseClient) {
      console.error('❌ Supabase client not initialized');
      return { success: false, error: 'Supabase not initialized' };
    }
    
    console.log('📡 Calling supabase.auth.signUp...');
    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    
    if (error) {
      console.error('❌ Sign up error:', error);
      throw error;
    }

    console.log('✅ Sign up successful!', data);

    // Create user preferences record
    if (data.user) {
      console.log('📝 Creating user preferences...');
      await window.supabaseClient.from('user_preferences').insert({
        user_id: data.user.id,
        current_year: new Date().getFullYear(),
        week_start: 0,
        left_panel_visible: true
      }).throwOnError();
      console.log('✅ User preferences created');
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ Sign up exception:', error.message);
    return { success: false, error: error.message };
  }
}

async function signIn(email, password) {
  try {
    console.log(`🔐 Attempting sign in with email: ${email}`);
    
    if (!window.supabaseClient) {
      console.error('❌ Supabase client not initialized');
      return { success: false, error: 'Supabase not initialized' };
    }
    
    console.log('📡 Calling supabase.auth.signInWithPassword...');
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
    
    console.log('✅ Sign in successful!', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Sign in exception:', error.message);
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    if (!window.supabaseClient) {
      return { success: false, error: 'Supabase not initialized' };
    }
    const { error } = await window.supabaseClient.auth.signOut();
    if (error) throw error;
    currentUser = null;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ==========================================
// Database Functions
// ==========================================

async function savePlannerData(year, data) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data: existing } = await window.supabaseClient
      .from('planner_data')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      const { error } = await window.supabaseClient
        .from('planner_data')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .eq('year', year);
      if (error) throw error;
    } else {
      const { error } = await window.supabaseClient
        .from('planner_data')
        .insert({
          user_id: currentUser.id,
          year,
          data
        });
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving planner data:', error);
    return { success: false, error: error.message };
  }
}

async function loadPlannerData(year) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data, error } = await window.supabaseClient
      .from('planner_data')
      .select('data')
      .eq('user_id', currentUser.id)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data?.data || {} };
  } catch (error) {
    console.error('Error loading planner data:', error);
    return { success: false, error: error.message };
  }
}

async function saveWeeklyData(weekKey, data) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data: existing } = await window.supabaseClient
      .from('weekly_data')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('week_key', weekKey)
      .maybeSingle();

    if (existing) {
      const { error } = await window.supabaseClient
        .from('weekly_data')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .eq('week_key', weekKey);
      if (error) throw error;
    } else {
      const { error } = await window.supabaseClient
        .from('weekly_data')
        .insert({
          user_id: currentUser.id,
          week_key: weekKey,
          data
        });
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving weekly data:', error);
    return { success: false, error: error.message };
  }
}

async function loadWeeklyData(weekKey) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data, error } = await window.supabaseClient
      .from('weekly_data')
      .select('data')
      .eq('user_id', currentUser.id)
      .eq('week_key', weekKey)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data?.data || null };
  } catch (error) {
    console.error('Error loading weekly data:', error);
    return { success: false, error: error.message };
  }
}

async function saveDayExtra(dayKey, events) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data: existing } = await window.supabaseClient
      .from('day_extra')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('day_key', dayKey)
      .maybeSingle();

    if (existing) {
      const { error } = await window.supabaseClient
        .from('day_extra')
        .update({ events, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .eq('day_key', dayKey);
      if (error) throw error;
    } else {
      const { error } = await window.supabaseClient
        .from('day_extra')
        .insert({
          user_id: currentUser.id,
          day_key: dayKey,
          events
        });
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving day extra:', error);
    return { success: false, error: error.message };
  }
}

async function loadDayExtra(dayKey) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data, error } = await window.supabaseClient
      .from('day_extra')
      .select('events')
      .eq('user_id', currentUser.id)
      .eq('day_key', dayKey)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data ? { events: data.events } : { events: [] } };
  } catch (error) {
    console.error('Error loading day extra:', error);
    return { success: false, error: error.message };
  }
}

async function saveHabits(habits) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data: existing } = await window.supabaseClient
      .from('habits')
      .select('id')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (existing) {
      const { error } = await window.supabaseClient
        .from('habits')
        .update({ habits, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id);
      if (error) throw error;
    } else {
      const { error } = await window.supabaseClient
        .from('habits')
        .insert({
          user_id: currentUser.id,
          habits
        });
      if (error) throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving habits:', error);
    return { success: false, error: error.message };
  }
}

async function loadHabits() {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data, error } = await window.supabaseClient
      .from('habits')
      .select('habits')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data?.habits || [] };
  } catch (error) {
    console.error('Error loading habits:', error);
    return { success: false, error: error.message };
  }
}

async function loadPreferences() {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { data, error } = await window.supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) throw error;
    return { success: true, data: data || {} };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return { success: false, error: error.message };
  }
}

async function savePreferences(prefs) {
  try {
    if (!currentUser) throw new Error('No user logged in');

    const { error } = await window.supabaseClient
      .from('user_preferences')
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq('user_id', currentUser.id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error saving preferences:', error);
    return { success: false, error: error.message };
  }
}
