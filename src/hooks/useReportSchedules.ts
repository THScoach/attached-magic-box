import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReportSchedule {
  id: string;
  user_id: string;
  player_id: string | null;
  frequency: string;
  next_generation_date: string;
  last_generated_at: string | null;
  is_active: boolean;
  email_delivery: boolean;
  created_at: string;
  updated_at: string;
}

export interface GeneratedReport {
  id: string;
  user_id: string;
  player_id: string | null;
  schedule_id: string | null;
  report_url: string;
  report_type: string;
  period_start: string;
  period_end: string;
  metrics: any;
  created_at: string;
}

export function useReportSchedules(userId?: string) {
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadSchedules = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (schedulesError) throw schedulesError;

      const { data: reportsData, error: reportsError } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reportsError) throw reportsError;

      setSchedules(schedulesData || []);
      setReports(reportsData || []);
    } catch (error: any) {
      console.error('Error loading schedules:', error);
      toast({
        title: "Failed to Load Schedules",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (schedule: {
    user_id: string;
    player_id?: string | null;
    frequency: string;
    next_generation_date: string;
    is_active?: boolean;
    email_delivery?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .insert(schedule)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Schedule Created",
        description: "Report will be generated automatically based on your schedule.",
      });

      await loadSchedules();
      return data;
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Failed to Create Schedule",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<ReportSchedule>) => {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Schedule Updated",
        description: "Your report schedule has been updated.",
      });

      await loadSchedules();
    } catch (error: any) {
      console.error('Error updating schedule:', error);
      toast({
        title: "Failed to Update Schedule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('report_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Schedule Deleted",
        description: "Report schedule has been removed.",
      });

      await loadSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Failed to Delete Schedule",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateReport = async (playerId: string, periodStart: string, periodEnd: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-automated-report', {
        body: {
          userId: user.id,
          playerId,
          periodStart,
          periodEnd,
          reportType: 'manual'
        }
      });

      if (error) throw error;

      toast({
        title: "Report Generated!",
        description: "Your progress report is ready to view.",
      });

      await loadSchedules();
      return data;
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Failed to Generate Report",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const sendReportEmail = async (reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get report details
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: {
          userId: user.id,
          playerId: report.player_id,
          reportUrl: report.report_url,
          reportType: report.report_type,
          periodStart: report.period_start,
          periodEnd: report.period_end,
          metrics: report.metrics || { totalSwings: 0, avgScore: 0, improvement: 0 },
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent!",
        description: "Report has been sent to your email.",
      });

      return data;
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to Send Email",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [userId]);

  return {
    schedules,
    reports,
    loading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    generateReport,
    sendReportEmail,
    refetch: loadSchedules
  };
}