import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Printer, Download, TrendingUp, Target, Calendar, Award } from 'lucide-react';
import { MasterCoachReport as ReportData } from '@/lib/masterCoachReport';

interface MasterCoachReportProps {
  report: ReportData;
}

export function MasterCoachReport({ report }: MasterCoachReportProps) {
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownload = () => {
    // Future: Generate PDF
    alert('PDF download coming soon!');
  };
  
  return (
    <Card className="print:shadow-none">
      <CardHeader className="print:pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Master Coach Report
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
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* ANCHOR */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">ANCHOR</h3>
                <span className="text-2xl font-bold text-primary">
                  {report.pillars.anchor.score}
                </span>
              </div>
              <Badge>{report.pillars.anchor.rating}</Badge>
              
              <div className="space-y-2 text-sm">
                <p className="font-semibold">What is Good:</p>
                <ul className="space-y-1">
                  {report.pillars.anchor.whats_good.map((item, i) => (
                    <li key={i} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
                
                <p className="font-semibold pt-2">What Could Be Better:</p>
                <ul className="space-y-1">
                  {report.pillars.anchor.what_could_be_better.map((item, i) => (
                    <li key={i} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* ENGINE */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">ENGINE</h3>
                <span className="text-2xl font-bold text-primary">
                  {report.pillars.engine.score}
                </span>
              </div>
              <Badge>{report.pillars.engine.rating}</Badge>
              
              <div className="space-y-2 text-sm">
                <p className="font-semibold">What is Good:</p>
                <ul className="space-y-1">
                  {report.pillars.engine.whats_good.map((item, i) => (
                    <li key={i} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
                
                <p className="font-semibold pt-2">What Could Be Better:</p>
                <ul className="space-y-1">
                  {report.pillars.engine.what_could_be_better.map((item, i) => (
                    <li key={i} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* WHIP */}
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">WHIP</h3>
                <span className="text-2xl font-bold text-primary">
                  {report.pillars.whip.score}
                </span>
              </div>
              <Badge>{report.pillars.whip.rating}</Badge>
              
              <div className="space-y-2 text-sm">
                <p className="font-semibold">What is Good:</p>
                <ul className="space-y-1">
                  {report.pillars.whip.whats_good.map((item, i) => (
                    <li key={i} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
                
                <p className="font-semibold pt-2">What Could Be Better:</p>
                <ul className="space-y-1">
                  {report.pillars.whip.what_could_be_better.map((item, i) => (
                    <li key={i} className="text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <Separator />
        
        {/* Section 3: MLB Comparison */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="h-6 w-6" />
            How You Compare to MLB
          </h2>
          
          <div className="space-y-3">
            {report.mlb_comparison.map((metric, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{metric.name}</h4>
                  <Badge>{metric.your_rank}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Your Value</p>
                    <p className="font-bold">{metric.your_value}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">MLB Average</p>
                    <p className="font-bold">{metric.mlb_average}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Elite Range</p>
                    <p className="font-bold">{metric.elite_range}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">{metric.explanation}</p>
              </div>
            ))}
          </div>
        </section>
        
        <Separator />
        
        {/* Section 4: Main Message - THE MOST IMPORTANT */}
        <section className="space-y-6 bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Coach Rick Says: Your #1 Thing to Work On
          </h2>
          
          <div className="space-y-4">
            <div className="bg-background p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{report.main_message.primary_opportunity}</h3>
              <p className="leading-relaxed">{report.main_message.why_it_matters}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Right Now</p>
                <p className="font-bold">{report.main_message.current_value}</p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Elite Target</p>
                <p className="font-bold text-green-600">{report.main_message.elite_value}</p>
              </div>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
              <p className="font-semibold">Performance Impact:</p>
              <p>{report.main_message.performance_impact}</p>
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
            
            <div className="bg-background p-4 rounded-lg border-2 border-primary">
              <h4 className="font-bold mb-2">The Drill: {report.main_message.the_drill.name}</h4>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">How to do it:</p>
                <ol className="list-decimal list-inside space-y-1">
                  {report.main_message.the_drill.how_to.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <div className="grid md:grid-cols-2 gap-2 pt-2">
                  <div>
                    <span className="font-semibold">Frequency:</span> {report.main_message.the_drill.frequency}
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span> {report.main_message.the_drill.duration}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-900">
              <p className="font-semibold mb-2">What Will Happen:</p>
              <ul className="space-y-1">
                {report.main_message.expected_results.map((result, i) => (
                  <li key={i} className="text-sm">✓ {result}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        
        <Separator />
        
        {/* Section 5: 4-Week Plan */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Your 4-Week Plan
          </h2>
          
          <div className="space-y-6">
            {report.four_week_plan.map((week) => (
              <div key={week.week} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Week {week.week}</h3>
                  <Badge variant="outline">{week.focus}</Badge>
                </div>
                
                <div className="grid gap-2">
                  {week.drills.map((drill, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2 text-sm py-2 border-b last:border-0">
                      <div className="font-semibold">{drill.day}</div>
                      <div>{drill.drill}</div>
                      <div className="text-muted-foreground">{drill.reps}</div>
                      <div className="text-muted-foreground text-xs">{drill.notes}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <Separator />
        
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
              <p className="font-semibold mb-2">Your Strengths (Keep Doing These!):</p>
              <ul className="grid md:grid-cols-2 gap-2">
                {report.summary.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="font-semibold">The ONE Thing to Fix:</p>
              <p className="text-lg font-bold text-primary">{report.summary.one_thing}</p>
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
