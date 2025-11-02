import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { FileText, Printer, Download, TrendingUp, Target, Calendar, Award, CheckCircle2, AlertTriangle, AlertCircle, Flame, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { MasterCoachReport as ReportData } from '@/lib/masterCoachReport';
import { useState } from 'react';

interface MasterCoachReportProps {
  report: ReportData;
}

export function MasterCoachReport({ report }: MasterCoachReportProps) {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // Future: Generate PDF
    alert('PDF download coming soon!');
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/30';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30';
    if (score >= 50) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };
  
  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };
  
  const getPercentile = (value: string, mlbAvg: string): string => {
    // Simple percentile estimation based on comparison to MLB average
    const val = parseFloat(value);
    const avg = parseFloat(mlbAvg);
    if (isNaN(val) || isNaN(avg)) return 'N/A';
    const diff = ((val - avg) / avg) * 100;
    if (diff > 10) return '95th';
    if (diff > 5) return '85th';
    if (diff > 0) return '70th';
    if (diff > -5) return '55th';
    if (diff > -10) return '40th';
    return '25th';
  };
  
  return (
    <Card className="print:shadow-none">
      <CardHeader className="print:pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Coach Rick Report
            </CardTitle>
            <CardDescription className="mt-2">
              Personalized analysis and 4-week improvement plan
            </CardDescription>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section 1: Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">{report.player_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {report.date} • {report.level}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{report.overview.hits_score}</div>
              <div className="text-xs text-muted-foreground">HITS Score</div>
            </div>
          </div>
          
          <div className="bg-secondary/30 p-4 rounded-lg">
            <p className="text-lg leading-relaxed">
              {report.overview.summary}
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <Badge variant="outline" className="text-sm">
              Tempo: {report.overview.tempo_ratio.toFixed(2)}:1
            </Badge>
            <Badge variant="outline" className="text-sm">
              Style: {report.overview.style}
            </Badge>
          </div>
        </section>
        
        <Separator />
        
        {/* Section 2: The Three Pillars */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            The Three Pillars
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            {/* ANCHOR */}
            {['anchor', 'engine', 'whip'].map((pillarKey) => {
              const pillar = report.pillars[pillarKey as keyof typeof report.pillars];
              const isExpanded = expandedPillar === pillarKey;
              
              return (
                <div key={pillarKey} className={`border-2 rounded-lg p-4 transition-all ${getScoreBg(pillar.score)}`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg uppercase">{pillarKey}</h3>
                      <span className={`text-3xl font-bold ${getScoreColor(pillar.score)}`}>
                        {pillar.score}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getScoreIcon(pillar.score)}
                          <Badge variant={pillar.score >= 90 ? 'default' : pillar.score >= 70 ? 'secondary' : 'destructive'}>
                            {pillar.rating}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">{pillar.score}/100</span>
                      </div>
                      <Progress value={pillar.score} className="h-2" />
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setExpandedPillar(isExpanded ? null : pillarKey)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </Button>
                    
                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t animate-fade-in">
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-2">
                            <Flame className="h-4 w-4 text-green-500" />
                            Strengths:
                          </p>
                          <ul className="space-y-1 mt-2">
                            {pillar.whats_good.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            Opportunities:
                          </p>
                          <ul className="space-y-1 mt-2">
                            {pillar.what_could_be_better.map((item, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        
        <Separator />
        
        {/* Section 3: MLB Comparison */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6" />
            How You Compare to MLB
          </h2>
          
          <div className="space-y-4">
            {report.mlb_comparison.map((metric, i) => {
              const percentile = getPercentile(metric.your_value, metric.mlb_average);
              const yourVal = parseFloat(metric.your_value);
              const mlbAvg = parseFloat(metric.mlb_average);
              const isAboveAverage = !isNaN(yourVal) && !isNaN(mlbAvg) && yourVal >= mlbAvg;
              
              return (
                <div key={i} className="border-2 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold flex items-center gap-2">
                      {isAboveAverage ? <Flame className="h-5 w-5 text-green-500" /> : <Lightbulb className="h-5 w-5 text-yellow-500" />}
                      {metric.name}
                    </h4>
                    <Badge variant={isAboveAverage ? 'default' : 'secondary'}>
                      {percentile} percentile
                    </Badge>
                  </div>
                  
                  {/* Visual comparison bar */}
                  <div className="space-y-2">
                    <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                      {/* Elite range background */}
                      <div className="absolute inset-0 flex items-center px-2 text-xs text-muted-foreground">
                        <span className="absolute left-2">Elite Range</span>
                      </div>
                      {/* Your value indicator */}
                      <div 
                        className={`absolute top-0 bottom-0 w-1 ${isAboveAverage ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ left: '60%' }}
                      >
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap">
                          You: {metric.your_value}
                        </div>
                      </div>
                      {/* MLB average line */}
                      <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400" style={{ left: '50%' }}>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
                          MLB: {metric.mlb_average}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm pt-4">
                    <div>
                      <p className="text-muted-foreground">Your Value</p>
                      <p className={`font-bold text-lg ${isAboveAverage ? 'text-green-500' : 'text-yellow-500'}`}>
                        {metric.your_value}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">MLB Average</p>
                      <p className="font-bold text-lg">{metric.mlb_average}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Elite Range</p>
                      <p className="font-bold text-lg">{metric.elite_range}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm leading-relaxed bg-secondary/30 p-3 rounded-lg">
                    {metric.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
        
        <Separator />
        
        {/* Section 4: Main Message - THE MOST IMPORTANT */}
        <section className="space-y-6 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-blue-500/10 p-6 rounded-xl border-2 border-blue-500/30 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-full bg-blue-500/20 border-2 border-blue-500">
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">🎯 Your #1 Opportunity</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">The one thing that will unlock everything else</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-background p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{report.main_message.primary_opportunity}</h3>
              <p className="leading-relaxed">{report.main_message.why_it_matters}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-lg border-2 border-orange-500/30">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Right Now
                </p>
                <p className="font-bold text-xl text-orange-600">{report.main_message.current_value}</p>
              </div>
              <div className="bg-background p-4 rounded-lg border-2 border-green-500/30">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Elite Target
                </p>
                <p className="font-bold text-xl text-green-600">{report.main_message.elite_value}</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="bg-background p-4 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Expected Improvement:</p>
              <div className="relative">
                <Progress value={60} className="h-4" />
                <div className="absolute top-0 left-0 right-0 h-4 bg-green-500/30 rounded-full" style={{ width: '85%' }} />
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-orange-600 font-medium">Current</span>
                  <span className="text-green-600 font-medium">After Fix ➜</span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-4 rounded-lg">
              <p className="font-semibold flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
                Performance Impact:
              </p>
              <p className="mt-2 font-medium">{report.main_message.performance_impact}</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="font-semibold">The Fix:</p>
                <p className="leading-relaxed">{report.main_message.the_fix}</p>
              </div>
              
              <div>
                <p className="font-semibold">The Feeling:</p>
                <p className="leading-relaxed italic">{report.main_message.the_feeling}</p>
              </div>
              
              <div>
                <p className="font-semibold">The Words:</p>
                <p className="text-lg font-bold text-primary">{report.main_message.the_words}</p>
              </div>
            </div>
            
            <div className="bg-background p-5 rounded-lg border-2 border-blue-500 shadow-md">
              <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                The Drill: {report.main_message.the_drill.name}
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-muted-foreground mb-2">How to do it:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    {report.main_message.the_drill.how_to.map((step, i) => (
                      <li key={i} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="grid md:grid-cols-2 gap-3 pt-3 border-t">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <span className="font-semibold text-muted-foreground block mb-1">Frequency:</span>
                    <span className="font-bold">{report.main_message.the_drill.frequency}</span>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <span className="font-semibold text-muted-foreground block mb-1">Duration:</span>
                    <span className="font-bold">{report.main_message.the_drill.duration}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/10 border-2 border-green-500/30 p-5 rounded-lg">
              <p className="font-semibold mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
                <TrendingUp className="h-5 w-5" />
                What Will Happen:
              </p>
              <ul className="space-y-2">
                {report.main_message.expected_results.map((result, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{result}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        
        <Separator />
        
        {/* Section 5: 4-Week Plan - HIDDEN per user request */}
        
        {/* Section 6: What to Expect */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">What to Expect</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">After 4 Weeks</p>
              <p className="text-muted-foreground">{report.what_to_expect.after_4_weeks}</p>
            </div>
            
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">After 12 Weeks</p>
              <p className="text-muted-foreground">{report.what_to_expect.after_12_weeks}</p>
            </div>
            
            <div className="border-l-4 border-primary pl-4">
              <p className="font-semibold">Long Term</p>
              <p className="text-muted-foreground">{report.what_to_expect.long_term}</p>
            </div>
          </div>
        </section>
        
        <Separator />
        
        {/* Section 7: Summary */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Summary</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-3 flex items-center gap-2">
                <Flame className="h-5 w-5 text-green-500" />
                Your Strengths (Keep Doing These!)
              </p>
              <ul className="grid md:grid-cols-2 gap-3">
                {report.summary.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-blue-500/10 p-5 rounded-lg border-2 border-blue-500/30">
              <p className="font-semibold flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                The ONE Thing to Fix:
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{report.summary.one_thing}</p>
            </div>
            
            <div>
              <p className="font-semibold mb-2">The Cascading Benefits:</p>
              <p className="leading-relaxed">{report.summary.cascading_benefits}</p>
            </div>
            
            <div className="bg-secondary p-6 rounded-lg text-center">
              <p className="text-lg font-semibold leading-relaxed">{report.summary.final_thought}</p>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
