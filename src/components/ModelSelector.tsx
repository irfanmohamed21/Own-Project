import type { ASRModel } from "@/types/asr";

const MODELS: Array<{ key: ASRModel; label: string }> = [
  { key: "tiny", label: "Tiny — Fastest" },
  { key: "base", label: "Base — Balanced" },
  { key: "small", label: "Small — Better accuracy" },
  { key: "medium", label: "Medium — High accuracy" },
];

type ModelSelectorProps = {
  value: ASRModel;
  onChange: (model: ASRModel) => void;
};

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <label>
      <span className="field-label">Recognition model</span>
      <select
        className="field-select"
        value={value}
        onChange={(event) => onChange(event.target.value as ASRModel)}
        data-testid="select-model"
        aria-label="Recognition model"
      >
        {MODELS.map((model) => (
          <option key={model.key} value={model.key}>
            {model.label}
          </option>
        ))}
      </select>
    </label>
  );
}
