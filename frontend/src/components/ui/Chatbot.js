import React, { useEffect, useRef } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import clsx from 'clsx';

const FAQ = [
  {
    id: 'q-sos-trigger',
    q: 'How do I trigger SOS?',
    a: 'Go to the Elder dashboard and press the big red SOS button. Caregivers receive an instant alert.'
  },
  {
    id: 'q-sos-cancel',
    q: 'How do I cancel an SOS?',
    a: 'If sent by mistake, open the active emergency and mark it as resolved. Caregivers will see the update.'
  },
  {
    id: 'q-who-alerted',
    q: 'Who gets alerted during SOS?',
    a: 'All caregivers connected to the elder account get notified in real time.'
  },
  {
    id: 'q-med-add',
    q: 'How to add a medication?',
    a: 'Open the Medications tab, click Add, then set name, dosage, frequency and time. Save to enable reminders.'
  },
  {
    id: 'q-med-reminders',
    q: 'How do reminders work?',
    a: 'At the scheduled time, a notification appears. Mark as Taken or Missed to log adherence.'
  },
  {
    id: 'q-login-demo',
    q: 'What are demo logins?',
    a: 'Elder: elder@demo.com / demo123. Caregiver: caregiver@demo.com / demo123.'
  },
  {
    id: 'q-notifications',
    q: 'Are notifications real-time?',
    a: 'Yes. The app uses WebSockets to deliver live updates for SOS and medication events.'
  }
];

export default function Chatbot() {
  const { isOpen, toggle, messages, setMessages } = useChatbot();
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const ask = (item) => {
    const now = Date.now();
    const userMsg = { id: `u-${now}-${item.id}`, role: 'user', text: item.q };
    const botMsg = { id: `b-${now}-${item.id}`, role: 'bot', text: item.a };
    // Append Q->A pair to current session thread
    setMessages([...messages, userMsg, botMsg]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggle}
        className={clsx(
          'rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
          'transition transform',
          'w-14 h-14 flex items-center justify-center',
          isOpen ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
        aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      >
        {isOpen ? '×' : '🤖'}
      </button>

      {isOpen && (
        <div className="mt-3 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="font-semibold">Assistant</div>
            <button className="text-sm text-gray-500 hover:text-gray-700" onClick={toggle}>Close</button>
          </div>

          <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={clsx('max-w-[85%] px-3 py-2 rounded-lg', msg.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'mr-auto bg-white border border-gray-200') }>
                <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
              </div>
            ))}

            <div className="pt-2">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Common questions</div>
              <div className="flex flex-wrap gap-2">
                {FAQ.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => ask(item)}
                    className="text-left px-3 py-2 text-sm rounded-md bg-white border border-gray-200 hover:bg-gray-100"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* No typing area; purely clickable FAQ */}
          <div className="p-2 border-t border-gray-200 text-xs text-gray-500">
            Click a question to see the answer.
          </div>
        </div>
      )}
    </div>
  );
}


