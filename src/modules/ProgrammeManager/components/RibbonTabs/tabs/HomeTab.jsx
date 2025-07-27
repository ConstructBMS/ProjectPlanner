import React from 'react';

const Section = ({ title, children }) => (
  <div className='bg-white border rounded shadow-sm p-2 w-48 min-h-[100px]'>
    <div className='text-xs font-semibold border-b mb-1'>{title}</div>
    <div className='text-xs text-gray-700'>{children}</div>
  </div>
);

export default function HomeTab() {
  return (
    <div className='flex flex-wrap gap-3 text-xs'>
      <Section title='Clipboard'>
        Paste
        <br />
        Cut • Copy
      </Section>

      <Section title='Font'>
        Bold • Italic • Underline
        <br />
        Font Size ⬇️
        <br />
        Colour ▓
      </Section>

      <Section title='Schedule'>
        Constraint Flag • Add/Delete Links
        <br />
        Auto Reschedule
      </Section>

      <Section title='Hierarchy'>
        Move Bars into Chart
        <br />
        Summarise • Show To Level ⬇️
      </Section>

      <Section title='Task'>
        Make Into ⬇️
        <br />
        Assign ⬇️
        <br />
        Split/Join
      </Section>

      <Section title='Insert'>
        Bar • Hammock
        <br />
        Recurring Task
        <br />
        Text Annotation
      </Section>

      <Section title='Progress'>
        Project Report ⬇️
        <br />
        Enter Progress ⬇️
        <br />
        Transfer Progress
      </Section>

      <Section title='Editing'>
        ❌ • 🧍‍♂️ • 🔍
        <br />
        Track • Select • Edit
      </Section>
    </div>
  );
}
