import type { ASRLanguage } from "@/types/asr";
import { LANGUAGE_OPTIONS } from "@/utils/audio";

type LanguageSelectorProps = {
  value: ASRLanguage;
  onChange: (language: ASRLanguage) => void;
};

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <label>
      <span className="field-label">Audio language</span>
      <select
        className="field-select"
        value={value}
        onChange={(event) => onChange(event.target.value as ASRLanguage)}
        data-testid="select-language"
        aria-label="Audio language"
      >
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
