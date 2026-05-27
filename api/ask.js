import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, scheduleCSV, today } = req.body;
  if (!question) return res.status(400).json({ error: "Missing question" });

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const teamRef = `
Team URL Reference (GC = web.gc.com/teams/{ID}/schedule, USSSA = usssa.com/fastpitch/teamHome/?teamID={ID}):
OLC JV Falcons: GC=6INa8jRXXSkL
OLC Varsity Falcons: GC=kT1L0JpPMNTq
Shockwaves 16U: GC=Kj2XMuYbN7hC, USSSA=3287164
STARS Goss 16U: GC=tVsrOQgUknJI, USSSA=3275990
MD Stars Fastpitch DiM/Parson: GC=QIaPMpW5X4a9, USSSA=3323120
MD Stars Fastpitch 2029: GC=mlnElpOhkK5q
Green Wave 14U: GC=Jywdg65LyJ9d, USSSA=3278942
Lady Jackets 14B: GC=aFqm2RprbzeI, USSSA=3286889
Lady Jackets 16B: GC=cMBx3VMn1ljb, USSSA=3294634
MD Heartbreakers 16U: GC=Ysu91toVIK1i
Olney Cougars 16U Anderson: GC=AcRaRViqzzW4, USSSA=3293685
Olney Cougars 18U: GC=c2j8wp78F4E3, USSSA=3292730
BCC Flash: GC=XKNsbMzlZFCT, USSSA=3288976
Freedom Firebirds-Petry: GC=UzNkT3EtT07X, USSSA=3291417
MD Crush National 18U: GC=1LQ6OrNgJBHj
Olney Cougars 13U: GC=lOgPBdtUcYPH, USSSA=3290870
Olney Cougars 14U Richardson: GC=WYkRU5nkcDWr, USSSA=3281448
Chesapeake Wave 16U: GC=RUICDJUS0xnN, USSSA=3292658
VA Glory MoCo 12U: GC=Dr3bfiL7eiD2, USSSA=3321128
Maryland InteGRITy 2014 11UB: GC=0eeB5WGREX13, USSSA=3282722
Maryland InteGRITy 13U: GC=wbSHwhzi4RlK, USSSA=3286813
Maryland Fever 12U Miller: GC=D7acJsR8JmC8, USSSA=3274232
Shockwaves 13U: GC=VyesU37LDftc, USSSA=3295001
EC Bullets Moreland 12U: GC=AvsmjXALaaZ7, USSSA=3265622
Damascus Lady Jackets 12U: GC=AOIWpwzYpkEc, USSSA=3301646
Shockwaves 11U: GC=7gCpsd5PdpG1, USSSA=3291463`;

  const systemPrompt = `You are a helpful assistant for a youth softball schedule tracking app for Our Lady of Good Counsel High School (GC) players and their travel teams. Today is ${today || "unknown"}.

Players marked (GC) are current OLC Good Counsel High School students. Players with grade numbers like (7), (8), (9) are in those grades at other schools.

${teamRef}

Here is the complete upcoming schedule (CSV format — columns: Player, Division, Team, Date, Day, Opponent, Home/Away, Time, Location):

${scheduleCSV || "No schedule data available."}

Answer questions about player schedules, team names, team URLs, locations, and tournament information. Be concise and use bullet points or tables where helpful. For games, always include date, day, time, opponent, and location when available. Format dates as "Mon May 23" style.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: question }],
  });

  res.json({ answer: message.content[0].text });
}
