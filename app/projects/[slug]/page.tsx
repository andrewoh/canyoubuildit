import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { recentProjects } from '../../../data/recent-projects';
import { feedPins } from '../../feed/pins';
import { recordings, movieUrl, posterUrl } from '../../feed/recordings';
import './program.css';

type Props = { params: Promise<{ slug: string }> };

function findProject(slug: string) {
  return recentProjects.find(entry => entry.href === '/projects/' + slug && entry.preview);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = findProject((await params).slug);
  return project ? { title: project.title + ' | After Hours with Andrew Oh', description: project.summary } : {};
}

export default async function ProjectPreviewPage({ params }: Props) {
  const project = findProject((await params).slug);
  if (!project?.preview) notFound();

  const program = feedPins.find(entry => entry.href === project.href);
  const clip = program && recordings[program.id];
  const still = program?.id === 'dropalpha';
  const hasMedia = Boolean(clip || still);

  return <main className="episode-page">
    <nav aria-label="Portfolio"><a href={program ? '/#work' : '/archive#in-flight'}><ArrowLeft size={16} />
      {program ? 'Channel guide' : 'Build archive'}</a><a href="/resume">Résumé</a></nav>
    <header className="episode-mast"><div>
      <p>After Hours {program && <span>CH {program.number}</span>}</p>
      <h1>{project.title}</h1>
      <p className="episode-lead">{program?.caption ?? project.preview.detail}</p>
    </div></header>
    <div className={'episode-body' + (hasMedia ? ' with-media' : '')}>
      {hasMedia && <figure>
        {clip ? <video controls playsInline muted preload="none" aria-label={clip.description}
          width={clip.width} height={clip.height} poster={posterUrl(clip)} src={movieUrl(clip)} /> :
          <img src="/feed/media/dropalpha-native.webp" alt={program!.alt} width="390" height="570"/>}
        <figcaption>{clip ? clip.label + ' · ' + clip.seconds + 's' : 'Example data'}</figcaption>
      </figure>}
      <div className="episode-notes">
        <h2>{program ? 'Program notes' : project.preview.eyebrow}</h2>
        <p>{program?.story ?? project.summary}</p>
        {program && <p>{program.decision}</p>}
      </div>
    </div>
  </main>;
}
