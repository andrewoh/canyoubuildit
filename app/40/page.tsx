import type { Metadata } from "next";
import styles from "./birthday.module.css";

const tournamentUrl = "https://andrew-forty-at-the-plate.andrew-o.chatgpt.site";

export const metadata: Metadata = {
  title: "Forty at the Plate · Andrew’s 40th",
  description: "The game-day home for Andrew’s 40th: team lineups, schedules, live scores, pitching grips, and birthday house rules.",
  alternates: { canonical: "https://www.canyoubuildit.com/40" },
  openGraph: {
    title: "Forty at the Plate · Andrew’s 40th",
    description: "Four teams. One birthday. Follow the schedule and keep the live scoreboard moving.",
    url: "https://www.canyoubuildit.com/40",
    images: [{ url: `${tournamentUrl}/images/ballpark-hero.webp`, width: 1672, height: 941, alt: "Wiffle ball and bat at the ballpark" }],
  },
};

export default function BirthdayPage() {
  return (
    <main className={styles.page} aria-label="Andrew’s 40th birthday tournament">
      <a className={styles.directLink} href={tournamentUrl} target="_blank" rel="noreferrer">Open the birthday tournament in a separate tab</a>
      <iframe
        className={styles.tournament}
        title="Forty at the Plate: teams, schedule, live scores, and pitching guide"
        src={tournamentUrl}
        loading="eager"
        allowFullScreen
      />
    </main>
  );
}
