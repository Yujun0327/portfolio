// Real project content, keyed by anchor id (see data/anchors.js).
// Order: mountains 1-4 (Env Science), towers 5-8 (Policy), islands 9-12
// (Education), ships = activities, whale = awards.

const FRAMES = { mountain: 3, tower: 3, island: 4, ship: 3, whale: 7 }
const CATEGORY = {
  mountain: 'Environmental Science',
  tower: 'Policy',
  island: 'Education',
  ship: 'Activity',
  whale: 'Awards',
}

const AWARDS = [
  'Finalist — Games for Change Student Challenge (Environment), ~4 of 1000+ gamified interventions worldwide (EcoQuest)',
  '1st Place — Korea SW Future Filling Software Competition, Ministry of Science and ICT Minister’s Award (CCMK)',
  'Platinum — USA Computing Olympiad (top 3–6% of participants)',
  'Honor — Korea Entrepreneurship Competition, 20 of 600+ submissions (SpiralPanels)',
  'Silver Medal — American Computer Science League (ACSL), 1st Place in Korean Division',
  'Gold (Korea) & Bronze (International) — Genius Olympiad (SpiralPanels)',
  'EARCOS Global Citizenship Award — 1 per school',
].join('\n')

const CONTENT = {
  // --- mountains: Environmental Science (1-4) ---
  'mtn-0': {
    title: 'SpiralPanels',
    blurb: `I first began SpiralPanels with a simple frustration: solar panels are clean, but they still demand too much land. To address this, I designed a multi-layer solar energy system that increases energy output per area by stacking panels vertically and using reflective structures to reduce shadow loss.

Since then, I have built SpiralPanels with the Kyungpook University lab, filed a pending Korean patent, and validated the system with feedback from professors across Beijing University, Keimyung University, Harbin Institute of Technology, and more. Our testing showed up to 5 times higher output per area and 4 times lower land use compared to conventional solar layouts. Today, SpiralPanels is being serviced on more than 20 local streets, while I continue preparing our validation paper for MDPI Energy and presentation at the Europe MILSET Expo.`,
  },
  'mtn-1': {
    title: 'VerdantWeb Intl.',
    blurb: `I founded VerdantWeb after noticing that many organizations doing meaningful environmental or social work lacked the technical infrastructure to present their work clearly or reach more people. Handling design, servers, deployment, and long-term maintenance as the lead developer, I have serviced over 20 websites, including portfolios, organization introduction pages, and specialized applications. Our clients include the Korea University Civic Political Living Lab, Dagyeong Hong (env. activist), Jijibae (env. org.), Redi (ocean env. org.), etc. VerdantWeb was also funded 6M won by Keimyung Univ to create a green credit app (CCMK). Through VerdantWeb, I have come to see web development not only as a technical skill but as a way to make public-interest work easier to find, use, and sustain.`,
  },
  'mtn-2': {
    title: 'Ecolution',
    blurb: `As vice president of Ecolution, I help turn local sustainability into hands-on youth action. Through "Rebrewing Daegu," I collect used coffee grounds from local cafés, dry and mix them into biofertilizer, and help test it against plain soil in the DIS garden in collaboration with the Daegu Metropolitan Agricultural Technology Center. We then donate the fertilizer to local farmers and school gardens, turning café waste into a practical resource for soil health.

I also help produce Ecolution’s monthly podcast, "Echo-lution," where we discuss climate, community, and change, using student voice to make environmental action feel local and doable.`,
  },
  'mtn-3': {
    title: 'Research',
    blurb: `As a born-to-be computer enthusiast, I have always been interested in using engineering and machine learning to study real-world problems more directly.

I built PressurePoint, an IoT wheelchair system that detects tilt, posture, and falls; Project Signify, a 99%-accurate ASL/KSL recognition model built from a custom dataset; and Dalseong AI, a 97%-accurate model classifying 10 species’ calls for real-time biodiversity monitoring at Dalseong Wetland. Alongside these projects, I have also conducted comparative energy-output tests for SpiralPanels, treating research not as a paper alone, but as a cycle of field data, prototype, validation, and public use.`,
  },

  // --- towers: Policy (5-8) ---
  'twr-0': {
    title: 'Student Union',
    blurb: `After noticing that student concerns often disappeared before reaching decision-makers, I helped rebuild our High School Student Council into the school’s first formal student-administration communication pipeline. I revised the HSSC constitution, created a new opinion collection system, and turned student feedback into proposals that administrators could realistically consider.

Since then, the Student Union has collected over 300 student opinions, delivered more than 50 formal requests, and helped implement over 40 changes, including improvements to internet restrictions, vape education, science equipment access, and gender-neutral uniform and bathroom policies. Through this work, I learned that student government is not only about representing complaints, but about translating scattered concerns into policy language that institutions can act on.`,
  },
  'twr-1': {
    title: 'Amnesty International',
    blurb: `As one of five Korean youth delegates to Amnesty International and the only high school representative, I became interested in how human rights policy is debated beyond the school level.

I led over 30 students in a Climate Awareness Journalism Group, hosted weekly discussions on climate justice, and oversaw more than 50 student entries connecting environmental issues with human rights. I also contributed to Amnesty’s Asian-Pacific Regional Assembly, where I participated in discussions on motions such as grey-zone tactics, anti-authoritarianism, and boycott strategy. Beyond internal policy work, I have spoken as a student panelist at public events with professors, environmental activists, and social-impact leaders, learning how advocacy moves between journalism, public dialogue, and institutional decision-making.`,
  },

  'twr-2': {
    title: 'OASIS',
    blurb: `I founded OASIS(Open Access Student Inclusion System) after realizing that many student leaders wanted to improve representation at their schools but did not know how to build a real communication system with administrators. Rather than keeping my school’s Student Union model as a one-time project, I turned it into an open-access student governance toolkit.

OASIS now includes more than 60 tutorial episodes, self-assessments, and customizable pipeline templates for students interested in representation and student-administration communication. Through the Student Governance Advisory Program, we have also connected with students from more than three schools around the world, teaching them one-on-one how to adapt the platform to their own school culture and build more sustainable systems for student voice.`,
  },
  'twr-3': {
    title: 'DIS E&S Report',
    blurb: `After studying corporate ESG reports, I wanted to see whether a similar model could help students evaluate their own school community. I brought together six lunch clubs to create the DIS Equity & Sustainability Report, a 117-page student-led report on environmental sustainability, gender equality, racial inclusion, LGBTQ+ rights, disability inclusion, and student representation. The report combined student input, club research, and policy recommendations and was presented directly to the administration, securing the first student input system prior to the school decision release for the Student Union.`,
  },

  // --- islands: Education (9-12) ---
  'isl-0': {
    title: 'JAY Solution',
    blurb: `I founded JAY Solution to make peer tutoring more consistent, accessible, and student-led. Instead of offering occasional help before tests, we built a regular tutoring system with mock tests, worksheets, answer keys, live sessions, Q&A support, and one-on-one mentoring through jaysolution.com.

Over time, JAY Solution has reached more than 100 tutees across four grade levels. We have also volunteered at a youth academy for three years, teaching over 40 elementary students with a self-created curriculum modeled after international school book clubs. To make peer-tutoring more accessible, JAYSOL is traveling across South Korea today to host one-day workshops around international schools.`,
  },
  'isl-1': {
    title: 'EcoQuest',
    blurb: `I started EcoQuest because I wanted environmental education to feel less like a lecture and more like something students could actively participate in. As Founder and COO, I designed and programmed a match-3 energy literacy game where students reduce classroom electricity use by learning how appliances consume power and how behavior affects emissions.

After testing EcoQuest with 26 students at a youth academy, we found 2.3 times higher electricity literacy and 4.4 times stronger environmental education perception. Since then, we developed a waste-reduction version with the Korea National Park Service and tested it with 100+ people. Today, EcoQuest serves 300+ monthly active users, submitted research to IEEE Access, and acquired $60,000 from a carbon management firm to launch in 250 schools across South Korea.`,
  },
  'isl-2': {
    title: 'CSCC',
    blurb: `As president of the CSCC(Computer Science Competition Club), I worked to make competitive programming less intimidating for students who were interested in coding but did not know where to begin. I provided weekly lessons and videos, led preparation for USACO, ACSL, and CCC, and authored a 50-page Python guidebook built around project-based learning and responsible AI use.

The club grew to more than 30 members and ranked in the top 1 out of 100+ ACSL teams for three consecutive years. Based on such programming insight, we also took part in our school’s AI focus group and contributed student perspectives to the inaugural secondary school AI policy.`,
  },
  'isl-3': {
    title: 'SHARED ASCENT',
    blurb: `After running JAY Solution, I realized that peer tutoring was often treated as a service project rather than a system that other students could learn to build. SHARED ASCENT is a 160-page guidebook on starting peer-tutoring, revealing the structure behind our work: how to recruit tutors, design sessions, create mock tests and worksheets, manage younger students, and communicate with administrators. Through SHARED ASCENT, I am trying to make peer tutoring less dependent on one founder or one school, and more of a transferable model that students can adapt to their own communities.`,
  },

  // --- ships: Activities (1-3) ---
  'shp-0': {
    title: 'NCHS',
    blurb: `As the president of the NCHS(National Chinese Honor Society), I organize Chinese cultural events, produce our "Daily Chinese" video series, and partner with SOAR to host schoolwide discussions on anti-Chinese sentiment. Through these projects, I work to make language learning not only academic, but also cultural, personal, and connected to inclusion.`,
  },
  'shp-1': {
    title: 'Cross Country',
    blurb: `After losing 20kg from running, what started as a personal challenge became one of my strongest commitments. As our school’s cross country team captain, I lead our team to 10K races, half-marathons, and SKAIS tournaments, earning a league victory and more than 5 medals in SKAIS competitions, and over 6 medals in public road races.`,
  },
  'shp-2': {
    title: 'Concert Band & Rock Band',
    blurb: `As a musician, I perform in both rock band and concert band. In rock band, I play bass, guitar, and occasionally rap at school assemblies, community festivals, and public stages such as Lotte Mall. In concert band, I serve as first clarinet and was selected as one of 18 clarinetists from international schools across Korea, performing at KIMEA.`,
  },

  // --- whale: Awards ---
  whale: { title: 'Awards', blurb: AWARDS },
}

// Real carousel images. Drop files into
//   src/assets/projects/<anchorId>-<slug>/   e.g. src/assets/projects/mtn-0-spiralpanels/
// and they attach automatically to that anchor's tag — no code change needed.
// vite-imagetools downscales + re-encodes each source to optimized WebP at
// build/dev time (originals stay as source): a small `thumb` for the floating
// tags and a medium `full` for the modal carousel. This is what keeps payload
// tiny even though the source photos are multi-megapixel.
const thumbModules = import.meta.glob('../assets/projects/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,avif,gif}', {
  eager: true,
  query: { format: 'webp', w: '480', quality: '70' },
  import: 'default',
})
const fullModules = import.meta.glob('../assets/projects/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,avif,gif}', {
  eager: true,
  query: { format: 'webp', w: '1400', quality: '76' },
  import: 'default',
})

// folderName -> [{ thumb, full, name }, ...] sorted by filename (natural order)
const imagesByFolder = {}
for (const [path, thumb] of Object.entries(thumbModules)) {
  const m = path.match(/\/projects\/([^/]+)\/(.+)$/)
  if (!m) continue
  ;(imagesByFolder[m[1]] ||= []).push({ path, thumb, full: fullModules[path], name: m[2] })
}
for (const folder of Object.keys(imagesByFolder)) {
  imagesByFolder[folder] = imagesByFolder[folder]
    .sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }))
    .map(({ thumb, full, name }) => ({ thumb, full, name }))
}

// match an anchor id to its media folder: exact (`whale`) or `<id>-<slug>` (`mtn-0-spiralpanels`)
function imagesForAnchor(id) {
  const folder = Object.keys(imagesByFolder).find((f) => f === id || f.startsWith(id + '-'))
  return folder ? imagesByFolder[folder] : []
}

// ── CROP TOGGLE ─────────────────────────────────────────────────────────────
// Tags always crop to fill. In the MODAL, every image defaults to 'contain'
// (whole image shown, letterboxed on paper — nothing cut off). To make a
// specific image crop-to-fill instead, list it here by anchor id and its
// position in the carousel (1-based, the same order you see in the tag).
//   'cover'   = crop to fill (no letterbox)
//   'contain' = show the whole image (default)
// Examples:
//   'mtn-0': { 3: 'cover' }            // SpiralPanels, 3rd image → crop
//   'whale': { 1: 'cover', 2: 'cover' }
//   'isl-2': { all: 'cover' }          // every image in CSCC → crop
// Anchor ids: mtn-0..3 (Env), twr-0..3 (Policy), isl-0..3 (Edu),
//             shp-0..2 (Activities), whale (Awards).
const MODAL_FIT_DEFAULT = 'contain'
const MODAL_FIT = {
  // add overrides here
}

function fitFor(anchorId, index1) {
  const p = MODAL_FIT[anchorId] || {}
  return p[index1] || p.all || MODAL_FIT_DEFAULT
}

export function projectFor(anchor) {
  const c = CONTENT[anchor.id] || { title: anchor.title, blurb: 'Coming soon.' }
  const images = imagesForAnchor(anchor.id).map((f, i) => ({
    thumb: f.thumb,
    full: f.full,
    fit: fitFor(anchor.id, i + 1),
  }))
  return {
    id: anchor.id,
    group: anchor.group,
    category: CATEGORY[anchor.group] || '',
    title: c.title,
    blurb: c.blurb,
    images,
    frames: images.length || FRAMES[anchor.group] || 3,
  }
}
