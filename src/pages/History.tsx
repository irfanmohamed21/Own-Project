import { useEffect, useState } from "react";
import { AudioLines, ArrowUpRight, Clock3, FileAudio2, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { PageMeta } from "@/components/PageMeta";
import { readHistory, writeHistory } from "@/utils/history";
import type { TranscriptionRecord } from "@/types/asr";

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function History() {
  const [records, setRecords] = useState<TranscriptionRecord[]>([]);
  useEffect(() => { setRecords(readHistory()); }, []);
  function remove(id: string) { const next = records.filter((entry) => entry.id !== id); setRecords(next); writeHistory(next); }
  function open(record: TranscriptionRecord) {
    try { localStorage.setItem("asr-tool-open-record", JSON.stringify(record)); }
    catch { /* Navigation still works; result can be reopened after storage is available. */ }
  }
  return <><PageMeta title="History" description="Review, reopen, and remove transcriptions saved in this browser."/>
    <div className="page-wrap">
      <div className="page-heading"><div><div className="eyebrow">Your browser / Saved results</div><h1>Transcription history.</h1><p className="page-lede">Results are kept on this device in local storage. Audio files are not saved to your history.</p></div></div>
      <div className="history-list" data-testid="history-list">
        {records.length ? records.map((record) => <article className="panel history-item" key={record.id} data-testid={`history-record-${record.id}`}>
          <div className="history-icon"><FileAudio2 size={18}/></div>
          <div className="history-details"><div className="history-name" title={record.filename} data-testid={`text-history-filename-${record.id}`}>{record.filename}</div>
            <div className="history-excerpt">{record.transcript}</div><div className="history-date"><Clock3 size={11} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }}/>{dateLabel(record.createdAt)} · {record.detectedLanguage} · {record.model}</div>
          </div>
          <div className="history-actions">
            <Link href="/" onClick={() => open(record)} className="btn btn-secondary" data-testid={`button-open-record-${record.id}`}><ArrowUpRight size={14}/>Open</Link>
            <button className="btn btn-quiet btn-danger" aria-label={`Delete ${record.filename}`} onClick={() => remove(record.id)} data-testid={`button-delete-record-${record.id}`}><Trash2 size={15}/></button>
          </div>
        </article>) : <div className="panel empty-card" data-testid="empty-history">
          <AudioLines size={25} style={{ color: "hsl(var(--primary))" }}/><h2>No saved transcripts</h2><p>Transcriptions you complete will be listed here on this device.</p><Link href="/" className="btn btn-primary" data-testid="link-start-transcribing">Start transcribing</Link>
        </div>}
      </div>
    </div>
  </>;
}
