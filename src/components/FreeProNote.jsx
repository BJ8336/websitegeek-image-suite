// Consistent, upfront "what's free vs. what Pro unlocks" summary shown above
// a tool's input area — so the free/Pro line is clear before anyone starts
// using the tool, not just discovered after the fact inside an options panel.
function FreeProNote({ free, pro }) {
  return (
    <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800">
      <p>
        <span className="font-semibold">Free:</span> {free}
      </p>
      <p className="mt-1">
        <span className="font-semibold">Pro:</span> {pro}
      </p>
    </div>
  )
}

export default FreeProNote
