import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle2, AlertTriangle, Activity, Ruler, Zap } from 'lucide-react';
import { FrameJointData } from '@/lib/poseAnalysis';

interface JointDataViewerProps {
  frameData: FrameJointData[];
  videoWidth: number;
  videoHeight: number;
}

export function JointDataViewer({ frameData, videoWidth, videoHeight }: JointDataViewerProps) {
  const [selectedFrame, setSelectedFrame] = useState(frameData.length > 0 ? frameData[Math.floor(frameData.length / 2)] : null);
  
  if (!selectedFrame || frameData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Joint Data Analysis</CardTitle>
          <CardDescription>No joint tracking data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Pose detection was not enabled for this analysis. Re-analyze the video to capture joint data.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusIcon = (status: 'optimal' | 'warning' | 'danger') => {
    switch (status) {
      case 'optimal':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'danger':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getStatusBadge = (status: 'optimal' | 'warning' | 'danger') => {
    const variants = {
      optimal: 'default',
      warning: 'secondary',
      danger: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Joint Data Analysis
        </CardTitle>
        <CardDescription>
          Frame {selectedFrame.frame_number} ({selectedFrame.timestamp.toFixed(0)}ms) - {selectedFrame.phase?.toUpperCase() || 'UNKNOWN'} Phase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="angles" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="angles">
              <Ruler className="h-4 w-4 mr-2" />
              Angles
            </TabsTrigger>
            <TabsTrigger value="velocities">
              <Zap className="h-4 w-4 mr-2" />
              Velocities
            </TabsTrigger>
            <TabsTrigger value="positions">
              <Activity className="h-4 w-4 mr-2" />
              Positions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="angles" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {selectedFrame.angles.map((angle) => (
                  <div key={angle.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(angle.status)}
                        <h4 className="font-semibold text-sm">
                          {angle.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        {getStatusBadge(angle.status)}
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        {angle.angle.toFixed(1)}°
                      </span>
                    </div>
                    
                    {angle.optimal_min !== undefined && angle.optimal_max !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Optimal: {angle.optimal_min}° - {angle.optimal_max}°</span>
                          <span>
                            {angle.angle < angle.optimal_min ? `${(angle.optimal_min - angle.angle).toFixed(1)}° below` :
                             angle.angle > angle.optimal_max ? `${(angle.angle - angle.optimal_max).toFixed(1)}° above` :
                             'Within range'}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              angle.status === 'optimal' ? 'bg-green-500' :
                              angle.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (angle.angle / 180) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="velocities" className="mt-4">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joint</TableHead>
                    <TableHead>Velocity (m/s)</TableHead>
                    <TableHead>Direction X</TableHead>
                    <TableHead>Direction Y</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedFrame.velocities.map((velocity) => (
                    <TableRow key={velocity.name}>
                      <TableCell className="font-medium">
                        {velocity.name.replace(/_velocity$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        <Badge variant={velocity.velocity > 2 ? 'default' : 'secondary'}>
                          {velocity.velocity.toFixed(2)} m/s
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {velocity.direction.x.toFixed(3)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {velocity.direction.y.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="positions" className="mt-4">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joint</TableHead>
                    <TableHead>X (px)</TableHead>
                    <TableHead>Y (px)</TableHead>
                    <TableHead>Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(selectedFrame.joints).map(([name, position]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">
                        {name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {position.x.toFixed(1)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {position.y.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={position.confidence > 0.8 ? 'default' : position.confidence > 0.5 ? 'secondary' : 'destructive'}>
                          {(position.confidence * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        {/* Frame selector */}
        <div className="mt-6 border-t pt-4">
          <label className="text-sm font-medium mb-2 block">Select Frame to Analyze</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={frameData.length - 1}
              value={frameData.indexOf(selectedFrame)}
              onChange={(e) => setSelectedFrame(frameData[parseInt(e.target.value)])}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Frame {selectedFrame.frame_number} / {frameData[frameData.length - 1].frame_number}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 mt-3">
            {['stance', 'load', 'stride', 'fire', 'contact', 'follow_through'].map((phase) => {
              const phaseFrame = frameData.find(f => f.phase === phase);
              return phaseFrame ? (
                <Button
                  key={phase}
                  variant={selectedFrame.phase === phase ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFrame(phaseFrame)}
                  className="text-xs"
                >
                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                </Button>
              ) : null;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
