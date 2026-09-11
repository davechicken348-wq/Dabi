import './ProductPreview.css';

interface ProductPreviewProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ProductPreview({ title, description, children }: ProductPreviewProps) {
  return (
    <section className="product-preview">
      <div className="product-preview-inner">
        <div className="product-preview-text">
          <h3 className="product-preview-title">{title}</h3>
          <p className="product-preview-desc">{description}</p>
        </div>
        <div className="product-preview-visual">
          {children}
        </div>
      </div>
    </section>
  );
}
