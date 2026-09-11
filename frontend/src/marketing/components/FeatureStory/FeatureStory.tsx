import { SectionHeading } from '../SectionHeading/SectionHeading';
import './FeatureStory.css';

interface FeatureStoryProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  reverse?: boolean;
}

export function FeatureStory({ eyebrow, title, description, image, reverse }: FeatureStoryProps) {
  return (
    <section className="feature-story">
      <div className={`feature-story-inner ${reverse ? 'feature-story-reverse' : ''}`}>
        <div className="feature-story-text animate-fade-in-up">
          <SectionHeading eyebrow={eyebrow} title={title} align="left" />
          <p className="feature-story-desc">{description}</p>
        </div>
        <div className="feature-story-image animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="feature-story-image-inner" style={{ backgroundImage: `url(${image})` }} />
        </div>
      </div>
    </section>
  );
}
