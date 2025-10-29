import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users } from "lucide-react";

const modelPlayers = [
  {
    first_name: "Shohei",
    last_name: "Ohtani",
    height: 76, // 6'4"
    weight: 210,
    position: "P/DH",
    handedness: "L",
    birth_date: "1994-07-05",
    jersey_number: "17",
  },
  {
    first_name: "Freddie",
    last_name: "Freeman",
    height: 77, // 6'5"
    weight: 220,
    position: "1B",
    handedness: "L",
    birth_date: "1989-09-12",
    jersey_number: "5",
  },
  {
    first_name: "Aaron",
    last_name: "Judge",
    height: 79, // 6'7"
    weight: 282,
    position: "RF",
    handedness: "R",
    birth_date: "1992-04-26",
    jersey_number: "99",
  },
  {
    first_name: "Kyle",
    last_name: "Tucker",
    height: 76, // 6'4"
    weight: 190,
    position: "RF",
    handedness: "L",
    birth_date: "1997-01-17",
    jersey_number: "30",
  },
  {
    first_name: "Luis",
    last_name: "Arraez",
    height: 71, // 5'11"
    weight: 175,
    position: "1B",
    handedness: "L",
    birth_date: "1997-04-09",
    jersey_number: "4",
  },
];

export function SeedModelPlayers() {
  const seedPlayers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in first");
      return;
    }

    try {
      const playersToInsert = modelPlayers.map(player => ({
        ...player,
        user_id: user.id,
        is_model: true,
        team_name: "MLB Models",
        organization: "Major League Baseball"
      }));

      const { error } = await supabase
        .from("players")
        .insert(playersToInsert);

      if (error) {
        console.error("Error seeding players:", error);
        toast.error("Failed to add model players");
        return;
      }

      toast.success(`Added ${modelPlayers.length} model players!`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add model players");
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Model Players</h3>
          <p className="text-sm text-muted-foreground">
            Add MLB stars as demo players
          </p>
        </div>
        <Button onClick={seedPlayers} variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Add Models
        </Button>
      </div>
    </Card>
  );
}
