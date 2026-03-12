import { FONT } from "../constants/theme";

export const globalStyles = (
  <style>{`
    @import url('${FONT}');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    button, input { font-family: inherit; }
    * { scrollbar-width: none; }
    *::-webkit-scrollbar { display: none; }
    .mode-bar-scroll::-webkit-scrollbar { display: none; }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
    @keyframes toastUp { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
    @keyframes flash { 0%{opacity:.85} 100%{opacity:0} }
  `}</style>
);
