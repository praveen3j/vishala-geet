import { TABS } from "../constants.js";

export default function Tabs({ activeTab, onChange }) {
  return (
    <nav className="tabs" aria-label="Song index sections">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className="tab-button"
          type="button"
          data-tab={tab.id}
          aria-label={tab.ariaLabel}
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
