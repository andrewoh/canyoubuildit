'use client';

import { useId, useLayoutEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, Check } from 'lucide-react';
import PinArt from './PinArt';
import type { FeedPin } from './pins';
import './pin-detail.css';

const DataLab = dynamic(() => import('../portfolio/DataLab'), {
  ssr: false,
  loading: () => <div className="pin-detail-loading pin-detail-loading-chart" role="status">Loading team data…</div>,
});
const DecisionLab = dynamic(() => import('../portfolio/DecisionLab'), {
  ssr: false,
  loading: () => <div className="pin-detail-loading" role="status">Loading sample notes…</div>,
});
const WardrobeCompare = dynamic(() => import('../portfolio/bencho/WardrobeCompare'), {
  ssr: false,
  loading: () => <div className="pin-detail-loading pin-detail-loading-garment" role="status">Loading garment views…</div>,
});

type PinDetailProps = {
  pin: FeedPin;
  next: FeedPin | null;
  saved: boolean;
  onSave: () => void;
  onClose: () => void;
  onNext: () => void;
  tour?: { step: number; total: number; note: string };
};

export default function PinDetail({ pin, next, saved, onSave, onClose, onNext, tour }: PinDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const backdropPress = useRef(false);
  const titleId = useId();
  const chapterId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = originalOverflow;
      const destination = opener?.isConnected
        ? opener
        : document.querySelector<HTMLElement>('main h1[tabindex="-1"], main button, main a[href]');
      destination?.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    if (dialogRef.current) dialogRef.current.scrollTop = 0;
    headingRef.current?.focus({ preventScroll: true });
  }, [pin.id]);

  function outsideDialog(x: number, y: number) {
    const box = dialogRef.current?.getBoundingClientRect();
    return box && (x < box.left || x > box.right || y < box.top || y > box.bottom);
  }

  const showsChart = pin.art === 'injury';
  const showsReview = pin.art === 'family';
  const showsGarment = pin.art === 'wardrobe';

  return (
    <dialog
      className="pin-detail"
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onPointerDown={event => {
        backdropPress.current = !!outsideDialog(event.clientX, event.clientY);
      }}
      onClick={event => {
        if (backdropPress.current && outsideDialog(event.clientX, event.clientY)) onClose();
        backdropPress.current = false;
      }}
    >
      <div className="pin-detail-toolbar">
        <button type="button" className="pin-detail-back" onClick={onClose}>
          <ArrowLeft size={19} aria-hidden="true" /> Back to feed
        </button>
        <button type="button" className="pin-detail-save" aria-pressed={saved} onClick={onSave}>
          {saved ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="pin-detail-body">
        {tour && (
          <div className="pin-detail-chapter" id={chapterId}>
            <span>Andrew’s story · {tour.step} of {tour.total}</span>
            <p>{tour.note}</p>
          </div>
        )}
        <div className="pin-detail-spread">
          <div className="pin-detail-story">
            <p className="pin-detail-byline">{pin.project} <span aria-hidden="true">·</span> {pin.board}</p>
            <h2 ref={headingRef} id={titleId} tabIndex={-1} aria-describedby={tour ? chapterId : undefined}>{pin.title}</h2>
            <p>{pin.story}</p>
            <p>{pin.decision}</p>
            <a className="pin-detail-source" href={pin.href}>
              {pin.action} <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="pin-detail-art">
            {showsGarment ? <WardrobeCompare /> : <PinArt pin={pin} />}
          </div>
        </div>

        {showsChart && (
          <section className="pin-detail-experiment" aria-label="Compare NFL teams">
            <h3>Compare teams</h3>
            <DataLab key={pin.id} />
          </section>
        )}
        {showsReview && (
          <section className="pin-detail-experiment" aria-label="Sample Family OS workflow">
            <h3>Try a sample note</h3>
            <DecisionLab key={pin.id} />
          </section>
        )}

        {next && (
          <button type="button" className="pin-detail-next" onClick={onNext}>
            <span><small>{tour ? 'Continue the story' : 'Next pin'}</small><strong>{next.title}</strong></span>
            <ArrowRight size={24} aria-hidden="true" />
          </button>
        )}
        {tour && !next && (
          <button type="button" className="pin-detail-next" onClick={onClose}>
            <strong>Back to feed</strong><ArrowLeft size={24} aria-hidden="true" />
          </button>
        )}
      </div>
    </dialog>
  );
}
