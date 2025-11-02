import { supabase } from "@/integrations/supabase/client";
import { addDays, format, startOfWeek } from "date-fns";

interface ScheduleDrillsParams {
  userId: string;
  playerId: string | null;
  drillIds: string[];
  drillNames: string[];
  pillar: "ANCHOR" | "ENGINE" | "WHIP";
  weeksAhead?: number;
  sessionsPerWeek?: number; // 3-5 times per week
}

/**
 * Automatically schedules drills to the calendar 3-5 times per week
 * Distributes evenly across the week (Mon, Wed, Fri, Sat, Sun)
 */
export async function scheduleDrillsToCalendar({
  userId,
  playerId,
  drillIds,
  drillNames,
  pillar,
  weeksAhead = 4,
  sessionsPerWeek = 4 // Default to 4 sessions per week
}: ScheduleDrillsParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Session days: Monday, Wednesday, Friday, Saturday (4 sessions)
    // Or: Monday, Tuesday, Wednesday, Friday, Saturday (5 sessions)
    const sessionDays = sessionsPerWeek === 5 
      ? [1, 2, 3, 5, 6] // Mon, Tue, Wed, Fri, Sat
      : sessionsPerWeek === 3
      ? [1, 3, 5] // Mon, Wed, Fri
      : [1, 3, 5, 6]; // Mon, Wed, Fri, Sat (default 4)

    const calendarItems = [];
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday

    for (let week = 0; week < weeksAhead; week++) {
      for (let dayIndex = 0; dayIndex < sessionDays.length; dayIndex++) {
        const dayOfWeek = sessionDays[dayIndex];
        const scheduledDate = addDays(startDate, week * 7 + dayOfWeek);
        
        // Rotate through drills
        const drillIndex = (week * sessionDays.length + dayIndex) % drillIds.length;
        const drillId = drillIds[drillIndex];
        const drillName = drillNames[drillIndex];

        calendarItems.push({
          user_id: userId,
          player_id: playerId,
          item_type: 'training',
          title: `${pillar} Training: ${drillName}`,
          description: `Focus drill for ${pillar} pillar development. Complete this drill session as part of your training plan.`,
          scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
          scheduled_time: '17:00', // Default to 5 PM
          duration: 30, // 30 minutes
          status: 'pending',
          metadata: {
            drill_id: drillId,
            pillar: pillar,
            auto_scheduled: true
          }
        });
      }
    }

    // Batch insert all calendar items
    const { error } = await supabase
      .from('calendar_items')
      .insert(calendarItems);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error scheduling drills to calendar:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to schedule drills' 
    };
  }
}

/**
 * Fetches drills by pillar from the database
 */
export async function getDrillsByPillar(pillar: "ANCHOR" | "ENGINE" | "WHIP", limit: number = 5) {
  try {
    const { data, error } = await supabase
      .from('drills')
      .select('*')
      .eq('pillar', pillar)
      .order('difficulty', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { success: true, drills: data || [] };
  } catch (error: any) {
    console.error('Error fetching drills:', error);
    return { 
      success: false, 
      drills: [],
      error: error.message 
    };
  }
}
