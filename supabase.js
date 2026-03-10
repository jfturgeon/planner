// ==========================================
// Config Supabase
// ==========================================

const SUPABASE_URL = 'https://heifenuzqaybzvmketmy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlaWZlbnV6cWF5Ynp2bWtldG15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODA1ODcsImV4cCI6MjA4ODc1NjU4N30.CWJOkmf8_SXP7KZ1SG-e6xxD4TEXcaH5fIQsBURRdUw';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// Auth Status
// ==========================================

let currentUser = null;

async function initAuth() {
  try {
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      currentUser = session.user;
      showPlannerView();
    } else {
      showLoginView();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;

    // Create user preferences record
    if (data.user) {
      await supabase.from('user_preferences').insert({
        user_id: data.user.id,
        current_year: new Date().getFullYear(),
        week_start: 0,
        left_panel_visible: true
      }).throwOnError();
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
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

    const { data: existing } = await supabase
      .from('planner_data')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('year', year)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('planner_data')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .eq('year', year);
      if (error) throw error;
    } else {
      const { error } = await supabase
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

    const { data, error } = await supabase
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

    const { data: existing } = await supabase
      .from('weekly_data')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('week_key', weekKey)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('weekly_data')
        .update({ data, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .eq('week_key', weekKey);
      if (error) throw error;
    } else {
      const { error } = await supabase
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

    const { data, error } = await supabase
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

    const { data: existing } = await supabase
      .from('day_extra')
      .select('id')
      .eq('user_id', currentUser.id)
      .eq('day_key', dayKey)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('day_extra')
        .update({ events, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id)
        .eq('day_key', dayKey);
      if (error) throw error;
    } else {
      const { error } = await supabase
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

    const { data, error } = await supabase
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

    const { data: existing } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('habits')
        .update({ habits, updated_at: new Date().toISOString() })
        .eq('user_id', currentUser.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
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

    const { data, error } = await supabase
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

    const { data, error } = await supabase
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

    const { error } = await supabase
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
