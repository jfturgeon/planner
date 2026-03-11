/**
 * =====================================================================
 * SUPABASE MIGRATION - localStorage → Supabase
 * =====================================================================
 * 
 * Script pour migrer complètement les données de localStorage vers Supabase
 * Utilisation: Intégrer dans supabase.js ou exécuter via console
 * 
 * Version: 1.3.4
 * Date: 2026-03-11
 */

/**
 * Migrate all localStorage data to Supabase
 * @param {SupabaseClient} supabaseClient - Instance Supabase
 * @param {Object} currentUser - User object from auth.user()
 * @returns {Promise<Object>} Résultats de la migration
 */
async function migrateAllDataToSupabase(supabaseClient, currentUser) {
  if (!supabaseClient || !currentUser) {
    throw new Error('Supabase client and user required');
  }

  const userId = currentUser.id;
  const results = {
    success: 0,
    errors: 0,
    tables: {},
    startTime: new Date(),
    messages: []
  };

  console.log('🔄 Démarrage migration → Supabase...');

  try {
    // ===== 1. PLANNER DATA =====
    console.log('1️⃣  Migrating planner_data...');
    const plannerData = loadData();
    const year = getYear();
    
    const { error: plannerError } = await supabaseClient
      .from('planner_data')
      .upsert({
        user_id: userId,
        year: year,
        data: plannerData
      });

    if (plannerError) {
      results.errors++;
      results.messages.push(`❌ planner_data: ${plannerError.message}`);
      results.tables.planner_data = 'error';
    } else {
      results.success++;
      results.messages.push(`✅ planner_data: ${year}`);
      results.tables.planner_data = 'success';
    }

    // ===== 2. WEEKLY DATA =====
    console.log('2️⃣  Migrating weekly_data...');
    const weeklyKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('ap_w_'));
    
    let weeklyCount = 0;
    for (const key of weeklyKeys) {
      const weekKey = key.replace('ap_w_', '');
      const weekData = JSON.parse(localStorage.getItem(key) || '{}');

      const { error } = await supabaseClient
        .from('weekly_data')
        .upsert({
          user_id: userId,
          week_key: weekKey,
          data: weekData
        });

      if (!error) weeklyCount++;
    }

    if (weeklyCount > 0) {
      results.success++;
      results.messages.push(`✅ weekly_data: ${weeklyCount} semaines`);
      results.tables.weekly_data = 'success';
    } else {
      results.tables.weekly_data = 'no_data';
    }

    // ===== 3. DAY EVENTS =====
    console.log('3️⃣  Migrating day_events...');
    const dayKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('ap_de_'));
    
    let dayCount = 0;
    for (const key of dayKeys) {
      const dayKey = key.replace('ap_de_', '');
      const dayData = JSON.parse(localStorage.getItem(key) || '{"events":[]}');

      const { error } = await supabaseClient
        .from('day_events')
        .upsert({
          user_id: userId,
          day_key: dayKey,
          data: dayData
        });

      if (!error) dayCount++;
    }

    if (dayCount > 0) {
      results.success++;
      results.messages.push(`✅ day_events: ${dayCount} jours`);
      results.tables.day_events = 'success';
    } else {
      results.tables.day_events = 'no_data';
    }

    // ===== 4. HABITS =====
    console.log('4️⃣  Migrating habits...');
    const habitsData = loadHabits();
    
    if (habitsData && habitsData.length > 0) {
      // Supprimer anciennes entrées
      await supabaseClient
        .from('habits')
        .delete()
        .eq('user_id', userId);

      // Insérer nouvelles habitudes
      const { error: habitsError } = await supabaseClient
        .from('habits')
        .insert(habitsData.map(h => ({
          user_id: userId,
          name: h.name,
          color: h.color || '#2d6bbf'
        })));

      if (habitsError) {
        results.errors++;
        results.messages.push(`❌ habits: ${habitsError.message}`);
        results.tables.habits = 'error';
      } else {
        results.success++;
        results.messages.push(`✅ habits: ${habitsData.length} habitudes`);
        results.tables.habits = 'success';
      }
    } else {
      results.tables.habits = 'no_data';
    }

    // ===== 5. CONTACTS =====
    console.log('5️⃣  Migrating contacts...');
    const contactsData = ctLoadContacts();
    
    if (contactsData && contactsData.length > 0) {
      // Supprimer anciennes entrées
      await supabaseClient
        .from('contacts')
        .delete()
        .eq('user_id', userId);

      // Insérer nouveaux contacts
      const { error: contactsError } = await supabaseClient
        .from('contacts')
        .insert(contactsData.map(c => ({
          user_id: userId,
          first_name: c.fn,
          last_name: c.ln,
          birth_year: c.by,
          birth_month: c.bm,
          birth_day: c.bd,
          death_year: c.dy,
          death_month: c.dm,
          death_day: c.dd,
          tags: c.tags || []
        })));

      if (contactsError) {
        results.errors++;
        results.messages.push(`❌ contacts: ${contactsError.message}`);
        results.tables.contacts = 'error';
      } else {
        results.success++;
        results.messages.push(`✅ contacts: ${contactsData.length} contacts`);
        results.tables.contacts = 'success';
      }
    } else {
      results.tables.contacts = 'no_data';
    }

    // ===== 6. KANBAN STATUSES =====
    console.log('6️⃣  Migrating kanban_statuses...');
    const statuses = kbLoadStatuses();
    
    if (statuses && statuses.length > 0) {
      // Supprimer anciennes entrées
      await supabaseClient
        .from('kanban_statuses')
        .delete()
        .eq('user_id', userId);

      // Insérer
      const { error: statusesError } = await supabaseClient
        .from('kanban_statuses')
        .insert(statuses.map((s, idx) => ({
          user_id: userId,
          status_id: s.id,
          label: s.label,
          color: s.color,
          position: idx
        })));

      if (statusesError) {
        results.errors++;
        results.messages.push(`❌ kanban_statuses: ${statusesError.message}`);
        results.tables.kanban_statuses = 'error';
      } else {
        results.success++;
        results.messages.push(`✅ kanban_statuses: ${statuses.length}`);
        results.tables.kanban_statuses = 'success';
      }
    } else {
      results.tables.kanban_statuses = 'no_data';
    }

    // ===== 7. KANBAN CARDS =====
    console.log('7️⃣  Migrating kanban_cards...');
    const cards = kbLoadCards();
    
    if (cards && cards.length > 0) {
      // Supprimer anciennes entrées
      await supabaseClient
        .from('kanban_cards')
        .delete()
        .eq('user_id', userId);

      // Insérer
      const { error: cardsError } = await supabaseClient
        .from('kanban_cards')
        .insert(cards.map(c => ({
          user_id: userId,
          card_id: c.id,
          title: c.title,
          description: c.desc,
          year: c.year,
          status_id: c.statusId,
          color: c.color,
          position_order: c.order || 999
        })));

      if (cardsError) {
        results.errors++;
        results.messages.push(`❌ kanban_cards: ${cardsError.message}`);
        results.tables.kanban_cards = 'error';
      } else {
        results.success++;
        results.messages.push(`✅ kanban_cards: ${cards.length} objectifs`);
        results.tables.kanban_cards = 'success';
      }
    } else {
      results.tables.kanban_cards = 'no_data';
    }

    // ===== 8. TRACKER EPISODES =====
    console.log('8️⃣  Migrating tracker_episodes...');
    const trackerWatched = trLoadWatched();
    
    let episodeCount = 0;
    for (const [epKey, watched] of Object.entries(trackerWatched)) {
      // Parse: showId_seriesId_sSnEn
      const parts = epKey.split('_');
      if (parts.length >= 4) {
        const showId = parts[0];
        const seriesId = parts[1];
        const s = parseInt(parts[2].replace('s', ''));
        const e = parseInt(parts[3].replace('e', ''));

        const { error } = await supabaseClient
          .from('tracker_episodes')
          .upsert({
            user_id: userId,
            show_id: showId,
            series_id: seriesId,
            season_number: s,
            episode_number: e,
            watched: watched
          });

        if (!error) episodeCount++;
      }
    }

    if (episodeCount > 0) {
      results.success++;
      results.messages.push(`✅ tracker_episodes: ${episodeCount}`);
      results.tables.tracker_episodes = 'success';
    } else {
      results.tables.tracker_episodes = 'no_data';
    }

    // ===== 9. TRACKER SCHEDULE =====
    console.log('9️⃣  Migrating tracker_schedule...');
    const trackerSched = trLoadSched();
    
    let schedCount = 0;
    for (const [dayKey, schedData] of Object.entries(trackerSched)) {
      if (schedData.trek) {
        for (const ep of schedData.trek) {
          const { error } = await supabaseClient
            .from('tracker_schedule')
            .insert({
              user_id: userId,
              day_key: dayKey,
              show_id: 'startrek',
              series_id: ep.sid,
              season_number: ep.sn,
              episode_number: ep.en,
              scheduled_date: dayKey
            });
          if (!error) schedCount++;
        }
      }
    }

    if (schedCount > 0) {
      results.success++;
      results.messages.push(`✅ tracker_schedule: ${schedCount}`);
      results.tables.tracker_schedule = 'success';
    } else {
      results.tables.tracker_schedule = 'no_data';
    }

    // ===== 10. OSCARS WATCHED =====
    console.log('🔟 Migrating oscars_watched...');
    const oscarsWatched = oscarsLoadWatched();
    
    if (Object.keys(oscarsWatched).length > 0) {
      // Supprimer anciennes entrées
      await supabaseClient
        .from('oscars_watched')
        .delete()
        .eq('user_id', userId);

      // Parse: year__filmTitle
      const entries = [];
      for (const [oscKey, watched] of Object.entries(oscarsWatched)) {
        const [year, filmTitle] = oscKey.split('__');
        entries.push({
          user_id: userId,
          year: parseInt(year),
          film_title: filmTitle,
          watched: watched
        });
      }

      const { error: oscarsError } = await supabaseClient
        .from('oscars_watched')
        .insert(entries);

      if (oscarsError) {
        results.errors++;
        results.messages.push(`❌ oscars_watched: ${oscarsError.message}`);
        results.tables.oscars_watched = 'error';
      } else {
        results.success++;
        results.messages.push(`✅ oscars_watched: ${entries.length}`);
        results.tables.oscars_watched = 'success';
      }
    } else {
      results.tables.oscars_watched = 'no_data';
    }

    // ===== 11. APP SETTINGS =====
    console.log('1️⃣1️⃣  Migrating app_settings...');
    
    const { error: settingsError } = await supabaseClient
      .from('app_settings')
      .upsert({
        user_id: userId,
        current_year: year,
        week_start_offset: getWS(),
        compact_view: localStorage.getItem('ap_kb_compact') === 'true',
        notifications_enabled: true,
        auto_backup: true
      });

    if (settingsError) {
      results.errors++;
      results.messages.push(`❌ app_settings: ${settingsError.message}`);
      results.tables.app_settings = 'error';
    } else {
      results.success++;
      results.messages.push(`✅ app_settings`);
      results.tables.app_settings = 'success';
    }

  } catch (err) {
    results.errors++;
    results.messages.push(`❌ Migration error: ${err.message}`);
    console.error('Migration error:', err);
  }

  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;

  console.log('\n📊 Migration Summary:');
  console.log(`   Success: ${results.success}`);
  console.log(`   Errors: ${results.errors}`);
  console.log(`   Duration: ${results.duration}ms`);
  console.log('\nDetailed results:');
  results.messages.forEach(msg => console.log(`   ${msg}`));

  return results;
}

/**
 * Vérifier si la migration est complète
 */
async function verifyMigration(supabaseClient, currentUser) {
  const userId = currentUser.id;
  const year = getYear();

  console.log('\n🔍 Vérification intégrité migration...\n');

  const checks = {
    planner_data: false,
    weekly_data: 0,
    day_events: 0,
    contacts: 0,
    kanban_cards: 0,
    tracker_episodes: 0,
    app_settings: false
  };

  // Vérifier planner_data
  const { data: pd } = await supabaseClient
    .from('planner_data')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .limit(1);
  checks.planner_data = pd && pd.length > 0;

  // Vérifier weekly_data
  const { data: wd } = await supabaseClient
    .from('weekly_data')
    .select('*')
    .eq('user_id', userId);
  checks.weekly_data = wd ? wd.length : 0;

  // Vérifier day_events
  const { data: de } = await supabaseClient
    .from('day_events')
    .select('*')
    .eq('user_id', userId);
  checks.day_events = de ? de.length : 0;

  // Vérifier contacts
  const { data: ct } = await supabaseClient
    .from('contacts')
    .select('*')
    .eq('user_id', userId);
  checks.contacts = ct ? ct.length : 0;

  // Vérifier kanban_cards
  const { data: kc } = await supabaseClient
    .from('kanban_cards')
    .select('*')
    .eq('user_id', userId);
  checks.kanban_cards = kc ? kc.length : 0;

  // Vérifier tracker_episodes
  const { data: te } = await supabaseClient
    .from('tracker_episodes')
    .select('*')
    .eq('user_id', userId);
  checks.tracker_episodes = te ? te.length : 0;

  // Vérifier app_settings
  const { data: as } = await supabaseClient
    .from('app_settings')
    .select('*')
    .eq('user_id', userId)
    .limit(1);
  checks.app_settings = as && as.length > 0;

  // Afficher résultats
  console.log('Results:');
  console.log(`   planner_data: ${checks.planner_data ? '✅' : '❌'}`);
  console.log(`   weekly_data: ${checks.weekly_data} weeks`);
  console.log(`   day_events: ${checks.day_events} days`);
  console.log(`   contacts: ${checks.contacts}`);
  console.log(`   kanban_cards: ${checks.kanban_cards}`);
  console.log(`   tracker_episodes: ${checks.tracker_episodes}`);
  console.log(`   app_settings: ${checks.app_settings ? '✅' : '❌'}`);

  return checks;
}

/**
 * Utilisation dans l'app:
 * 
 * // Au démarrage, après authentification:
 * if (currentUser) {
 *   const results = await migrateAllDataToSupabase(supabase, currentUser);
 *   if (results.errors === 0) {
 *     showToast('✅ Migration complète!');
 *     // Optionnel: Vérifier
 *     await verifyMigration(supabase, currentUser);
 *   } else {
 *     showToast(`⚠️  ${results.errors} erreurs`);
 *   }
 * }
 */

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    migrateAllDataToSupabase,
    verifyMigration
  };
}
