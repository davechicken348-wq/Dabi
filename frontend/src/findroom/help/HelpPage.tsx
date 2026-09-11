import { Link } from 'react-router-dom';
import { FindRoomShell } from '../components/FindRoomShell/FindRoomShell';
import './HelpPage.css';

const helpCards = [
  {
    title: 'Explore quickly',
    description: 'Start with Explore, Locations, or the map to discover rooms in the areas that interest you.',
    action: { label: 'Open explore', to: '/findroom/explore' },
  },
  {
    title: 'Browse by area',
    description: 'Use the Locations page to compare hostels and room options by neighbourhood before you enquire.',
    action: { label: 'Browse locations', to: '/findroom/locations' },
  },
  {
    title: 'Track your enquiries',
    description: 'Keep an eye on every room you have asked about from the My Enquiries page.',
    action: { label: 'View enquiries', to: '/findroom/enquiries' },
  },
];

const steps = [
  {
    title: 'Explore the options',
    text: 'Visit Explore, Map, or Rooms to see the hostels and room types currently available.',
  },
  {
    title: 'Narrow by location',
    text: 'Use Locations to focus on the area you want, then compare the accommodation and prices in that neighbourhood.',
  },
  {
    title: 'Ask about a room',
    text: 'When you find a room you like, send an enquiry and Dabi will connect you with the accommodation provider.',
  },
];

const faq = [
  {
    question: 'How do I find rooms in a specific area?',
    answer: 'Use the Locations page and select an area from the list to see the hostels and room options available there.',
  },
  {
    question: 'Can I look at rooms without searching?',
    answer: 'Yes. Open the Rooms page to browse all room options, or use the map for a visual overview of hostels by area.',
  },
  {
    question: 'How do I enquire about a room?',
    answer: 'Open a room card or details page, then use the Enquire button to send your request to the provider.',
  },
  {
    question: 'What if I am not sure where to start?',
    answer: 'Start on the FindRoom home page, where you can jump to Explore, Locations, Map, Rooms, or My Enquiries.',
  },
];

export default function HelpPage() {
  return (
    <FindRoomShell>
      <div className="findroom-help">
        <header className="findroom-help-header">
          <p className="findroom-help-eyebrow">FindRoom support</p>
          <h1>How to search for accommodation</h1>
          <p>
            FindRoom is designed for students to explore hostel options, compare rooms,
            and send enquiries quickly. Use the steps below to move from browsing to
            booking the right space.
          </p>
        </header>

        <section className="findroom-help-grid" aria-label="FindRoom shortcuts">
          {helpCards.map((card) => (
            <article key={card.title} className="findroom-help-card">
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <Link to={card.action.to} className="findroom-help-link">
                {card.action.label} →
              </Link>
            </article>
          ))}
        </section>

        <section className="findroom-help-steps" aria-label="How to use FindRoom">
          {steps.map((step, index) => (
            <div key={step.title} className="findroom-help-step">
              <span className="findroom-help-step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="findroom-help-faq" aria-label="Frequently asked questions">
          <h2>Frequently asked questions</h2>
          <div className="findroom-help-faq-list">
            {faq.map((item) => (
              <div key={item.question} className="findroom-help-faq-item">
                <strong>{item.question}</strong>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </FindRoomShell>
  );
}
