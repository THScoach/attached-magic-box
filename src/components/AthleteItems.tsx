import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, TrendingUp, Database } from "lucide-react";

interface ExternalData {
  id: string;
  data_source: string;
  session_date: string;
  extracted_metrics: any;
}

interface AthleteItemsProps {
  playerId: string;
  userId: string;
}

export function AthleteItems({ playerId, userId }: AthleteItemsProps) {
  const [externalData, setExternalData] = useState<ExternalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExternalData();
  }, [playerId]);

  const loadExternalData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('external_session_data')
        .select('*')
        .eq('player_id', playerId)
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExternalData(data || []);
    } catch (error) {
      console.error('Error loading external data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('trackman') || lowerSource.includes('rapsodo') || 
        lowerSource.includes('blast') || lowerSource.includes('hittrax')) {
      return <Database className="h-4 w-4" />;
    }
    return <Wrench className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment & Tools Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading data...</p>
          ) : externalData.length > 0 ? (
            <div className="space-y-3">
              {externalData.map((data) => (
                <Card key={data.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(data.data_source)}
                          <Badge variant="secondary">{data.data_source}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(data.session_date).toLocaleDateString()}
                        </p>
                        {data.extracted_metrics && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(data.extracted_metrics).slice(0, 4).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{key}:</span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No equipment data uploaded yet</p>
              <p className="text-xs mt-1">Data from TrackMan, Rapsodo, Blast, HitTrax will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
